<?php
	$passwords = json_decode(file_get_contents("db/db.pass"));

	R::setup('mysql:host=localhost;
	        dbname=' . $passwords->database->dbname, $passwords->database->username, $passwords->database->password);

