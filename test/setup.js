import coMocha from 'co-mocha';
import { assert } from 'chai';
import server from './testServer';

global.assert = assert;
global.server = server();
