import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { jest } from '@jest/globals';
import { download } from '../src/download';
import { MAX_RETRIES } from '../src/constants';

const link = 'https://download.real-debrid.com/d/ABC/test.json';

const mockFetch = (body) => jest.spyOn(global, 'fetch').mockImplementation(async () => new Response(body));

beforeAll(() => {
    process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), 'rdcli-')));
});

beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
});

test('Should download file', async () => {
    mockFetch('{"test":"test"}');

    expect(await download(link, () => {})).toBe('test.json');
    expect(fs.readFileSync('test.json', 'utf8')).toBe('{"test":"test"}');
});

test('Should keep a large file even if it contains the word error', async () => {
    const fetchMock = mockFetch('error'.repeat(1000));

    await download(link, () => {});

    expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('Should retry 5 times if download failed', async () => {
    const fetchMock = mockFetch('<div class="danger">Hoster error<br/>Try later</div>');

    await expect(download(link, () => {})).rejects.toThrow('Hoster error\nTry later\nContact us on https://real-debrid.com/support');

    expect(fetchMock).toHaveBeenCalledTimes(MAX_RETRIES + 1);
});

test('Should succeed if a retry works', async () => {
    jest.spyOn(global, 'fetch')
        .mockImplementationOnce(async () => new Response('Erreur'))
        .mockImplementationOnce(async () => new Response('content'));

    await download(link, () => {});

    expect(fs.readFileSync('test.json', 'utf8')).toBe('content');
});

test('Should fail with a default message if the error page has no details', async () => {
    mockFetch('error');

    await expect(download(link, () => {})).rejects.toThrow('Download failed');
});
