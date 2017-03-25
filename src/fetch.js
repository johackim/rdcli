import fetch from 'node-fetch';
import querystring from 'querystring';
import handleErrorMessage from './utils';

const IsJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

export default async function (url, opts = { method: 'GET' }) {
    const res = await fetch(url, {
        method: opts.method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: (typeof opts.body !== 'undefined' && opts.body.constructor.name === 'Buffer') ? opts.body : querystring.stringify(opts.body),
    });

    const data = await res.text();

    if (!data) return null;

    if (![200, 201].includes(res.status)) {
        if (!IsJsonString(data)) {
            throw new Error('Internal error');
        }
        return handleErrorMessage(JSON.parse(data));
    }

    return JSON.parse(data);
}
