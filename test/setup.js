import coMocha from 'co-mocha';
import { assert } from 'chai';
import server from './testServer';
import RealDebrid from '../src/real-debrid';

global.api = new RealDebrid();
global.assert = assert;
global.server = server();
