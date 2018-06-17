import { torrentToDDL, magnetToDDL } from '../src/converter';

describe('Converter', () => {
    it('Should convert torrent to ddl link', async () => {
        const token = 'my_token';
        const torrent = 'my_torrent';

        const link = torrentToDDL(torrent, token);

        assert.equal(link, 'https://real-debrid.com/wdwjiedjwief');
    });

    it('Should convert magnet to ddl link', async () => {
        const token = 'my_token';
        const magnet = 'my_magnet';

        const link = magnetToDDL(magnet, token);

        assert.equal(link, 'https://real-debrid.com/wdwjiedjwief');
    });
});
