import config from 'config';
import debug from 'debug';
import { request } from './utils';

const log = debug('unrestrict');

export default function* unrestrict(link, token) {
    log(`unrestrict link ${link}`);

    const options = {
        method: 'POST',
        uri: `${config.apiEndpoint}/unrestrict/link?auth_token=${token}`,
        form: {
            link,
        },
        json: true,
    };

    return (yield request(options)).download;
}
