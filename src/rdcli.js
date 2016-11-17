#!/usr/bin/env node

import 'babel-polyfill';
import program from 'commander';
import prompt from 'co-prompt';
import ora from 'ora';
import co from 'co';
import chalk from 'chalk';
import fs from 'fs';
import { download, waitDuringScan } from './download';
import { convertTorrent, convertMagnet } from './torrent';
import unrestrict from './unrestrict';
import getToken from './connect';
import pjson from '../package.json';

program
    .version(pjson.version)
    .description('Download links, magnets and torrent files.')
    .usage('<url|magnet|torrent>')
    .action(arg => co(function* action() {
        try {
            const username = yield prompt('Username: ');
            const password = yield prompt.password('Password: ');
            const token = yield getToken(username, password);

            let link;
            if (arg.match(/^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\? \.-]*)*\/?$/)) {
                link = arg;
            } else if (arg.match(/^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{20,50}/i)) {
                link = yield convertMagnet(arg, token);
            } else if (fs.existsSync(arg)) {
                link = yield convertTorrent(arg, token);
            } else {
                console.log('Usage: rdcli <url|magnet|torrent>');
                process.exit();
            }

            const unrestrictLink = yield unrestrict(link, token);
            console.log(`Start download : ${link}`);
            yield waitDuringScan(link);

            const spinner = ora('Download: 0.0% Speed: 0Mbps').start();
            download(unrestrictLink, (res) => {
                if (res.percent) {
                    spinner.text = `Download: ${res.percent}% Speed: ${res.mbps} ${res.bytesWriting}/${res.totalSize} Remaining: ${res.remaining}sec`; // eslint-disable-line max-len
                } else if (res === 'end') {
                    spinner.stop();
                    console.log('File downloaded.');
                } else {
                    spinner.stop();
                    console.log(`Error: ${res}`);
                }
            });
        } catch (e) {
            console.error(`\n${chalk.red(e)}`);
            process.exit();
        }
    }))
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
