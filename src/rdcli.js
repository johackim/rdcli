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
    .description('Download links, magnets and torrent files.')
    .usage('<url|magnet|torrent>')
    .action((arg) => co(function*action() {
        const api = new RealDebrid();

        const connect = function*connect() {
            const username = yield prompt('Username: ');
            const password = yield prompt.password('Password: ');
            yield api.connect(username, password);
        };

        let link;
        if (arg.match(/^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\? \.-]*)*\/?$/)) {
            yield connect();
            link = arg;
        } else if (arg.match(/^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{20,50}/i)) {
            yield connect();
            link = yield api.convertTorrent(arg);
        } else if (fs.existsSync(arg)) {
            yield connect();
            link = yield api.convertTorrent(arg);
        } else {
            console.log('Usage: rdcli <url|magnet|torrent>');
            process.exit();
        }

        const unrestrictLink = yield api.unrestrictLink(link);
        yield api.waitDuringScan(link);

        console.log(`Start download : ${link}`);
        yield api.download(unrestrictLink, (res) => {
            if (res.percent) {
                log.stdout(`Download: ${res.percent}% Speed: ${res.mbps}Mbps ${res.bytesWriting}/${res.totalSize} Remaining: ${res.remaining}sec\n`);
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
