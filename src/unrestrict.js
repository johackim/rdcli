import rp from 'request-promise';
import config from 'config';
import debug from 'debug';
import handleErrorMessage from './handleErrorMessage';

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

    let data;
    yield rp(options).then((body) => {
        data = body.download;
    }).catch(handleErrorMessage);

    return data;
}
