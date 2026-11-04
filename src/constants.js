export const API_URL = process.env.API_URL || 'https://api.real-debrid.com';

export const CLIENT_ID = 'MPCF6OE5DLDM2';

export const REQUEST_DELAY = Number(process.env.REQUEST_DELAY || 5000);

export const RETRY_DELAY = Number(process.env.RETRY_DELAY || 30000);

export const MAX_RETRIES = 5;

export const MIN_FILESIZE = 3000;

export const PROGRESS_INTERVAL = 2000;

export const URL_REGEX = /^https?:\/\/[\da-z.-]+.[a-z.]{2,6}[/\w? .-]*$/;

export const MAGNET_REGEX = /^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{20,50}/i;

export const API_ERRORS = {
    1: 'Missing parameter, invalid torrent ?',
    5: 'Login error, VPN ? Dedicated Server ?',
    7: 'Resource not found',
    12: 'Invalid login',
    13: 'Invalid password',
    16: 'Unsupported hoster',
    20: 'Hoster not available for free users',
    21: 'Too many active downloads',
    24: 'Invalid link',
    30: 'Torrent file invalid',
};
