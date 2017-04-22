#!/usr/bin/env node

import 'babel-polyfill';
import program from 'commander';
import prompt from 'co-prompt';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs';
import { download, waitDuringScan } from './download';
import { convertTorrent } from './torrent';
import unrestrict from './unrestrict';
import getToken from './connect';
import pjson from '../package.json';

program
    .version(pjson.version)
    .description('Download links, magnets and torrent files.')
    .usage('<url|magnet|torrent>')
    .option('-r, --remote', 'Remote traffic')
    .action(async (arg, options) => {
        try {
            const username = process.env.REALDEBRID_USERNAME || (await prompt('Username: '));
            const password = process.env.REALDEBRID_PASSWORD || (await prompt.password('Password: '));
            const token = await getToken(username, password);

            let link;
            if (arg.match(/^(https?:\/\/)([\da-z.-]+).([a-z.]{2,6})([/\w? .-]*)*\/?$/)) {
                link = arg;
            } else if (arg.match(/^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{20,50}/i) || fs.existsSync(arg)) {
                link = await convertTorrent(arg, token);
            } else {
                console.log('Usage: rdcli <url|magnet|torrent>');
                process.exit();
            }

            const unrestrictLink = await unrestrict(link, token, options.remote);
            console.log(`Start download : ${unrestrictLink}`);
            await waitDuringScan(link);

            const spinner = ora('Download: 0.0% Speed: 0Mbps').start();
            download(unrestrictLink, (res) => {
                if (res.percent) {
                    spinner.text = `Download: ${res.percent}% Speed: ${res.mbps} ${res.bytesWriting}/${res.totalSize} Remaining: ${res.remaining}sec`; // eslint-disable-line max-len
                } else if (res === 'end') {
                    spinner.stop();
                    spinner.succeed('File downloaded.');
                } else {
                    spinner.stop();
                    console.log(`Error: ${res}`);
                }
            });
        } catch (e) {
            console.error(`${chalk.red(e)}`);
            process.exit();
        }
    })
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
