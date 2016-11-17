export function handleErrorMessage(errorCode, error) {
    switch (errorCode) {
    case 5:
        throw new Error('Login error, VPN ?');
    case 11:
        throw new Error(`Two-factor authentication needed: ${error.error.verification_url}`);
    case 12:
        throw new Error('Invalid login');
    case 13:
        throw new Error('Invalid password');
    case 20:
        throw new Error('Hoster not available for free users');
    case 24:
        throw new Error('Invalid link');
    default:
        throw new Error(error);
    }
}
