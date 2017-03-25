export default function handleErrorMessage(error) {
    const errorCode = error.error_code;

    switch (errorCode) {
    case 1:
        throw new Error('Missing parameter, invalid torrent ?');
    case 5:
        throw new Error('Login error, VPN ? Dedicated Server ?');
    case 7:
        throw new Error('Resource not found');
    case 11:
        throw new Error(`Two-factor authentication needed: ${error.error.verification_url}`);
    case 12:
        throw new Error('Invalid login');
    case 13:
        throw new Error('Invalid password');
    case 16:
        throw new Error('Unsupported hoster');
    case 20:
        throw new Error('Hoster not available for free users');
    case 21:
        throw new Error('Too many active downloads');
    case 24:
        throw new Error('Invalid link');
    default:
        throw new Error(error.error);
    }
}

