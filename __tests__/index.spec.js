import fs from 'node:fs';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { URL_REGEX } from '../src/constants';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));
const bin = new URL('../src/index.js', import.meta.url).pathname;
const download = 'https://100.download.real-debrid.com/d/ABC/test.rar';

const routes = {
    '/oauth/v2/token': { access_token: 'TOKEN' },
    '/rest/1.0/unrestrict/link': { download },
};

const server = createServer((req, res) => {
    const body = routes[req.url.split('?')[0]];
    res.writeHead(body ? 200 : 404).end(JSON.stringify(body || { error: 'not_found' }));
});

const rdcli = (args, apiPath = '') => promisify(execFile)('node', [bin, ...args], {
    env: {
        ...process.env,
        API_URL: `http://localhost:${server.address().port}${apiPath}`,
        REALDEBRID_USERNAME: 'username',
        REALDEBRID_PASSWORD: 'password',
    },
});

beforeAll(() => new Promise((resolve) => {
    server.listen(0, resolve);
}));

afterAll(() => {
    server.close();
});

test('Should display the version', async () => {
    const { stdout } = await rdcli(['--version']);

    expect(stdout.trim()).toBe(pkg.version);
});

test('Should display the help message without argument', async () => {
    const { stdout } = await rdcli([]);

    expect(stdout).toContain('Usage: rdcli <url|magnet|torrent>');
    expect(stdout).toContain('--print');
});

test('Should print the unrestricted link', async () => {
    const { stdout } = await rdcli(['--print', 'http://uptobox.com/xxxxxxxxxxxx']);

    expect(stdout.trim()).toBe(download);
});

test('Should exit with code 1 if the argument is invalid', async () => {
    await expect(rdcli(['invalid'])).rejects.toMatchObject({ code: 1, stdout: 'Usage: rdcli <url|magnet|torrent>\n' });
});

test('Should exit with code 2 if the API fails', async () => {
    await expect(rdcli(['-p', 'http://uptobox.com/xxxxxxxxxxxx'], '/unknown')).rejects.toMatchObject({ code: 2, stderr: expect.stringContaining('Error: not_found') });
});

test('Should not hang on a link with unsupported characters', () => {
    expect(URL_REGEX.test(`https://example.com/${'a'.repeat(1000)}=`)).toBe(false);
});
