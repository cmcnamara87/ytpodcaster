<?php
// Autoloads all the stuff we have brought in
// using composer (thats quite nice)
require 'vendor/autoload.php';
require 'rb.php';
require 'db/db.php';

// Register slim auto-loader
\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim(array(
	'templates.path' => './templates'
));

// find the youtube id for a username
$app->get('/channel', function () use ($app) {
	// Youtube username to search with
	$username = $app->request()->params('username');
	
	// Get the channels from youtube
	$channels = json_decode(file_get_contents("https://gdata.youtube.com/feeds/api/channels?q=$username&v=2&alt=json&max-results=5"));
	
	$results = array();
	foreach($channels->feed->entry as $entry) {
		$result = array();
		$result['name'] = $entry->author[0]->name->{'$t'};
		$result['youtube_id'] = $entry->author[0]->{'yt$userId'}->{'$t'};
		$results[] = $result;
	}
	header('Content-type: application/json');
	echo json_encode($results);
});

$app->get('/javascript', function() use ($app) {
	// Render the javascript file
	$app->render("javascript.html");
});

// find the youtube id for a username
$app->get('/rss', function () use ($app) {
	// Youtube username to search with
	$youtube_id = $app->request()->params('youtubeid');
	$quality = $app->request()->params('quality');
	
	// Look up the youtuber in our datastore
	$youtuber = R::findOne('youtuber',
        ' youtubeid = ? AND quality = ?',array($youtube_id, $quality));
    
	// If they aren't stored yet, or, its over a day old
    if(!$youtuber || $youtuber->updated < (time() - 60*60*24)) {
        
    	if(!$youtuber) {
    		// Its not stored yet, make a new one
    		$youtuber = R::dispense('youtuber');
    		$youtuber->requests = 0;
    	}

		// Get new data from youtube
    	$user_data = file_get_contents("https://gdata.youtube.com/feeds/api/users/$youtube_id?v=2&alt=json");
	
		// Get the channels from youtube
		$max_results = 50;
		$start_index = 1;
		$max = 100;
		$uploads_data = file_get_contents("https://gdata.youtube.com/feeds/api/users/$youtube_id/uploads?v=2&alt=json&orderby=published&start-index=$start_index&max-results=$max_results&orderby=published");		
		// We will append all videos to this object
		$uploads_template_object = json_decode($uploads_data);		
		
		// This one is just a throw away one so the loop can work
		$uploads_object = json_decode($uploads_data);		
		
		// If there are values, and it was the max, keep going
		while(isset($uploads_object->feed->entry) && count($uploads_object->feed->entry) == $max_results && $start_index < $max) {
			$start_index += $max_results;
			$uploads_data = @file_get_contents("https://gdata.youtube.com/feeds/api/users/$youtube_id/uploads?v=2&alt=json&orderby=published&start-index=$start_index&max-results=$max_results&orderby=published");		
			// We failed to get data, so lets just stop
			if(!$uploads_data) {
				break;
			}
			// Merge in the next lot of uploads
			$uploads_object = json_decode($uploads_data);
			if(isset($uploads_template_object->feed->entry) && isset($uploads_object->feed->entry)) {			
				$uploads_template_object->feed->entry = array_merge($uploads_template_object->feed->entry, $uploads_object->feed->entry);
			}
		}
		
		// Get the data back as a string so we can store it
		$uploads_data = json_encode($uploads_template_object);
		
		// Set it up to store it all
		$youtuber->youtubeid = $youtube_id;
		$youtuber->user = $user_data;
		$youtuber->uploads = $uploads_data;
		$youtuber->updated = time();
		$youtuber->quality = $quality;
		$id = R::store($youtuber);
    }

	$youtuber->requests = $youtuber->requests + 1;
	$id = R::store($youtuber);
				
	// Get out that json data we stored about the youtuber
	$user = json_decode($youtuber->user);	
	$uploads = json_decode($youtuber->uploads);
	
	// Feed time!
	$rss = simplexml_load_file("feed.xml");

	// Lets set all the data for the channel itself.
	$channel = $rss->channel;
	$channel->title = $uploads->feed->author[0]->name->{'$t'} . " | YTPodcaster.com";
	$channel->link = "http://youtube.com/channel/UC" . $uploads->feed->author[0]->{'yt$userId'}->{'$t'};
	$channel->copyright = "© " . $uploads->feed->author[0]->name->{'$t'} . " " . date("Y");
	$channel->subtitle = $uploads->feed->title->{'$t'};
	$channel->author = $uploads->feed->author[0]->name->{'$t'};
	$channel->summary = $user->entry->summary->{'$t'};
	$channel->description = $user->entry->summary->{'$t'};
	$channel->owner->name = $uploads->feed->author[0]->name->{'$t'};
	$channel->owner->email = $uploads->feed->author[0]->name->{'$t'} . " @ YouTube";
	$channel->image['href'] = $user->entry->{'media$thumbnail'}->url;
	
	// Items time!
	$item_text = file_get_contents("item.xml");
	
	foreach($uploads->feed->entry as $entry) {
		$video_id = $entry->{'media$group'}->{'yt$videoid'}->{'$t'};
		
		$item = simplexml_load_string($item_text);	
		$item->title = $entry->title->{'$t'};
		$item->author = $entry->author[0]->name->{'$t'};
		$item->subtitle = "";
		
		$item->summary = $entry->{'media$group'}->{'media$description'}->{'$t'};
		$item->image['href'] = $entry->{'media$group'}->{'media$thumbnail'}[3]->url;
		$item->enclosure['url'] = "http://localhost:8891/download/$quality/$video_id.mp4";
		$item->guid = "http://www.youtube.com/watch?v=$video_id&fmt=$quality";
		$item->pubDate = date('D, j M Y h:i:s', strtotime($entry->published->{'$t'}));
		$item->duration = gmdate("H:i:s", $entry->{'media$group'}->{'yt$duration'}->{'seconds'});
		
		sxml_append($channel, $item);
	}
	
	header('Content-type: text/xml');
	echo($rss->asXML());
				
});

function sxml_append(SimpleXMLElement $to, SimpleXMLElement $from) {
    $toDom = dom_import_simplexml($to);
    $fromDom = dom_import_simplexml($from);
    $toDom->appendChild($toDom->ownerDocument->importNode($fromDom, true));
}

$app->run();