'use strict';


/**
 * =================================================================================
 * This script is here for debugging only.
 * Once it all checks out here, copy this into the javascript.html file.
 * =================================================================================
 */


/**
 * Reverses a string
 * @return {String} A reversed string
 */
String.prototype.reverse = function() {
    return this.split('').reverse().join('');
};

/**
 * Slices a string from start index to end index with a step
 * @param  {[type]} startIndex [description]
 * @param  {[type]} endIndex   [description]
 * @param  {[type]} step       [description]
 * @return {[type]}            [description]
 */
String.prototype.slice = function(startIndex, endIndex, step) {
    var result = '';
    if (!endIndex && !step) {
        return this.charAt(startIndex);
    }

    if (!endIndex) {
        endIndex = this.length;
    }
    if (!step) {
        step = 1;
    }
    if (startIndex < endIndex && step < 0 || startIndex > endIndex && step > 0 || step === 0) {
        throw ('indexes are wrong');
    }

    for (var i = startIndex; i !== endIndex; i += step) {
        result += this.charAt(i);
    }
    return result;
};

/**
 * Decrypt Youtube Signature
 * @param {[type]} a [description]
 */

function XD(a, b) {
    var c = a[0];
    a[0] = a[b % a.length];
    a[b] = c;
    return a;
}

function WD(a) {
    a = a.split('');
    a = a.reverse();
    a = a.slice(1);
    a = a.reverse();
    a = a.slice(3);
    a = XD(a, 19);
    a = a.reverse();
    a = XD(a, 35);
    a = XD(a, 61);
    a = a.slice(2);
    return a.join('');
}

function queryStringToHash(query) {
    var queryString = {};
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        pair[0] = decodeURIComponent(pair[0]);
        pair[1] = decodeURIComponent(pair[1]);
        // If first entry with this name
        if (typeof queryString[pair[0]] === 'undefined') {
            queryString[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof queryString[pair[0]] === 'string') {
            var arr = [queryString[pair[0]], pair[1]];
            queryString[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            queryString[pair[0]].push(pair[1]);
        }
    }
    return queryString;
}

function findUrl(fmtStreams, quality) {
    var bestQualityFound = 18;
    var url;
    for (var i = 0; i < fmtStreams.length; ++i) {
        var fmtStream = queryStringToHash(fmtStreams[i]);

        if (fmtStream.itag <= quality && fmtStream.itag >= bestQualityFound && fmtStream.type.indexOf('video/mp4') !== -1) {
            bestQualityFound = fmtStream.itag;
            if (fmtStream.url.indexOf('signature=') !== -1) {
                url = fmtStream.url;
            } else {
                url = fmtStream.url + '&signature=' + WD(fmtStream.s);
            }
        }
    }
    return url;
}

function getUrl(html, quality) {
    if (!quality) {
        quality = 18;
    }
    // var myRegexp = new RegExp('ytplayer\.config = (.*?);<\/script>', 'gi');
    var myRegexp = new RegExp('ytplayer\.config = (.*?);', 'gi');
    var match = myRegexp.exec(html);

    var jsonString = match[1];
    // var config = 'cats';
    // var cats = JSON.parse('{"test": "yes"}');
    // console.log('jsonString', jsonString);
    var config = JSON.parse(jsonString);
    var fmtStreams = config.args['url_encoded_fmt_stream_map'].split(',');
    return findUrl(fmtStreams, quality);
}



var html = '<script>var ytplayer = ytplayer || {};ytplayer.config = {"attrs": {"id": "movie_player"}, "html5": true, "url": "https:\/\/s.ytimg.com\/yts\/swfbin\/player-vflu1MO2p\/watch_as3.swf", "min_version": "8.0.0", "args": {"user_display_image": "https:\/\/yt3.ggpht.com\/-CAlAM6hJa5o\/AAAAAAAAAAI\/AAAAAAAAAAA\/sNC_C8X8eRA\/s28-c-k-no\/photo.jpg", "cos": "Mac", "plid": "AAT3nZxgpjz9id5B", "authuser": 1, "eventid": "tCtWU5-IEZWk4AKl1ILgCQ", "user_age": 26, "cc_module": "https:\/\/s.ytimg.com\/yts\/swfbin\/player-vflu1MO2p\/subtitle_module.swf", "ldpj": "-6", "dashmpd": "https:\/\/manifest.googlevideo.com\/api\/manifest\/dash\/requiressl\/yes\/playback_host\/r3---sn-xmxuxa-coxe.googlevideo.com\/ip\/58.96.54.36\/key\/yt5\/ipbits\/0\/mv\/m\/mws\/yes\/source\/youtube\/sparams\/as%2Ccmbypass%2Cid%2Cip%2Cipbits%2Citag%2Cplayback_host%2Crequiressl%2Csource%2Cexpire\/ms\/au\/id\/o-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne\/cmbypass\/yes\/itag\/0\/signature\/D027F65B4A51FAD12075DCE89D3A6FBA3E5CCBB7.C578FD97E7FE1BE0A05F1224B5E27917255196AA\/mt\/1398156164\/expire\/1398179436\/sver\/3\/fexp\/947335%2C909708%2C902409%2C910207%2C945811%2C916611%2C934207%2C937417%2C913434%2C936916%2C934022%2C936923%2C3300072%2C3300113%2C3300130%2C3300137%2C3300161%2C3310625%2C3310649%2C3312045\/as\/fmp4_audio_clear%2Cwebm_audio_clear%2Cfmp4_sd_hd_clear%2Cwebm_sd_hd_clear\/upn\/gmNHYP7H_EE", "adaptive_fmts": "url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3Dizce4JAgZ0o%26mws%3Dyes%26gir%3Dyes%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26dur%3D261.262%26mv%3Dm%26lmt%3D1395527560193734%26source%3Dyoutube%26sparams%3Dclen%252Cdur%252Cgir%252Cid%252Cip%252Cipbits%252Citag%252Clmt%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26clen%3D61026107%26itag%3D136%26signature%3DBC70290C2D517BDFFDD17230EF632B2970FF105F.73DD8B04361C6F46B9214F12E458DE894B3789E9%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026type=video%2Fmp4%3B+codecs%3D%22avc1.4d401f%22\u0026init=0-708\u0026itag=136\u0026size=1280x720\u0026bitrate=2214109\u0026index=709-1376,url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3Dizce4JAgZ0o%26mws%3Dyes%26gir%3Dyes%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26dur%3D261.262%26mv%3Dm%26lmt%3D1395527517536286%26source%3Dyoutube%26sparams%3Dclen%252Cdur%252Cgir%252Cid%252Cip%252Cipbits%252Citag%252Clmt%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26clen%3D27438515%26itag%3D135%26signature%3D1B3E8C659D2D1A0257DDFD2F7C75D1693DBD84D3.42B29F41895E1C7ABF4CC0C08E29682422C11F8C%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026type=video%2Fmp4%3B+codecs%3D%22avc1.4d401f%22\u0026init=0-712\u0026itag=135\u0026size=854x480\u0026bitrate=1107783\u0026index=713-1380,url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3Dizce4JAgZ0o%26mws%3Dyes%26gir%3Dyes%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26dur%3D261.262%26mv%3Dm%26lmt%3D1395527479317689%26source%3Dyoutube%26sparams%3Dclen%252Cdur%252Cgir%252Cid%252Cip%252Cipbits%252Citag%252Clmt%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26clen%3D13796498%26itag%3D134%26signature%3DCCF40BD7D67856F669FE43F6C7D21F32F777EE11.AFC24BA4ADE3F530F38FA00796CD854E4167F8A0%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026type=video%2Fmp4%3B+codecs%3D%22avc1.4d401e%22\u0026init=0-708\u0026itag=134\u0026size=640x360\u0026bitrate=604534\u0026index=709-1376,url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3Dizce4JAgZ0o%26mws%3Dyes%26gir%3Dyes%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26dur%3D261.262%26mv%3Dm%26lmt%3D1395527477820840%26source%3Dyoutube%26sparams%3Dclen%252Cdur%252Cgir%252Cid%252Cip%252Cipbits%252Citag%252Clmt%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26clen%3D8003800%26itag%3D133%26signature%3D0DC9ECE149066D4F8C42E44B8B17932D2B071322.BBAC63F2AE61902184A444C6C0B2E5A28B57B3F5%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026type=video%2Fmp4%3B+codecs%3D%22avc1.4d4015%22\u0026init=0-676\u0026itag=133\u0026size=426x240\u0026bitrate=251696\u0026index=677-1344,url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3Dizce4JAgZ0o%26mws%3Dyes%26gir%3Dyes%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26dur%3D261.262%26mv%3Dm%26lmt%3D1395527474917338%26source%3Dyoutube%26sparams%3Dclen%252Cdur%252Cgir%252Cid%252Cip%252Cipbits%252Citag%252Clmt%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26clen%3D3673151%26itag%3D160%26signature%3D053A4E5A2E7E7594B45742116D1384420DBF930B.0EB5A29B8AEF03306721A76DF79D3E5917B4C641%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026type=video%2Fmp4%3B+codecs%3D%22avc1.4d400c%22\u0026init=0-671\u0026itag=160\u0026size=256x144\u0026bitrate=127864\u0026index=672-1339,url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3Dizce4JAgZ0o%26mws%3Dyes%26gir%3Dyes%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26dur%3D261.363%26mv%3Dm%26lmt%3D1395527463316893%26source%3Dyoutube%26sparams%3Dclen%252Cdur%252Cgir%252Cid%252Cip%252Cipbits%252Citag%252Clmt%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26clen%3D4151700%26itag%3D140%26signature%3DD4D206CA83E4F2E07BB12A2AB3389C6CE44F0D08.22C3897FAE68EB2313AD2102E5F69ED6C0972D85%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026type=audio%2Fmp4%3B+codecs%3D%22mp4a.40.2%22\u0026init=0-591\u0026itag=140\u0026bitrate=127800\u0026index=592-947", "enablecsi": "1", "c": "WEB", "sendtmp": "1", "user_display_name": "DelphicExpanse", "watermark": ",https:\/\/s.ytimg.com\/yts\/img\/watermark\/youtube_watermark-vflHX6b6E.png,https:\/\/s.ytimg.com\/yts\/img\/watermark\/youtube_hd_watermark-vflAzLcD6.png", "ssl": 1, "title": "Prague 1 - Craig and Maddie\'s European Adventure #9", "cc_asr": 1, "loaderUrl": "https:\/\/www.youtube.com\/watch?v=4USKKzDyWmM", "watch_ajax_token": "QUFFLUhqa3JRa3B4TklFNDNNOWxDanlYYllJMGpBaFc5d3xBQ3Jtc0tuU1NnN3NxMDFwMGpaN3NqVEJ5TU9ZR0MxcjViMHFoTElfYUFLbG5Ibmo5NkRSZG1nR0doYzI2cGhVc2lRZ19PM1ZvRDF0dEotTXFPUnl5TTY4clNpRkl1eVlNNGxEZmYyNkRacEVrdi1HN1VtejZZdw==", "timestamp": 1398156212, "enablejsapi": 1, "fexp": "947335,909708,902409,910207,945811,916611,934207,937417,913434,936916,934022,936923,3300072,3300113,3300130,3300137,3300161,3310625,3310649,3312045", "idpj": "-5", "ttsurl": "https:\/\/www.youtube.com\/api\/timedtext?signature=60EC47018B4C80BBEE9BBD3322152C6715572F5C.D3CB76B9BF441CA768F98CC08A687E9BEA935EFE\u0026hl=en_US\u0026asr_langs=ja%2Cko%2Cru%2Cen%2Cpt%2Cde%2Cfr%2Cnl%2Ces%2Cit\u0026expire=1398181412\u0026sparams=asr_langs%2Ccaps%2Cv%2Cexpire\u0026v=4USKKzDyWmM\u0026caps=asr\u0026key=yttt1", "video_id": "4USKKzDyWmM", "atc": "a=2\u0026b=DhFoQ7cLha7nH76TQDejjiOUfoA\u0026c=1398156212\u0026d=1\u0026e=4USKKzDyWmM\u0026c3a=21\u0026c1a=1\u0026hh=08TfNBgADxBQjYoxGi8-lQmMoAg", "allow_embed": 1, "t": "vjVQa1PpcFNXfjv9n6sVi_hztZ92l-xvPPjWvpw4M0k=", "cbr": "Chrome", "length_seconds": 262, "hl": "en", "vq": "medium", "host_language": "en", "account_playback_token": "QUFFLUhqbXoza3h5VzlQLU5iT01ubjdsT1FCMWIxXzVSZ3xBQ3Jtc0ttM3N6Y2lQQUx2RnVXNG50WUcxdk9pd2NZWU0zMWhqZU4xM0FwRUV0N0ZUNWxWRGNxQmViN1hoejY1eGU4aVdzNTg2dU1icHc0dnU5c21zYk1VQ3hpWElhRW01TXk2OUtDQ3Njcmh6VWdSMXM3Sm5iZw==", "referrer": null, "storyboard_spec": "https:\/\/i1.ytimg.com\/sb\/4USKKzDyWmM\/storyboard3_L$L\/$N.jpg|48#27#100#10#10#0#default#ta6o4VSfj5CxkQ9dXWbirQkV7Ms|80#45#132#10#10#2000#M$M#-VdNgpTaapji7610mjos87Wfduk|160#90#132#5#5#2000#M$M#in244heRNGcUAJuF6r1MRxpsVPI", "csi_page_type": "watch,watch7_html5", "logwatch": "1", "url_encoded_fmt_stream_map": "fallback_host=tc.v1.cache7.googlevideo.com\u0026itag=22\u0026url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3DVOGPMDCA214%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26ratebypass%3Dyes%26mv%3Dm%26mws%3Dyes%26source%3Dyoutube%26sparams%3Did%252Cip%252Cipbits%252Citag%252Cratebypass%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26itag%3D22%26signature%3DB83E6ADD9A4F98D9FA94BAA9D966AC76CA74BF96.0584BD3FCF1411274E5D332710912706EB6611AF%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026quality=hd720\u0026type=video%2Fmp4%3B+codecs%3D%22avc1.64001F%2C+mp4a.40.2%22,fallback_host=tc.v20.cache5.googlevideo.com\u0026itag=43\u0026url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3DVOGPMDCA214%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26ratebypass%3Dyes%26mv%3Dm%26mws%3Dyes%26source%3Dyoutube%26sparams%3Did%252Cip%252Cipbits%252Citag%252Cratebypass%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26itag%3D43%26signature%3D0F91CEA3D4F6CF897987C0BC0E27D8D656B9EA75.E44AB7B2E066D598CFAD32D95C19E1842AFB348C%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026quality=medium\u0026type=video%2Fwebm%3B+codecs%3D%22vp8.0%2C+vorbis%22,fallback_host=tc.v22.cache3.googlevideo.com\u0026itag=18\u0026url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3DVOGPMDCA214%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26ratebypass%3Dyes%26mv%3Dm%26mws%3Dyes%26source%3Dyoutube%26sparams%3Did%252Cip%252Cipbits%252Citag%252Cratebypass%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26itag%3D18%26signature%3DBD0E29F03897E498363991242CDAA2B0EC4A8D98.05E8945F2B92751116E3F91AB791B18B678892A9%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026quality=medium\u0026type=video%2Fmp4%3B+codecs%3D%22avc1.42001E%2C+mp4a.40.2%22,fallback_host=tc.v7.cache7.googlevideo.com\u0026itag=5\u0026url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3DVOGPMDCA214%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26mv%3Dm%26mws%3Dyes%26source%3Dyoutube%26sparams%3Did%252Cip%252Cipbits%252Citag%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26itag%3D5%26signature%3D65F13A4357B7136A3AB02BB67B58ED3D8A6FBDD6.3EBF210449C787368C293E16107876026F3B4B64%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026quality=small\u0026type=video%2Fx-flv,fallback_host=tc.v6.cache1.googlevideo.com\u0026itag=36\u0026url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3DVOGPMDCA214%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26mv%3Dm%26mws%3Dyes%26source%3Dyoutube%26sparams%3Did%252Cip%252Cipbits%252Citag%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26itag%3D36%26signature%3D6E1DBDEB6DB284D3E97E7844E4B95662E367A5D6.C3E4DF18856EEB480E4108B34EBADCDAD4539434%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026quality=small\u0026type=video%2F3gpp%3B+codecs%3D%22mp4v.20.3%2C+mp4a.40.2%22,fallback_host=tc.v17.cache1.googlevideo.com\u0026itag=17\u0026url=https%3A%2F%2Fr3---sn-xmxuxa-coxe.googlevideo.com%2Fvideoplayback%3Frequiressl%3Dyes%26upn%3DVOGPMDCA214%26ip%3D58.96.54.36%26key%3Dyt5%26ipbits%3D0%26mv%3Dm%26mws%3Dyes%26source%3Dyoutube%26sparams%3Did%252Cip%252Cipbits%252Citag%252Crequiressl%252Csource%252Cupn%252Cexpire%26ms%3Dau%26id%3Do-ALaRr_m93vSZSx0mrvhXXIPc_ErI0dipDN25wSMBgYne%26itag%3D17%26signature%3D648EEAF60491EF5CBADA7CAAF4C31F402E9139D0.108F5DD74B0F5779D2C13024C813464B18982E43%26mt%3D1398156164%26expire%3D1398179436%26sver%3D3%26fexp%3D947335%252C909708%252C902409%252C910207%252C945811%252C916611%252C934207%252C937417%252C913434%252C936916%252C934022%252C936923%252C3300072%252C3300113%252C3300130%252C3300137%252C3300161%252C3310625%252C3310649%252C3312045\u0026quality=small\u0026type=video%2F3gpp%3B+codecs%3D%22mp4v.20.3%2C+mp4a.40.2%22", "pageid": "112784856809112330579", "cosver": "10_9_2", "cbrver": "34.0.1847.116", "keywords": "Travel,prague,czech republic", "cc_font": "Arial Unicode MS, arial, verdana, _sans", "pltype": "contentugc", "fmt_list": "22\/1280x720\/9\/0\/115,43\/640x360\/99\/0\/0,18\/640x360\/9\/0\/115,5\/320x240\/7\/0\/0,36\/320x240\/99\/1\/0,17\/176x144\/99\/1\/0", "ucid": "UC0EmILUueN7UAD1j08ThazA", "rvs": "title=Dowtown%2B1+Prague+1%2F3+%28Onair+23+July+2013%29\u0026length_seconds=463\u0026id=4QI1FEWCtCI\u0026session_data=feature%3Dendscreen\u0026author=Starting+Dowtown\u0026view_count=350,title=Norman+Finkelstein+in+Praha+%28Prague%29+1+of+8\u0026length_seconds=600\u0026id=q6XR0kv4y64\u0026session_data=feature%3Dendscreen\u0026author=LSRochon\u0026view_count=599,title=Prague+-++top+10+things+to+do+and+see+in+the+city\u0026length_seconds=262\u0026id=Z4pCJrYAYGY\u0026session_data=feature%3Dendscreen\u0026author=Vidtur\u0026view_count=113%2C157,title=Pr%C3%A1ga+1.+%C3%93v%C3%A1ros%2C+-+Prague%2C+Praha+Star%C3%A9+m%C4%9Bsto\u0026length_seconds=466\u0026id=QXrywMiNCMA\u0026session_data=feature%3Dendscreen\u0026author=demjengi\u0026view_count=240,title=Prague+Adventures+-+Episode+One\u0026length_seconds=334\u0026id=fltFatkcNPA\u0026session_data=feature%3Dendscreen\u0026author=Nathan+McKenzie\u0026view_count=61,title=Prague-1\u0026length_seconds=934\u0026id=t_4E98lE_IA\u0026session_data=feature%3Dendscreen\u0026author=denniscallan\u0026view_count=3%2C815,title=Restaurant+Samarkand%2C+ul.Ricni+1%2C+Prague+1%2A%2A%2A\u0026length_seconds=315\u0026id=qETZQDr0ZGI\u0026session_data=feature%3Dendscreen\u0026author=Samarkandrestaurant';
html += '\u0026view_count=3%2C837,title=Nigel+Farage+in+Prague+1+120618\u0026length_seconds=1190\u0026id=R_SijwQPfR8\u0026session_data=feature%3Dendscreen\u0026author=Neviditelnypes\u0026view_count=997,title=Peppa+Pig+Pizzeria+Playset+Pizza+Shop+Carry+Case+PlayDoh+Chef+Peppa+Nickelodeon+Disneycollector\u0026length_seconds=477\u0026id=hVpKBHAsbPo\u0026session_data=feature%3Dendscreen\u0026author=DisneyCollector\u0026view_count=10%2C411%2C561,title=Bali+nightlife+in+Kuta%2FLegian\u0026length_seconds=265\u0026id=KkWEzVZkp5A\u0026session_data=feature%3Dendscreen\u0026author=al+magdic\u0026view_count=89%2C766,title=The+Delivery+-+Rock%27n%27Beer+Fest+2013+-+Prague+%5B1%2F2%5D\u0026length_seconds=1290\u0026id=sWfbHdEeslU\u0026session_data=feature%3Dendscreen\u0026author=TheDeliveryOfficial\u0026view_count=261,title=Dresden+-+Berlin+-+Craig+and+Maddie%27s+European+Adventure+%238\u0026length_seconds=209\u0026id=eUA8TLXjtL0\u0026session_data=feature%3Dendscreen\u0026author=Craig+McNamara\u0026view_count=40", "cc3_module": "1", "cr": "AU", "dash": "1", "subscribed": "1", "ptk": "youtube_none"}, "params": {"allowscriptaccess": "always", "allowfullscreen": "true", "bgcolor": "#000000"}, "url_v8": "https:\/\/s.ytimg.com\/yts\/swfbin\/player-vflu1MO2p\/cps.swf", "url_v9as2": "https:\/\/s.ytimg.com\/yts\/swfbin\/player-vflu1MO2p\/cps.swf", "sts": 16177, "assets": {"js": "\/\/s.ytimg.com\/yts\/jsbin\/html5player-en_US-vflMYwWq8.js", "css": "\/\/s.ytimg.com\/yts\/cssbin\/www-player-webp-vfltVHWBg.css", "html": "\/html5_player_template"}};(function() {if (!!window.yt) {yt.player.Application.create("player-api", ytplayer.config);ytplayer.config.loaded = true;}}());</script><div id="playlist-tray" class="playlist-tray"></div>';
console.log(getUrl(html));
