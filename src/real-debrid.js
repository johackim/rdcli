import humanize from 'humanize';
import request from 'request';
import url from 'url';
import progress from 'request-progress';
import chalk from 'chalk';
import fs from 'fs';
import ora from 'ora';
import config from 'config';
import 'babel-polyfill';
import debug from 'debug';
import http from './http';

const log = debug('app');

class RealDebrid {

    constructor() {
        this.SIZE_ID = 13;
        this.MAX_RETRY = 5;
        this.RETRY_DELAY = 30 * 1000;
        this.MIN_FILESIZE = 3000;
        this.retry = 0;
    }

    * connect(username, password) {
        log('connect to real-debrid.com');

        const data = yield http.post(`${config.apiBaseUrl}/oauth/v2/token`,
            { form: {
                username,
                password,
                client_id: config.clientId,
                grant_type: 'password',
            } }
        );

        if (data.access_token) {
            console.log(`${chalk.cyan('Info:')} Login Successful`);
            this.token = data.access_token;
        }
    }

    * unrestrictLink(link) {
        log(`unrestrict link ${link}`);
        const data = yield http.post(
            `${config.apiEndpoint}/unrestrict/link?auth_token=${this.token}`,
            { form: { link } }
        );
        return data.download;
    }

    * getInfosTorrent(id) {
        log(`get infos torrent ${id}`);
        const data = yield http.get(
            `${config.apiEndpoint}/torrents/info/${id}?auth_token=${this.token}`,
            config.requestDelay
        );
        return data;
    }

    * getTorrentList() {
        log('get torrent list');
        return yield http.get(`${config.apiEndpoint}/torrents?auth_token=${this.token}`);
    }

    * selectFile(id, files = 'all') {
        log(`select file ${id}`);
        yield http.post(
            `${config.apiEndpoint}/torrents/selectFiles/${id}?auth_token=${this.token}`,
            { form: { files } }
        );
    }

    * addTorrent(torrent) {
        log(`add torrent ${torrent}`);
        const data = yield http.put(
            `${config.apiEndpoint}/torrents/addTorrent?auth_token=${this.token}`,
            torrent
        );

        if (!data.id || data.id.length !== this.SIZE_ID) {
            console.error(chalk.red('Error: add torrent failed'));
            process.exit();
        }

        const infos = yield this.getInfosTorrent(data.id);
        if (!infos.filename) {
            console.error(chalk.red('Error: add torrent failed'));
            process.exit();
        }

        return data.id;
    }

    * addMagnet(magnet) {
        log(`add magnet ${magnet}`);
        const data = yield http.post(
            `${config.apiEndpoint}/torrents/addMagnet?auth_token=${this.token}`,
            { form: { magnet: encodeURI(magnet), host: 'uptobox.com' } }
        );

        const infos = yield this.getInfosTorrent(data.id);
        if (!infos.filename) {
            console.error(chalk.red('Error: add magnet failed'));
            process.exit();
        }

        return data.id;
    }

    * waitDuringScan(link) {
        log(`scan anti-virus ${link}`);
        const message = 'Please wait until the file has been scanned by our anti-virus';
        if (!this.spinner) {
            this.spinner = ora(message).start();
        }

        const content = yield new Promise(resolve => {
            setTimeout(() => {
                request(link, (error, response, body) => {
                    resolve(body);
                });
            }, config.requestDelay);
        });

        if (content.match(new RegExp(message))) {
            yield this.waitDuringScan(link);
        } else {
            this.spinner.stop();
        }
    }

    * convertTorrent(torrent) {
        log(`convert torrent ${torrent}`);
        let idTorrent;

        if (torrent.match(/^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{20,50}/i)) {
            idTorrent = yield this.addMagnet(torrent);
        }

        if (fs.existsSync(torrent)) {
            idTorrent = yield this.addTorrent(torrent);
        }

        yield this.selectFile(idTorrent);

        let link = [];
        let status = 'wait';
        let progressConvert = 0;
        const spinner = ora(`Convert torrent progress: ${progressConvert}% (${status})`).start();
        while (!link.length) {
            const infos = yield this.getInfosTorrent(idTorrent);
            status = infos.status;
            link = infos.links;
            progressConvert = Number(infos.progress);
            spinner.text = `Convert torrent progress: ${progressConvert}% (${status})`;

            if (infos.status === 'error') {
                console.error(chalk.red('Error: convert failed'));
                process.exit();
            }
        }
        spinner.stop();

        if (!link.toString().match(/^http/)) {
            console.error(chalk.red('Error: convert failed'));
            process.exit();
        }

        if (link.length > 1) {
            console.log(`Unfortunately rdcli cannot download split files : \n${link.join('\n')}`);
            process.exit();
        }

        return link.toString();
    }

    download(link, callback) {
        log(`download file ${link}`);
        const filename = unescape(url.parse(link).pathname.split('/').pop());
        const file = `${process.cwd()}/${filename}`;

        const progressLink = progress(request(link), {
            throttle: 2000,
            delay: 1000,
        });

        progressLink.on('progress', (state) => callback({
            percent: humanize.numberFormat(state.percentage * 100, 1),
            mbps: humanize.filesize(state.speed),
            totalSize: humanize.filesize(state.size.total),
            bytesWriting: humanize.filesize(state.size.transferred),
            remaining: Math.round(state.time.remaining),
        }));

        progressLink.on('error', () => callback('error'));

        progressLink.on('end', () => {
            if (fs.statSync(file).size < this.MIN_FILESIZE &&
                fs.readFileSync(file, 'utf8').match(/error|erreur/gi)) {
                if (this.retry < this.MAX_RETRY) {
                    this.retry++;
                    console.log(`Error, retry download in ${this.RETRY_DELAY / 1000}s...`);
                    setTimeout(() => {
                        this.download(link, callback);
                    }, this.RETRY_DELAY);
                } else {
                    const message = fs.readFileSync(file, 'utf8').match(/danger">([^"]+)<\/div>/);
                    if (message) {
                        const error = message[1].replace(/<br\/>/gi, '\n');
                        console.log(`${error}\n`);
                        console.log('Contact us on https://real-debrid.com/support');
                    }
                    callback('error');
                }
            } else {
                callback('end');
            }
        });

        progressLink.pipe(fs.createWriteStream(file));
    }
}

export default RealDebrid;
