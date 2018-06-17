import fetch from 'node-fetch';
import querystring from 'querystring';

export default async (username, password) => {
    const token = await new Promise((resolve, reject) => fetch(`${process.env.APIBASEURL}/oauth/v2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: querystring.stringify({
            client_id: process.env.CLIENTID,
            username,
            password,
            grant_type: 'password',
        }),
    })
        .then(res => res.json())
        .then(data => resolve(data.access_token))
        .catch(reject));

    return token;
};
