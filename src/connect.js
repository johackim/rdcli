import config from 'config';
import debug from 'debug';
import { request } from './utils';

const log = debug('connect');

export default function* getToken(username, password) {
    log('connect to real-debrid.com');

    const options = {
        method: 'POST',
        uri: `${config.apiBaseUrl}/oauth/v2/token`,
        form: {
            username,
            password,
            client_id: config.clientId,
            grant_type: 'password',
        },
        json: true,
    };

    return (yield request(options)).access_token;
}
