import humanize from 'humanize';
import request from 'request';
import url from 'url';
import progress from 'request-progress';
import log from 'single-line-log';
import chalk from 'chalk';
import fs from 'fs';
import config from 'config';
import 'babel-polyfill';

const SIZE_ID = 13;

class RealDebrid {

    * connect(username, password) {
        return new Promise((resolve) => {
            request.post(
                `${config.apiBaseUrl}/oauth/v2/token`,
                { form: { username, password, client_id: config.clientId, grant_type: 'password' } },
                (error, response, body) => {
                    const bodyParse = JSON.parse(body);

                    if (!bodyParse || bodyParse.error) {
                        console.error(chalk.red(bodyParse.error));
                        process.exit();
                    }

                    console.log(`${chalk.cyan('Info:')} Login Successful`);
                    this.token = bodyParse.access_token;
                    resolve(this.token);
                }
            );
        });
    }

    * unrestrictLink(link) {
        return new Promise((resolve) => {
            request.post(
                `${config.apiEndpoint}/unrestrict/link?auth_token=${this.token}`,
                { form: { link } },
                (error, response, body) => {
                    const bodyParse = JSON.parse(body);

                    if (!bodyParse || bodyParse.error) {
                        console.log(chalk.red(`Error: ${bodyParse.error}`));
                        process.exit();
                    }

                    resolve(bodyParse.download);
                }
            );
        });
    }

    * getInfosTorrent(id) {
        return new Promise(resolve => {
            setTimeout(() => {
                request(`${config.apiEndpoint}/torrents/info/${id}?auth_token=${this.token}`, (error, response, body) => {
                    const bodyParse = JSON.parse(body);

                    if (!bodyParse || bodyParse.error) {
                        console.log(chalk.red(`Error: ${bodyParse.error}`));
                        process.exit();
                    }

                    resolve(bodyParse);
                });
            }, config.requestDelay);
        });
    }

    * getTorrentList() {
        return new Promise(resolve => {
            request(`${config.apiEndpoint}/torrents?auth_token=${this.token}`, (error, response, body) => {
                const bodyParse = JSON.parse(body);

                if (!bodyParse || bodyParse.error) {
                    console.log(chalk.red(`Error: ${bodyParse.error}`));
                    process.exit();
                }

                resolve(bodyParse);
            });
        });
    }

    * selectFile(id, files = 'all') {
        return new Promise(resolve => {
            request.post(
                `${config.apiEndpoint}/torrents/selectFiles/${id}?auth_token=${this.token}`,
                { form: { files } },
                (error, response, body) => {
                    if (body) {
                        const bodyParse = JSON.parse(body);

                        if (!bodyParse || bodyParse.error) {
                            console.log(chalk.red(`Error: ${bodyParse.error}`));
                            process.exit();
                        }
                    }

                    resolve(true);
                }
            );
        });
    }

    * deleteTorrent(id) {
        return new Promise(resolve => {
            setTimeout(() => {
                request.delete(
                    `${config.apiEndpoint}/torrents/delete/${id}?auth_token=${this.token}`,
                    {},
                    (error, response, body) => {
                        if (body) {
                            const bodyParse = JSON.parse(body);

                            if (!bodyParse || bodyParse.error) {
                                console.log(chalk.red(`Error: ${bodyParse.error}`));
                                process.exit();
                            }
                        }

                        resolve(true);
                    }
                );
            }, config.requestDelay);
        });
    }

    * removeHistory() {
        const torrents = yield this.getTorrentList();
        for (let i = 0; i < torrents.length; i++) {
            yield this.deleteTorrent(torrents[i].id);
        }
    }

    * convertTorrent(torrent) {
        let idTorrent;

        if (torrent.match(/^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{20,50}/i)) {
            idTorrent = yield this.addMagnet(torrent);
        }

        if (fs.existsSync(torrent)) {
            idTorrent = yield this.addTorrent(torrent);
        }

        yield this.selectFile(idTorrent);

        let link;
        let status = 'wait';
        let progressConvert = 0;
        while (!link) {
            const infos = yield this.getInfosTorrent(idTorrent);
            status = infos.status;
            link = infos.links.toString();
            progressConvert = Number(infos.progress);
            log.stdout(`Convert torrent progress: ${progressConvert}% (${status})`);

            if (infos.status === 'error') {
                console.error(chalk.red('Error: convert failed'));
                process.exit();
            }
        }

        if (!link.match(/^http/)) {
            console.error(chalk.red('Error: convert failed'));
            process.exit();
        }

        return link;
    }

    * addTorrent(torrent) {
        const id = yield new Promise(resolve => {
            fs.createReadStream(torrent).pipe(request.put(
                `${config.apiEndpoint}/torrents/addTorrent?auth_token=${this.token}`,
                {},
                (error, response, body) => {
                    const bodyParse = JSON.parse(body);

                    if (!bodyParse || bodyParse.error || bodyParse.id.length !== SIZE_ID) {
                        console.error(chalk.red('Error: add torrent failed'));
                        process.exit();
                    }

                    resolve(bodyParse.id);
                }
            ));
        });

        const infos = yield this.getInfosTorrent(id);
        if (!infos.filename) {
            console.error(chalk.red('Error: add torrent failed'));
            process.exit();
        }

        return id;
    }

    * addMagnet(magnet) {
        const id = yield new Promise(resolve => {
            request.post(
                `${config.apiEndpoint}/torrents/addMagnet?auth_token=${this.token}`,
                { form: { magnet, host: 'uptobox.com' } },
                (error, response, body) => {
                    const bodyParse = JSON.parse(body);

                    if (!bodyParse || bodyParse.error || bodyParse.id.length !== SIZE_ID) {
                        console.error(chalk.red('Error: add magnet failed'));
                        process.exit();
                    }

                    resolve(bodyParse.id);
                }
            );
        });

        const infos = yield this.getInfosTorrent(id);
        if (!infos.filename) {
            console.error(chalk.red('Error: add magnet failed'));
            process.exit();
        }

        return id;
    }

    download(link, callback) {
        const filename = unescape(url.parse(link).pathname.split('/').pop());
        const destination = `${process.cwd()}/${filename}`;

        const progressLink = progress(request(link), {
            throttle: 2000,
            delay: config.requestDelay,
        });

        let lastBytesWriting;
        progressLink.on('progress', (state) => {
            const chunkSize = state.received - lastBytesWriting;
            lastBytesWriting = state.received;

            if (state.percent === 100) {
                callback('end');
            }

            callback({
                percent: state.percent,
                mbps: humanize.filesize(chunkSize),
                totalSize: humanize.filesize(state.total),
                bytesWriting: humanize.filesize(state.received),
            });
        });

        progressLink.on('error', (err) => {
            callback(err);
        });

        progressLink.on('close', () => {
            callback('end');
        });

        progressLink.pipe(fs.createWriteStream(destination));
    }
}

export default RealDebrid;
