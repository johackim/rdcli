import fs from 'fs';
import { download } from '../src/download';

describe('Download', () => {
    it('Should download file', async () => {
        const file = 'test.txt';
        const token = 'mytoken';

        download(file, token);
        assert.isTrue(fs.existsSync('test.txt'));
        fs.unlink('test.txt');
    });
});
