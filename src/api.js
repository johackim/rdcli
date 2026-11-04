import fs from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { API_ERRORS, API_URL, CLIENT_ID, MAGNET_REGEX, REQUEST_DELAY } from './constants.js';

const API_ENDPOINT = `${API_URL}/rest/1.0`;

const parseError = (text) => {
    try {
        return JSON.parse(text);
    } catch {
        return { error: 'Internal error' };
    }
};

const getErrorMessage = ({ error, error_code: code }) => {
    if (code === 11) return `Two-factor authentication needed: ${error.verification_url}`;

    return API_ERRORS[code] || error;
};

const request = async (url, { method = 'GET', body } = {}) => {
    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    const text = await res.text();

    if (!text) return null;

    if (!res.ok) throw new Error(getErrorMessage(parseError(text)));

    return JSON.parse(text);
};

const post = (params) => ({ method: 'POST', body: new URLSearchParams(params) });

export const getToken = async (username, password) => {
    const { access_token: token } = await request(`${API_URL}/oauth/v2/token`, post({
        username,
        password,
        client_id: CLIENT_ID,
        grant_type: 'password',
    }));

    return token;
};

export const unrestrict = async (link, token) => {
    const { download } = await request(`${API_ENDPOINT}/unrestrict/link?auth_token=${token}`, post({ link }));

    return download;
};

export const getTorrentInfos = (id, token) => request(`${API_ENDPOINT}/torrents/info/${id}?auth_token=${token}`);

export const selectAllFiles = (id, token) => request(`${API_ENDPOINT}/torrents/selectFiles/${id}?auth_token=${token}`, post({ files: 'all' }));

export const addMagnet = async (magnet, token) => {
    const { id } = await request(`${API_ENDPOINT}/torrents/addMagnet?auth_token=${token}`, post({
        magnet: encodeURI(magnet),
        host: 'uptobox.com',
    }));

    return id;
};

export const addTorrent = async (torrent, token) => {
    const { id } = await request(`${API_ENDPOINT}/torrents/addTorrent?auth_token=${token}`, {
        method: 'PUT',
        body: await fs.readFile(torrent),
    });

    return id;
};

const waitForLinks = async (id, token, onProgress) => {
    const { progress, status, links } = await getTorrentInfos(id, token);

    onProgress(`Convert torrent progress: ${Number(progress)}% (${status})`);

    if (links.length) return links;

    await sleep(REQUEST_DELAY);

    return waitForLinks(id, token, onProgress);
};

export const convertTorrent = async (torrent, token, onProgress) => {
    const add = MAGNET_REGEX.test(torrent) ? addMagnet : addTorrent;
    const id = await add(torrent, token);

    await selectAllFiles(id, token);

    const links = await waitForLinks(id, token, onProgress);

    return links.toString();
};
