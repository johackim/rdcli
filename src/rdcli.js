#!/usr/bin/env node

import 'babel-polyfill';
import program from 'commander';
import ora from 'ora';
import login from './login';
import { magnetToDDL, torrentToDDL, isMagnet, isTorrent } from './converter';
import unrestrict from './unrestrict';
import download from './download';
import { version } from '../package.json';

const action = async (arg) => {
    const spinner = ora({ text: 'Connect to real-debrid', enabled: !program.print }).start();

    const username = process.env.REALDEBRID_USERNAME;
    const password = process.env.REALDEBRID_PASSWORD;
    const token = await login(username, password);

    let link = arg;

    if (isMagnet(arg)) {
        spinner.text = 'Convert magnet to ddl link';
        link = magnetToDDL(arg, token);
    }

    if (isTorrent(arg)) {
        spinner.text = 'Convert torrent to ddl link';
        link = torrentToDDL(arg, token);
    }

    const unrestrictLink = await unrestrict(link, token);

    if (program.print) {
        console.log(unrestrictLink);
        process.exit(0);
    }

    spinner.text = 'Download file';
    await download(unrestrictLink);
    spinner.stop();
};

program
    .version(version)
    .description('Download links, magnets and torrent files.')
    .usage('<url|magnet|torrent>')
    .option('-p, --print', 'Print unrestricted link only')
    .action(async (arg) => {
        try {
            await action(arg);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    })
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
