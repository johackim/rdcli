#!/usr/bin/env node

import fs from 'node:fs';
import { styleText } from 'node:util';
import { program } from 'commander';
import enquirer from 'enquirer';
import ora from 'ora';
import { convertTorrent, getToken, unrestrict } from './api.js';
import { MAGNET_REGEX, URL_REGEX } from './constants.js';
import { download } from './download.js';
import pkg from '../package.json' with { type: 'json' };

const { Input, Password } = enquirer;

const login = async () => getToken(
    process.env.REALDEBRID_USERNAME || await new Input({ message: 'Username' }).run(),
    process.env.REALDEBRID_PASSWORD || await new Password({ message: 'Password' }).run(),
);

const convert = async (torrent, token) => {
    const spinner = ora('Convert torrent progress: 0% (wait)').start();

    const link = await convertTorrent(torrent, token, (text) => {
        spinner.text = text;
    }).finally(() => spinner.stop());

    console.log(`Convert finish: ${link}`);

    return link;
};

const save = async (link) => {
    const spinner = ora('Download: 0.0% Speed: 0Mbps').start();

    await download(link, (text) => {
        spinner.text = text;
    }).finally(() => spinner.stop());

    spinner.succeed('File downloaded.');
};

const isValidInput = (input) => URL_REGEX.test(input) || MAGNET_REGEX.test(input) || fs.existsSync(input);

const run = async (input, { print }) => {
    if (!input) program.help();

    const token = await login();

    if (!isValidInput(input)) {
        console.log('Usage: rdcli <url|magnet|torrent>');
        process.exit(1);
    }

    const link = URL_REGEX.test(input) ? input : await convert(input, token);
    const unrestrictedLink = await unrestrict(link, token);

    if (print) {
        console.log(unrestrictedLink);
        return;
    }

    console.log(`Start download : ${unrestrictedLink}`);

    await save(unrestrictedLink);
};

program
    .name('rdcli')
    .version(pkg.version)
    .description('Download links, magnets and torrent files.')
    .usage('<url|magnet|torrent>')
    .argument('[input]')
    .option('-p, --print', 'Print unrestricted link only')
    .action(run)
    .parseAsync()
    .catch((error) => {
        console.error(styleText('red', String(error)));
        process.exit(2);
    });
