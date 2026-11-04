import fs from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { MAX_RETRIES, MIN_FILESIZE, PROGRESS_INTERVAL, RETRY_DELAY } from './constants.js';
import { formatProgress, getFilename, getPageError } from './utils.js';

const saveFile = async (link, file, onProgress) => {
    const res = await fetch(link);
    const total = Number(res.headers.get('content-length'));
    const startedAt = Date.now();
    let transferred = 0;

    const timer = setInterval(() => {
        onProgress(formatProgress(transferred, total, (Date.now() - startedAt) / 1000));
    }, PROGRESS_INTERVAL);

    const body = Readable.fromWeb(res.body).on('data', (chunk) => {
        transferred += chunk.length;
    });

    await pipeline(body, fs.createWriteStream(file)).finally(() => clearInterval(timer));
};

export const download = async (link, onProgress, retries = MAX_RETRIES) => {
    const file = getFilename(link);

    await saveFile(link, file, onProgress);

    // Real-Debrid can answer 200 with a small HTML error page instead of the file.
    const page = fs.statSync(file).size < MIN_FILESIZE ? fs.readFileSync(file, 'utf8') : '';

    if (!/error|erreur/i.test(page)) return file;

    if (!retries) {
        const error = getPageError(page);

        throw new Error(error ? `${error}\nContact us on https://real-debrid.com/support` : 'Download failed');
    }

    console.log(`Error, retry download in ${RETRY_DELAY / 1000}s...`);

    await sleep(RETRY_DELAY);

    return download(link, onProgress, retries - 1);
};
