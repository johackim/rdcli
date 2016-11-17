import coMocha from 'co-mocha'; // eslint-disable-line
import { assert } from 'chai';
import server from './testServer';

global.assert = assert;
global.server = server();
