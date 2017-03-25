import fetch from 'node-fetch';
import querystring from 'querystring';
import handleErrorMessage from './utils';

export default async function (url, opts = { method: 'GET' }) {
    const res = await fetch(url, {
        method: opts.method,
        body: querystring.stringify(opts.body),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    let data = await res.text();

    if (!data) return null;

    data = JSON.parse(data);

    if (res.status !== 200) {
        return handleErrorMessage(data);
    }

    return data;
}
