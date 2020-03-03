import { exec } from 'child-process-promise';

describe('rdcli', () => {
    before(() => {
        delete process.env.NODE_ENV;
    });

    it.skip('should exec rdcli command', async () => {
        const { stdout, stderr } = await exec('node ./build/rdcli.js');

        assert.isNotNull(stdout);
        assert.equal(stderr, '');
    });

    after(() => {
        process.env.NODE_ENV = 'test';
    });
});
