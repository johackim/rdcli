import { formatProgress, formatSize, getFilename, getPageError } from '../src/utils';

test('Should format a size', () => {
    expect(formatSize(0)).toBe('0 bytes');
    expect(formatSize(512)).toBe('512 bytes');
    expect(formatSize(1536)).toBe('1.50 KB');
    expect(formatSize(5 * 1024 ** 3)).toBe('5.00 GB');
});

test('Should format the download progress', () => {
    expect(formatProgress(1024 ** 2, 4 * 1024 ** 2, 2)).toBe('Download: 25.0% Speed: 512.00 KB 1.00 MB/4.00 MB Remaining: 6sec');
});

test('Should format the download progress without a known size', () => {
    expect(formatProgress(1024, 0, 1)).toBe('Download: 0.0% Speed: 1.00 KB 1.00 KB/0 bytes Remaining: 0sec');
});

test('Should get the decoded filename of a link', () => {
    expect(getFilename('https://example.com/d/ABC/my%20file.rar?token=1')).toBe('my file.rar');
    expect(getFilename('https://example.com/d/caf%C3%A9.rar')).toBe('café.rar');
});

test('Should not let a link write outside the current folder', () => {
    expect(getFilename('https://example.com/d/..%2F..%2Fetc%2Fpasswd')).toBe('passwd');
});

test('Should extract the error of an HTML page', () => {
    expect(getPageError('<div class="alert-danger">Line 1<br/>Line 2</div>')).toBe('Line 1\nLine 2');
    expect(getPageError('<p>error</p>')).toBeUndefined();
});
