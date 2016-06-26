import rp from 'request-promise';
import config from 'config';
import debug from 'debug';

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

    let data;
    yield rp(options).then(body => {
        data = body.access_token;
    }).catch(() => {
        throw new Error('invalid login');
    });

    return data;
}
