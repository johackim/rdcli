import config from 'config';
import debug from 'debug';
import * as fs from 'async-file';
import ora from 'ora';
import sleep from 'sleep-promise';
import fetch from './fetch';

const log = debug('torrent');

export const getInfosTorrent = async (idTorrent, token) => {
    log(`get infos torrent ${idTorrent}`);

    const data = await fetch(`${config.apiEndpoint}/torrents/info/${idTorrent}?auth_token=${token}`);
    return data;
};

export const getTorrentList = async (token) => {
    log('get torrent list');

    const data = await fetch(`${config.apiEndpoint}/torrents?auth_token=${token}`);
    return data;
};

export const selectFile = async (idTorrent, token, files = 'all') => {
    log(`select file ${idTorrent}`);

    await fetch(`${config.apiEndpoint}/torrents/selectFiles/${idTorrent}?auth_token=${token}`, {
        method: 'POST',
        body: { files },
    });
};

export const addMagnet = async (magnet, token) => {
    log(`add magnet ${magnet}`);

    const data = await fetch(`${config.apiEndpoint}/torrents/addMagnet?auth_token=${token}`, {
        method: 'POST',
        body: {
            magnet: encodeURI(magnet),
            host: 'uptobox.com',
        },
    });

    return data.id;
};

export const addTorrent = async (torrent, token) => {
    log(`add torrent ${torrent}`);

    const data = await fetch(`${config.apiEndpoint}/torrents/addTorrent?auth_token=${token}`, {
        method: 'PUT',
        body: await fs.readFile(torrent),
    });

    return data.id;
};

export const convertTorrent = async (torrent, token) => {
    log(`convert torrent ${torrent}`);

    let idTorrent;
    if (torrent.match(/^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{20,50}/i)) {
        idTorrent = await addMagnet(torrent, token);
    } else {
        idTorrent = await addTorrent(torrent, token);
    }
    await selectFile(idTorrent, token);

    let links = [];
    let status = 'wait';
    let progressConvert = 0;
    const spinner = ora(`Convert torrent progress: ${progressConvert}% (${status})`).start();
    while (!links.length) {
        const infos = await getInfosTorrent(idTorrent, token); // eslint-disable-line
        status = infos.status;
        links = infos.links;
        progressConvert = Number(infos.progress);
        spinner.text = `Convert torrent progress: ${progressConvert}% (${status})`;
        await sleep(config.requestDelay); // eslint-disable-line
    }
    spinner.stop();

    console.log(`Convert finish: ${links.toString()}`);
    return links;
};
