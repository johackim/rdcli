import config from 'config';
import debug from 'debug';
import fetch from './fetch';

const log = debug('unrestrict');

export default async (link, token) => {
    log(`unrestrict link ${link}`);

    const data = await fetch(`${config.apiEndpoint}/unrestrict/link?auth_token=${token}`, {
        method: 'POST',
        body: { link },
    });

    return data.download;
};
