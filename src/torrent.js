import rp from 'request-promise';
import config from 'config';
import debug from 'debug';
import fs from 'fs';
import ora from 'ora';
import sleep from 'co-sleep';
import { handleErrorMessage } from './utils';

const log = debug('torrent');

export function* getInfosTorrent(idTorrent, token) {
    log(`get infos torrent ${idTorrent}`);

    const options = {
        uri: `${config.apiEndpoint}/torrents/info/${idTorrent}?auth_token=${token}`,
        json: true,
    };

    let data;
    yield rp(options).then((body) => {
        data = body;
    }).catch(handleErrorMessage);

    return data;
}

export function* getTorrentList(token) {
    log('get torrent list');

    const options = {
        uri: `${config.apiEndpoint}/torrents?auth_token=${token}`,
        json: true,
    };

    let data;
    yield rp(options).then((body) => {
        data = body;
    }).catch(handleErrorMessage);

    return data;
}

export function* selectFile(idTorrent, token, files = 'all') {
    log(`select file ${idTorrent}`);

    const options = {
        method: 'POST',
        uri: `${config.apiEndpoint}/torrents/selectFiles/${idTorrent}?auth_token=${token}`,
        json: true,
        form: {
            files,
        },
    };

    let data;
    yield rp(options).then((body) => {
        data = body;
    }).catch(handleErrorMessage);

    return data;
}

export function* addMagnet(magnet, token) {
    log(`add magnet ${magnet}`);

    const options = {
        method: 'POST',
        uri: `${config.apiEndpoint}/torrents/addMagnet?auth_token=${token}`,
        json: true,
        form: {
            magnet: encodeURI(magnet),
            host: 'uptobox.com',
        },
    };

    let data;
    yield rp(options).then((body) => {
        data = body;
    }).catch(handleErrorMessage);

    return data.id;
}

export function* addTorrent(torrent, token) {
    log(`add torrent ${torrent}`);

    const options = {
        uri: `${config.apiEndpoint}/torrents/addTorrent?auth_token=${token}`,
        json: true,
    };

    let data;
    yield fs.createReadStream(torrent).pipe(rp.put(options)).then((body) => {
        data = body;
    });

    return data.id;
}

export function* convertTorrent(torrent, token) {
    log(`convert torrent ${torrent}`);

    let idTorrent;
    if (torrent.match(/^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{20,50}/i)) {
        idTorrent = yield addMagnet(torrent, token);
    } else {
        idTorrent = yield addTorrent(torrent, token);
    }
    yield selectFile(idTorrent, token);

    let link = [];
    let status = 'wait';
    let progressConvert = 0;
    const spinner = ora(`Convert torrent progress: ${progressConvert}% (${status})`).start();
    while (!link.length) {
        const infos = yield getInfosTorrent(idTorrent, token);
        status = infos.status;
        link = infos.links;
        progressConvert = Number(infos.progress);
        spinner.text = `Convert torrent progress: ${progressConvert}% (${status})`;
        yield sleep(config.requestDelay);
    }
    spinner.stop();

    console.log(`Convert finish: ${link.toString()}`);
    return link.toString();
}
