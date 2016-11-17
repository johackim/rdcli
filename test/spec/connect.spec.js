import getToken from '../../src/connect';

describe('connect', () => {
    it('should return access token', function* () {
        server.post('/oauth/v2/token', (req, res) => res.json({
            access_token: 'APS7T57AXM7G3U7KCT57NYCVAY',
            expires_in: 3600,
            refresh_token: 'WAD7BY4V4PP34R5TJTQLPTLGZMYD6DG7J2QJM3HKOYNGVWEEB6KQ',
            token_type: 'Bearer',
        }));

        const username = 'username';
        const password = 'password';

        const token = yield getToken(username, password);
        assert.equal(token, 'APS7T57AXM7G3U7KCT57NYCVAY');
    });

    it.skip('should return error if bad logins', function* () {
        server.post('/oauth/v2/token', (req, res) => res.status(403).json({
            error: 'invalid_login',
            error_code: 12,
        }));

        const username = 'username';
        const password = 'password';

        assert.throws(yield getToken(username, password, Error, 'Invalid login'));
    });

    afterEach(() => {
        server.reset();
    });
});
