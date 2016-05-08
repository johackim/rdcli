import fs from 'fs';
import config from 'config';

const torrentList = [
    {
        id: 'LRAA3MAFD6WQ2',
        filename: 'movie.mkv',
        hash: '284376b2522d85f0adecd31f03g38531836be332',
        bytes: 456393005,
        host: '1fichier.com',
        split: 50,
        progress: 100,
        status: 'downloaded',
        added: '2016-05-07T19:04:57.000Z',
        links: ['https://1fichier.com/?xxxxxxxxxx'],
        ended: '2016-05-03T11:05:31.000Z',
    },
    {
        id: 'MV4XPTHPOHNYI',
        filename: 'game.zip',
        hash: '5d7f91ecac3d0dbae10fc2cf874c3fc0702edad3',
        bytes: 0,
        host: '1fichier.com',
        split: 50,
        progress: 5,
        status: 'downloading',
        added: '2016-05-07T18:33:59.000Z',
        links: [],
        speed: 3252000,
        seeders: 22,
    },
];

const torrentInfos = {
    id: 'UALJJ6I34SC46',
    filename: 'test.rar',
    original_filename: 'test.rar',
    hash: '284376b2522d85f0adecd31f1313f431836be332',
    bytes: 456393005,
    original_bytes: 456393005,
    host: 'uptobox.com',
    split: 50,
    progress: 100,
    status: 'downloaded',
    added: '2016-05-07T18:35:00.000Z',
    files: [{
        id: 1,
        path: '/test.rar',
        bytes: 456393005,
        selected: 1,
    }],
    links: ['http://uptobox.com/xxxxxxxxxxxx'],
    ended: '2016-05-03T11:05:31.000Z',
};

describe('rdcli', () => {
    beforeEach(coCb(function*() {
        server.reset();
    }));

    it('should be connect to api and return token', coCb(function*() {
        server.post('/oauth/v2/token', (req, res) => res.json({
            access_token: 'APS7T57AXM7G3U7KCT57NYCVAY',
            expires_in: 3600,
            refresh_token: 'WAD7BY4V4PP34R5TJTQLPTLGZMYD6DG7J2QJM3HKOYNGVWEEB6KQ',
            token_type: 'Bearer',
        }));

        const username = 'John';
        const password = 'password';
        yield api.connect(username, password);
        const token = api.token;

        assert.equal(token, 'APS7T57AXM7G3U7KCT57NYCVAY');
    }));

    it('should be unresrict link', coCb(function*() {
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
        const unrestrictLink = yield api.unrestrictLink(link);
        assert.equal(unrestrictLink, 'https://100.download.real-debrid.com/d/4ALWGL4BN4C4G/test.rar');
    }));

    it('should be download file', coCb(function*() {
        server.get('/test.json', (req, res) => {
            res.json({ test: 'test' });
        });

        const url = `${config.apiBaseUrl}/test.json`;
        api.download(url);
        assert.isTrue(fs.existsSync(`${process.cwd()}/test.json`));
        fs.unlink(`${process.cwd()}/test.json`);
    }));

    describe('torrent', () => {
        it('should be add torrent', coCb(function*() {
            server.get('/torrents/info/:id', (req, res) => res.json(torrentInfos));
            server.put('/torrents/addTorrent', (req, res) => res.json({
                id: 'JHGTA554AZEDF',
                uri: 'https://api.real-debrid.com/torrents/info/JHGTA554AZEDF',
            }));

            const torrentFile = `${__dirname}/fixtures/test.torrent`;
            const id = yield api.addTorrent(torrentFile);
            assert.equal(id, 'JHGTA554AZEDF');
        }));

        it('should be add magnet', coCb(function*() {
            server.get('/torrents/info/:id', (req, res) => res.json(torrentInfos));
            server.post('/torrents/addMagnet', (req, res) => res.json({
                id: 'NLBUIGAEOXYYC',
                uri: 'https://api.real-debrid.com/torrents/info/NLBUIGAEOXYYC',
            }));

            const magnet = 'magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
            const id = yield api.addMagnet(magnet);
            assert.equal(id, 'NLBUIGAEOXYYC');
        }));

        it('should be get torrent list', coCb(function*() {
            server.get('/torrents', (req, res) => res.json(torrentList));

            const infos = yield api.getTorrentList();
            assert.equal(infos.length, 2);
            assert.equal(infos[0].host, '1fichier.com');
        }));

        it('should be get torrent informations', coCb(function*() {
            server.get('/torrents/info/:id', (req, res) => res.json(torrentInfos));

            const id = 'JKLJOIIA4545Z';
            const infos = yield api.getInfosTorrent(id);
            assert.equal(infos.filename, 'test.rar');
        }));

        it('should be convert magnet to ddl file', coCb(function*() {
            server.post('/torrents/selectFiles/:id', (req, res) => res.json());
            server.get('/torrents', (req, res) => res.json(torrentList));
            server.get('/torrents/info/:id', (req, res) => res.json(torrentInfos));
            server.post('/torrents/addMagnet', (req, res) => res.json({
                id: 'KJHG5546AZDAZ',
                uri: 'https://api.real-debrid.com/torrents/info/KJHG5546AZDAZ',
            }));

            const magnet = 'magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
            const link = yield api.convertTorrent(magnet);
            assert.equal(link, 'http://uptobox.com/xxxxxxxxxxxx');
        }));

        it('should be convert torrent to ddl file', coCb(function*() {
            server.post('/torrents/selectFiles/:id', (req, res) => res.json());
            server.get('/torrents', (req, res) => res.json(torrentList));
            server.get('/torrents/info/:id', (req, res) => res.json(torrentInfos));
            server.put('/torrents/addTorrent', (req, res) => res.json({
                id: 'AEF4545FZEFZE',
                uri: 'https://api.real-debrid.com/torrents/info/AEF4545FZEFZE',
            }));

            const torrentFile = `${__dirname}/fixtures/test.torrent`;
            const link = yield api.convertTorrent(torrentFile);
            assert.equal(link, 'http://uptobox.com/xxxxxxxxxxxx');
        }));
    });
});
