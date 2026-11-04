import { basename } from 'node:path';

const SIZE_UNITS = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

export const formatSize = (bytes) => {
    if (bytes < 1024) return `${Math.round(bytes)} bytes`;

    const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), SIZE_UNITS.length - 1);

    return `${(bytes / 1024 ** unit).toFixed(2)} ${SIZE_UNITS[unit]}`;
};

export const formatProgress = (transferred, total, seconds) => {
    const speed = transferred / seconds;
    const percent = total ? (transferred / total) * 100 : 0;
    const remaining = total ? Math.round((total - transferred) / speed) : 0;

    return `Download: ${percent.toFixed(1)}% Speed: ${formatSize(speed)} ${formatSize(transferred)}/${formatSize(total)} Remaining: ${remaining}sec`;
};

export const getFilename = (link) => basename(decodeURIComponent(new URL(link).pathname));

export const getPageError = (page) => page.match(/danger">([^"]+)<\/div>/)?.[1].replace(/<br\/>/gi, '\n');
