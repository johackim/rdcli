import fetch from 'node-fetch';
import querystring from 'querystring';

export default async (link, token) => {
    const unrestrictLink = await new Promise((resolve, reject) => fetch(`${process.env.API_ENDPOINT}/unrestrict/link`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: querystring.stringify({ link }),
    })
        .then(res => res.json())
        .then((data) => {
            if (data.error) {
                throw new Error(data.error);
            }

            return data;
        })
        .then(({ download }) => resolve(download))
        .catch(reject));

    return unrestrictLink;
};
