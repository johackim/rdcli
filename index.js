#!/usr/bin/env node

var prompt = require('prompt');
var request = require('request');
var url = require('url');
var fs = require('fs');
var progress = require('request-progress');
var humanize = require('humanize');
var log = require('single-line-log').stdout;

const AUTH_TOKEN = "";
const PATH = "/tmp/";
const ENDPOINT = "https://api.real-debrid.com/rest/1.0";

function download(link, path, callback) {
    var file_name = url.parse(link).pathname.split('/').pop();
    var lastBytesWriting = '';

    var download = progress(request(link), {
        throttle: 2000,
        delay: 1000
    });

    console.log(link + ' -> ' + PATH + file_name);

    download.on('progress', function (state) {
        var chunkSize = state.received - lastBytesWriting;
        lastBytesWriting = state.received;

        callback({progress: {percent:state.percent, mbps: humanize.filesize(chunkSize), totalSize: humanize.filesize(state.total), bytesWriting: humanize.filesize(state.received)}});
    });
    
    download.on('error', function (err) {
        callback(err);
    });
    
    download.pipe(fs.createWriteStream(path + file_name)).on('error', function (err) {
        callback(err);
    }).on('close', function (err) {
        callback('end');
    });
}

prompt.start();
prompt.delimiter = "";
prompt.message = null;
prompt.colors = false;

const schema = {
    properties: {
        link: {
            require: true,
            description: "Link:",
            pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            message: 'Link url is invalid'
        }
    }
};

if (!AUTH_TOKEN) {
    schema.properties.token = { description: "Token:" };
}

prompt.get(schema, function (err, result) {
    request.post(ENDPOINT + "/unrestrict/link?auth_token="+ ((AUTH_TOKEN) ? AUTH_TOKEN : result.token), {form:{link:result.link}}, function (error, response, body){
        body = JSON.parse(body);

        if (body.error) {

            switch (body.error_code) {
                case 22:
                    console.log("IP Address not allowed");
                    break;
                case 16:
                    console.log("Unsupported hoster");
                    break;
                case 8:
                    console.log('Bad token, get your token API : https://real-debrid.com/apitoken')
                    break;
                case 1:
                    console.log('Missing parameter');
                    break;
                default:
                    console.log(body.error);
                    break;
            }

            return;
        };

        download(body.download, PATH, function(res){
            if (res.progress){
                log('progress: ' + res.progress.percent + "% Speed: " + res.progress.mbps + "Mbps " + res.progress.bytesWriting + "/" + res.progress.totalSize);
            }else if (res === 'end'){
                console.log('File downloaded.')
            }else{
                console.log('Error: ' + res);
            }
        });
    });
});
