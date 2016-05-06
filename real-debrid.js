import humanize from 'humanize';
import request from 'request';
import url from 'url';
import progress from 'request-progress';
import fs from 'fs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const endpoint = 'https://api.real-debrid.com/rest/1.0';
const token = '';

const unrestrictLink = (link) => new Promise((resolve, reject) => {
    request.post(
        `${endpoint}/unrestrict/link?auth_token=${token}`,
        { form: { link } },
        (error, response, body) => {
            const bodyParse = JSON.parse(body);

            if (bodyParse.error) {
                reject(bodyParse.error);
            }

            resolve(bodyParse.download);
        }
    );
});

const download = (link, callback) => {
    const filename = unescape(url.parse(link).pathname.split('/').pop());
    const destination = `${__dirname}/${filename}`;

    console.log(`${link} -> ${destination}`);

    const progressLink = progress(request(link), {
        throttle: 2000,
        delay: 1000,
    });

    let lastBytesWriting;
    progressLink.on('progress', (state) => {
        const chunkSize = state.received - lastBytesWriting;
        lastBytesWriting = state.received;

        callback({
            percent: state.percent,
            mbps: humanize.filesize(chunkSize),
            totalSize: humanize.filesize(state.total),
            bytesWriting: humanize.filesize(state.received),
        });
    });

    progressLink.pipe(fs.createWriteStream(destination));
};

export {
    download,
    unrestrictLink,
};
