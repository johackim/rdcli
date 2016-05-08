import humanize from 'humanize';
import request from 'request';
import url from 'url';
import progress from 'request-progress';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import config from 'config';
import 'babel-polyfill';

class RealDebrid {

    * connect(username, password) {
        return new Promise((resolve, reject) => {
            request.post(
                `${config.apiBaseUrl}/oauth/v2/token`,
                { form: { username, password, client_id: config.clientId, grant_type: 'password' } },
                (error, response, body) => {
                    if (response.statusCode !== 200) {
                        reject('error response');
                    }

                    const bodyParse = JSON.parse(body);
                    if (bodyParse.error) {
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
        return new Promise((resolve, reject) => {
            request.post(
                `${config.apiEndpoint}/unrestrict/link?auth_token=${this.token}`,
                { form: { link } },
                (error, response, body) => {
                    if (response.statusCode !== 200) {
                        reject('response error');
                    }

                    const bodyParse = JSON.parse(body);
                    if (bodyParse.error) {
                        console.log(chalk.red(bodyParse.error));
                        reject(bodyParse.error);
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
                    resolve(JSON.parse(body));
                });
            }, config.delay);
        });
    }

    * getTorrentList() {
        return new Promise(resolve => {
            request(`${config.apiEndpoint}/torrents?auth_token=${this.token}`, (error, response, body) => {
                resolve(JSON.parse(body));
            });
        });
    }

    * selectFile(id, files) {
        return new Promise(resolve => {
            request.post(
                `${config.apiEndpoint}/torrents/selectFiles/${id}?auth_token=${this.token}`,
                { form: { files } },
                () => {
                    resolve(true);
                }
            );
        });
    }

    * deleteTorrent(id) {
        return new Promise(resolve => {
            request.del(
                `${config.apiEndpoint}/torrents/delete/${id}?auth_token=${this.token}`,
                {},
                () => {
                    resolve(true);
                }
            );
        });
    }

    * convertToDdl(torrent) {
        let id;
        const torrents = yield this.getTorrentList();

        if (fs.existsSync(torrent)) {
            id = yield this.addTorrent(torrent);
        } else {
            id = yield this.addMagnet(torrent);
        }

        yield this.selectFile(id, 'all');

        // Remove duplicate torrents
        let infos = yield this.getInfosTorrent(id);
        const hash = infos.hash;
        for (let i = 0; i < torrents.length; i++) {
            if (hash === torrents[i].hash) {
                yield this.deleteTorrent(torrents[i].id);
            }
        }

        let link;
        let status = 'wait';
        let progressConvert = 0;
        const spinner = ora(`Convert torrent progress: ${progressConvert}% (${status})`);
        spinner.start();
        spinner.color = 'cyan';
        while (progressConvert < 100 && status !== 'downloaded') {
            infos = yield this.getInfosTorrent(id);
            status = infos.status;
            link = infos.links.toString();
            spinner.text = `Convert torrent progress: ${progressConvert}% (${status})`;
            progressConvert = Number(infos.progress);
        }

        spinner.stop();
        return link;
    }

    * addTorrent(torrent) {
        return new Promise((resolve, reject) => {
            fs.createReadStream(torrent).pipe(request.put(
                `${config.apiEndpoint}/torrents/addTorrent?auth_token=${this.token}`,
                {},
                (error, response, body) => {
                    if (response.statusCode !== 200) {
                        reject('error response');
                    }
                    const bodyParse = JSON.parse(body);

                    if (bodyParse.error) {
                        console.error(chalk.red(bodyParse.error));
                        reject(bodyParse.error);
                    }

                    resolve(bodyParse.id);
                }
            ));
        });
    }

    * addMagnet(magnet) {
        return new Promise((resolve, reject) => {
            request.post(
                `${config.apiEndpoint}/torrents/addMagnet?auth_token=${this.token}`,
                { form: { magnet, host: 'uptobox.com' } },
                (error, response, body) => {
                    const bodyParse = JSON.parse(body);

                    if (bodyParse.error) {
                        console.error(chalk.red(bodyParse.error));
                        reject(bodyParse.error);
                    }

                    resolve(bodyParse.id);
                }
            );
        });
    }

    download(link, callback) {
        const filename = unescape(url.parse(link).pathname.split('/').pop());
        const destination = `${process.cwd()}/${filename}`;

        const progressLink = progress(request(link), {
            throttle: 2000,
            delay: config.delay,
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
