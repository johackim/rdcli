import unrestrict from '../../src/unrestrict';

describe('unrestrict', () => {
    it('should unrestrict link', async () => {
        const token = 'APS7T57AXM7G3U7KCT57NYCVAY';
        server.post('/unrestrict/link', (req, res) => res.json({
            id: '4ALWGL4BN4C4G',
            filename: 'test.rar',
            filesize: 200000000,
            link: 'http://uptobox.com/xxxxxxxxxxxx',
            host: 'uptobox.com',
            chunks: 16,
            crc: 1,
            download: 'https://100.download.real-debrid.com/d/4ALWGL4BN4C4G/test.rar',
            streamable: 0,
        }));

        const link = 'http://uptobox.com/xxxxxxxxxxxx';
        const unrestrictLink = await unrestrict(link, token);
        assert.equal(unrestrictLink, 'https://100.download.real-debrid.com/d/4ALWGL4BN4C4G/test.rar');
    });
});
