import co from 'co';
import { assert } from 'chai';
import server from './testServer';
import RealDebrid from '../src/real-debrid';

global.api = new RealDebrid();
global.assert = assert;
global.server = server();

// convert a generator to a function who take a callback
global.coCb = function (gen) {
    return function (done) {
        co(gen).then(done, done);
    };
};
