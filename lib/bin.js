#!/usr/bin/env node

var prompt = require('prompt');
var realdebrid = require('real-debrid');
var log = require('single-line-log').stdout;

var options = {
    login: "USER",
    password: "PASSWORD",
    path: getUserHome() + "/Downloads/",
    schema: {
        properties: {
            password: {
                hidden: true,
                require: true,
                description: "Password:"
            }
        }
    }
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function start() {
    args = process.argv.slice(2);

    if (!args[0]) {
        console.log('Error: link not found');
        return;
    };

    if (!options.password) {
        prompt.start();
        prompt.message = null;
        prompt.delimiter = "";
        prompt.colors = false;
        prompt.get(options.schema, function (err, res) {
            if (err) {
                console.log(err);
                return;
            };

            options.password = res.password;
            debrid(args[0]);
        });
    } else {
        debrid(args[0]);
    }
}

function getPath() {
    path = options['path'];

    if (args[1]) {
        path = args[1];
    };

    if (args[1] == ".") {
        path = process.cwd() + "/";
    }

    return path;
}

function debrid(link) {
    realdebrid.debrid(options.login, options.password, link, function(response, error){
        if(!response || error){
            console.log('Error: ' + error);
            return;
        }

        console.log('Link: '+ response.link);

        realdebrid.download(response.link, getPath(), function(res){

            if (res.progress){
                log('progress: ' + res.progress.percent + "% Speed: " + res.progress.mbps + "Mbps " + res.progress.bytesWriting + "/" + res.progress.totalSize);
            }else if (res === 'end'){
                console.log('File downloaded.')
            }else{
                console.log('Error: ' + res);
            }
        });
    });
}

start();
