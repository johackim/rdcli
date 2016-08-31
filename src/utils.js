export function handleErrorMessage(errorCode, error) {
    switch (errorCode) {
    case 5:
        throw new Error('Login error, VPN ?');
    case 12:
        throw new Error('Invalid login');
    default:
        throw new Error(error);
    }
}
