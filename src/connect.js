import config from 'config';
import debug from 'debug';
import fetch from 'node-fetch';

const log = debug('connect');

export default async function getToken(username, password) {
    log('connect to real-debrid.com');

    const url = `${config.apiBaseUrl}/oauth/v2/token`;
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            username,
            password,
            client_id: config.clientId,
            grant_type: 'password',
        }),
    });

    return (await res.json()).access_token;
}
