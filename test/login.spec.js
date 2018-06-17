import nock from 'nock';
import login from '../src/login';

describe('Login', () => {
    it('Should return access token', async () => {
        nock(process.env.APIBASEURL).post('/oauth/v2/token').reply(200, {
            access_token: 'APS7T57AXM7G3U7KCT57NYCVAY',
            expires_in: 3600,
            refresh_token: 'WAD7BY4V4PP34R5TJTQLPTLGZMYD6DG7J2QJM3HKOYNGVWEEB6KQ',
            token_type: 'Bearer',
        });

        const username = process.env.REALDEBRID_USERNAME;
        const password = process.env.REALDEBRID_PASSWORD;

        const token = await login(username, password);
        assert.equal(token, 'APS7T57AXM7G3U7KCT57NYCVAY');
    });

    it('Should return error if bad logins', async () => {
        nock(process.env.APIBASEURL).post('/oauth/v2/token').reply(403, {
            error: 'invalid_login',
            error_code: 12,
        });

        const username = 'badusername';
        const password = 'badpassword';

        assert.throws(await login(username, password, Error, 'Invalid login'));
    });
});
