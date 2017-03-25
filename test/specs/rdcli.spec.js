import { exec } from 'child_process';

describe('rdcli', () => {
    it('should exec rdcli command', () => {
        exec('node ./build/rdcli.js', (error, stdout, stderr) => {
            assert.isNotNull(stdout);
            assert.equal(stderr, '');
        });
    });
});
