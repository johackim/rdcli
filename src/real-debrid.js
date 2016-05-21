import humanize from 'humanize';
import request from 'request';
import url from 'url';
import progress from 'request-progress';
import chalk from 'chalk';
import fs from 'fs';
import ora from 'ora';
import config from 'config';
import 'babel-polyfill';

class RealDebrid {

    constructor() {
        this.SIZE_ID = 13;
        this.MAX_RETRY = 5;
        this.RETRY_DELAY = 30 * 1000;
        this.MIN_FILESIZE = 3000;
        this.retry = 0;
    }

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
                            console.log(chalk.red('Error: no files to select'));
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

    * addTorrent(torrent) {
        const id = yield new Promise(resolve => {
            fs.createReadStream(torrent).pipe(request.put(
                `${config.apiEndpoint}/torrents/addTorrent?auth_token=${this.token}`,
                {},
                (error, response, body) => {
                    const bodyParse = JSON.parse(body);

                    if (!bodyParse || bodyParse.error || bodyParse.id.length !== this.SIZE_ID) {
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
                { form: { magnet: encodeURI(magnet), host: 'uptobox.com' } },
                (error, response, body) => {
                    const bodyParse = JSON.parse(body);

                    if (!bodyParse || bodyParse.error || bodyParse.id.length !== this.SIZE_ID) {
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

    * waitDuringScan(link) {
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

    download(link, callback) {
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
            if (fs.statSync(file).size < this.MIN_FILESIZE && fs.readFileSync(file, 'utf8').match(/error/)) {
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
