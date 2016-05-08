#!/usr/bin/env node

import RealDebrid from './real-debrid';
import pjson from '../package.json';
import program from 'commander';
import prompt from 'co-prompt';
import log from 'single-line-log';
import co from 'co';
import fs from 'fs';

program
    .version(pjson.version)
    .description('Download torrent and ddl')
    .usage('<url|magnet|torrent>')
    .action((arg) => co(function*action() {
        let unrestrictLink;
        const api = new RealDebrid();

        const connect = function*connect() {
            const username = yield prompt('Username: ');
            const password = yield prompt.password('Password: ');
            yield api.connect(username, password);
        };

        if (arg.match(/^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\? \.-]*)*\/?$/)) {
            yield connect();
            unrestrictLink = yield api.unrestrictLink(arg);
        } else if (arg.match(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{20,50}/i) || fs.existsSync(arg)) {
            yield connect();
            const link = yield api.convertToDdl(arg);
            unrestrictLink = yield api.unrestrictLink(link);
        } else {
            console.log('Usage: rdcli <url|magnet|torrent>');
            process.exit();
        }

        yield api.download(unrestrictLink, (res) => {
            if (!isNaN(res.percent)) {
                log.stdout(`Download: ${res.percent}% Speed: ${res.mbps}Mbps ${res.bytesWriting}/${res.totalSize}`);
            } else if (res === 'end') {
                console.log('File downloaded.');
            } else {
                console.log(`Error: ${res}`);
            }
        });
    })).parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
