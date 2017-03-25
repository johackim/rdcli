import fetch from 'node-fetch';
import querystring from 'querystring';
import handleErrorMessage from './utils';

export default async function (url, opts = { method: 'GET' }) {
    const res = await fetch(url, {
        method: opts.method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: (typeof opts.body !== 'undefined' && opts.body.constructor.name === 'Buffer') ? opts.body : querystring.stringify(opts.body),
    });

    let data = await res.text();

    if (!data) return null;

    data = JSON.parse(data);

    if (![200, 201].includes(res.status)) {
        return handleErrorMessage(data);
    }

    return data;
}
