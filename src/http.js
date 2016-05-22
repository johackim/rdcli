import request from 'request';
import chalk from 'chalk';
import fs from 'fs';

const callback = (resolve, reject) => (error, response, body) => {
    if (error) {
        reject('Resource temporarily unavailable');
    }

    if (body) {
        const bodyParse = JSON.parse(body);
        if (!bodyParse || bodyParse.error) {
            reject(bodyParse.error);
        }
        resolve(bodyParse);
    }

    resolve(true);
};

const http = {
    post: (url, data = []) => new Promise((resolve, reject) => {
        request.post(url, data, callback(resolve, reject));
    }).catch((error) => {
        console.error(chalk.red(error));
        process.exit();
    }),

    get: (url, delay = 0) => new Promise((resolve, reject) => {
        setTimeout(() => {
            request(url, callback(resolve, reject));
        }, delay);
    }).catch((error) => {
        console.error(chalk.red(error));
        process.exit();
    }),

    put: (url, file) => new Promise((resolve, reject) => {
        fs.createReadStream(file).pipe(request.put(url, {}, callback(resolve, reject)));
    }).catch((error) => {
        console.error(chalk.red(error));
        process.exit();
    }),
};

export default http;
