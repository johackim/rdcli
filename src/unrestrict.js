import config from 'config';
import debug from 'debug';
import fetch from 'node-fetch';
import handleErrorMessage from './utils';

const log = debug('unrestrict');

export default async (link, token) => {
    log(`unrestrict link ${link}`);

    try {
        const url = `${config.apiEndpoint}/unrestrict/link?auth_token=${token}`;
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                link,
            }),
            headers: { 'Content-Type': 'application/json' },
        });
        return (await res.json()).download;
    } catch (e) {
        return handleErrorMessage(e);
    }
};
