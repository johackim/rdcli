#!/usr/bin/env node

/* eslint max-len: [0] */

import log from 'single-line-log';
import { download, unrestrictLink } from './real-debrid';

const args = process.argv.slice(2);

if (!args[0]) {
    console.log('Usage: rdcli <url>');
    process.exit();
}

if (!args[0].match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)) {
    console.log('Bad url');
    process.exit();
}

unrestrictLink(args[0]).then((link) => {
    download(link, (res) => {
        log.stdout(`progress: ${res.percent}% Speed: ${res.mbps}Mbps ${res.bytesWriting}/${res.totalSize}`);
    });
}, () => {
    console.log('Error');
});
