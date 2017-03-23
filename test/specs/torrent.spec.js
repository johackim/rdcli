import {
    getInfosTorrent,
    getTorrentList,
    selectFile,
    addMagnet,
    addTorrent,
    convertTorrent,
} from '../../src/torrent';

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

const token = 'APS7T57AXM7G3U7KCT57NYCVAY';

describe('torrent', () => {
    it('should return torrent informations', async () => {
        server.get('/torrents/info/:id', (req, res) => res.json(torrentInfos));

        const id = 'JKLJOIIA4545Z';
        const infos = await getInfosTorrent(id, token);
        assert.equal(infos.filename, 'test.rar');
    });

    it('should get torrent list', async () => {
        server.get('/torrents', (req, res) => res.json(torrentList));

        const infos = await getTorrentList(token);
        assert.equal(infos.length, 2);
        assert.equal(infos[0].host, '1fichier.com');
    });

    it('should select file', async () => {
        server.post('/torrents/selectFiles/:id', (req, res) => res.json());
        const id = 'NLBUIGAEOXYYC';
        await selectFile(id, token);
    });

    it('should add magnet', async () => {
        server.get('/torrents/info/:id', (req, res) => res.json(torrentInfos));
        server.post('/torrents/addMagnet', (req, res) => res.json({
            id: 'NLBUIGAEOXYYC',
            uri: 'https://api.real-debrid.com/torrents/info/NLBUIGAEOXYYC',
        }));

        const magnet = 'magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
        const id = await addMagnet(magnet, token);
        assert.equal(id, 'NLBUIGAEOXYYC');
    });

    it('should add torrent', async () => {
        server.get('/torrents/info/:id', (req, res) => res.json(torrentInfos));
        server.put('/torrents/addTorrent', (req, res) => res.json({
            id: 'JHGTA554AZEDF',
            uri: 'https://api.real-debrid.com/torrents/info/JHGTA554AZEDF',
        }));

        const torrentFile = `${__dirname}/../fixtures/test.torrent`;
        const id = await addTorrent(torrentFile, token);
        assert.equal(id, 'JHGTA554AZEDF');
    });

    it('should convert magnet to ddl file', async () => {
        server.post('/torrents/selectFiles/:id', (req, res) => res.json());
        server.get('/torrents', (req, res) => res.json(torrentList));
        server.get('/torrents/info/:id', (req, res) => res.json(torrentInfos));
        server.post('/torrents/addMagnet', (req, res) => res.json({
            id: 'KJHG5546AZDAZ',
            uri: 'https://api.real-debrid.com/torrents/info/KJHG5546AZDAZ',
        }));

        const magnet = 'magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
        const link = await convertTorrent(magnet, token);
        assert.equal(link, 'http://uptobox.com/xxxxxxxxxxxx');
    });

    it('should convert torrent to ddl file', async () => {
        server.post('/torrents/selectFiles/:id', (req, res) => res.json());
        server.get('/torrents', (req, res) => res.json(torrentList));
        server.get('/torrents/info/:id', (req, res) => res.json(torrentInfos));
        server.put('/torrents/addTorrent', (req, res) => res.json({
            id: 'AEF4545FZEFZE',
            uri: 'https://api.real-debrid.com/torrents/info/AEF4545FZEFZE',
        }));

        const torrentFile = `${__dirname}/../fixtures/test.torrent`;
        const link = await convertTorrent(torrentFile, token);
        assert.equal(link, 'http://uptobox.com/xxxxxxxxxxxx');
    });
});
