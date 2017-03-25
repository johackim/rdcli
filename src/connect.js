import config from 'config';
import debug from 'debug';
import fetch from './fetch';

const log = debug('connect');

const getToken = async (username, password) => {
    log('connect to real-debrid.com');

    const data = await fetch(`${config.apiBaseUrl}/oauth/v2/token`, {
        method: 'POST',
        body: {
            username,
            password,
            client_id: config.clientId,
            grant_type: 'password',
        },
    });

    return data.access_token;
};

export default getToken;
