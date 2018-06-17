import fs from 'fs';

const getInfosTorrent = async (idTorrent, token) => {

};

const selectFiles = async () => {

};

const addTorrent = async () => {

};

const addMagnet = async () => {

};

export const isMagnet = magnet => magnet.match(/^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{20,50}/i);

export const isTorrent = torrent => torrent.match(/\.torrent$/) && fs.existsSync(torrent);

export const magnetToDDL = async () => {

};

export const torrentToDDL = async () => {

};
