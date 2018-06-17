#!/usr/bin/env node

import 'babel-polyfill';
import program from 'commander';
import { version } from '../package.json';

const action = () => {
    console.log('action');
    console.log(process.env.CLIENTID);
};

program
    .version(version)
    .description('Download links, magnets and torrent files.')
    .usage('<url|magnet|torrent>')
    .action(action)
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
