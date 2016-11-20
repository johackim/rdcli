import url from 'url';
import progress from 'request-progress';
import humanize from 'humanize';
import fs from 'fs';
import debug from 'debug';
import request from 'request';
import ora from 'ora';
import config from 'config';

const log = debug('download');

const MAX_RETRY = 5;
const RETRY_DELAY = 30 * 1000;
const MIN_FILESIZE = 3000;
let retry = 0;
let spinner;

export function* waitDuringScan(link) {
    log(`scan anti-virus ${link}`);
    const message = 'Please wait until the file has been scanned by our anti-virus';
    if (!spinner) {
        spinner = ora(message).start();
    }

    const content = yield new Promise((resolve) => {
        setTimeout(() => {
            request(link, (error, response, body) => {
                resolve(body);
            });
        }, config.requestDelay);
    });

    if (content.match(new RegExp(message))) {
        yield waitDuringScan(link);
    } else {
        spinner.stop();
    }
}

export function download(link, callback) {
    log(`download file ${link}`);
    const filename = unescape(url.parse(link).pathname.split('/').pop());
    const file = `${process.cwd()}/${filename}`;

    const progressLink = progress(request(link), {
        throttle: 2000,
        delay: 1000,
    });

    progressLink.on('progress', state => callback({
        percent: humanize.numberFormat(state.percentage * 100, 1),
        mbps: humanize.filesize(state.speed),
        totalSize: humanize.filesize(state.size.total),
        bytesWriting: humanize.filesize(state.size.transferred),
        remaining: Math.round(state.time.remaining),
    }));

    progressLink.on('error', () => callback('error'));

    progressLink.on('end', () => {
        if (fs.statSync(file).size < MIN_FILESIZE &&
            fs.readFileSync(file, 'utf8').match(/error|erreur/gi)) {
            if (retry < MAX_RETRY) {
                retry += 1;
                console.log(`Error, retry download in ${RETRY_DELAY / 1000}s...`);
                setTimeout(() => {
                    download(link, callback);
                }, RETRY_DELAY);
            } else {
                const message = fs.readFileSync(file, 'utf8').match(/danger">([^"]+)<\/div>/);
                if (message) {
                    const error = message[1].replace(/<br\/>/gi, '\n');
                    console.log(`${error}\n`);
                    console.log('Contact us on https://real-debrid.com/support');
                }
                callback('error');
            }
        } else {
            callback('end');
        }
    });

    progressLink.pipe(fs.createWriteStream(file));
}
