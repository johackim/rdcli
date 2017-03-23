import config from 'config';
import fs from 'fs';
import { download } from '../../src/download';

describe('download', () => {
    it('should download file', (done) => {
        server.get('/test.json', (req, res) => res.json({ test: 'test' }));

        const url = `${config.apiBaseUrl}/test.json`;
        download(url, (res) => {
            if (res === 'end') {
                assert.isTrue(fs.existsSync(`${process.cwd()}/test.json`));
                fs.unlink(`${process.cwd()}/test.json`);
                done();
            }
        });
    });

    // @TODO
    it.skip('should retry 5 times if download failed', () => {

    });

    // @TODO
    it.skip('should wait during anti-virus scan', () => {

    });
});
