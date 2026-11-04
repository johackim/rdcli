import { jest } from '@jest/globals';
import { addMagnet, addTorrent, convertTorrent, getToken, getTorrentInfos, selectAllFiles, unrestrict } from '../src/api';

const token = 'APS7T57AXM7G3U7KCT57NYCVAY';
const magnet = 'magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const torrentFile = `${import.meta.dirname}/fixtures/test.torrent`;

const torrentInfos = {
    id: 'UALJJ6I34SC46',
    filename: 'test.rar',
    progress: 100,
    status: 'downloaded',
    links: ['http://uptobox.com/xxxxxxxxxxxx'],
};

const respondWith = (body, status = 200) => new Response(JSON.stringify(body), { status });

const mockFetch = (body, status) => jest.spyOn(global, 'fetch').mockImplementation(async () => respondWith(body, status));

test('Should return access token', async () => {
    const fetchMock = mockFetch({ access_token: token });

    expect(await getToken('username', 'password')).toBe(token);

    const [url, { method, body }] = fetchMock.mock.calls[0];

    expect(url).toMatch(/\/oauth\/v2\/token$/);
    expect(method).toBe('POST');
    expect(body.toString()).toBe('username=username&password=password&client_id=MPCF6OE5DLDM2&grant_type=password');
});

test('Should return error if bad logins', async () => {
    mockFetch({ error: 'invalid_login', error_code: 12 }, 403);

    await expect(getToken('username', 'password')).rejects.toThrow('Invalid login');
});

test('Should return the API message if error code is unknown', async () => {
    mockFetch({ error: 'unknown_error', error_code: 99 }, 400);

    await expect(unrestrict('http://uptobox.com/xxxxxxxxxxxx', token)).rejects.toThrow('unknown_error');
});

test('Should return internal error if error is not JSON', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(async () => new Response('Bad gateway', { status: 502 }));

    await expect(getToken('username', 'password')).rejects.toThrow('Internal error');
});

test('Should unrestrict link', async () => {
    const download = 'https://100.download.real-debrid.com/d/4ALWGL4BN4C4G/test.rar';
    mockFetch({ download });

    expect(await unrestrict('http://uptobox.com/xxxxxxxxxxxx', token)).toBe(download);
});

test('Should return torrent informations', async () => {
    mockFetch(torrentInfos);

    const { filename } = await getTorrentInfos('JKLJOIIA4545Z', token);

    expect(filename).toBe('test.rar');
});

test('Should select all files', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(async () => new Response(null, { status: 204 }));

    expect(await selectAllFiles('NLBUIGAEOXYYC', token)).toBeNull();
    expect(fetchMock.mock.calls[0][1].body.toString()).toBe('files=all');
});

test('Should add magnet', async () => {
    mockFetch({ id: 'NLBUIGAEOXYYC' }, 201);

    expect(await addMagnet(magnet, token)).toBe('NLBUIGAEOXYYC');
});

test('Should add torrent', async () => {
    const fetchMock = mockFetch({ id: 'JHGTA554AZEDF' }, 201);

    expect(await addTorrent(torrentFile, token)).toBe('JHGTA554AZEDF');

    const [, { method, body }] = fetchMock.mock.calls[0];

    expect(method).toBe('PUT');
    expect(body.toString()).toContain('Test file torrent');
});

test.each([
    ['magnet', magnet, '/torrents/addMagnet'],
    ['torrent', torrentFile, '/torrents/addTorrent'],
])('Should convert %s to ddl file', async (_, torrent, endpoint) => {
    const fetchMock = mockFetch(torrentInfos);

    expect(await convertTorrent(torrent, token, () => {})).toBe('http://uptobox.com/xxxxxxxxxxxx');
    expect(fetchMock.mock.calls[0][0]).toContain(endpoint);
});

test('Should report progress until torrent links are ready', async () => {
    const waiting = { ...torrentInfos, progress: 5, status: 'downloading', links: [] };
    const onProgress = jest.fn();

    jest.spyOn(global, 'fetch')
        .mockImplementationOnce(async () => respondWith({ id: 'KJHG5546AZDAZ' }, 201))
        .mockImplementationOnce(async () => new Response(null, { status: 204 }))
        .mockImplementationOnce(async () => respondWith(waiting))
        .mockImplementationOnce(async () => respondWith(torrentInfos));

    await convertTorrent(magnet, token, onProgress);

    expect(onProgress.mock.calls).toEqual([
        ['Convert torrent progress: 5% (downloading)'],
        ['Convert torrent progress: 100% (downloaded)'],
    ]);
});
