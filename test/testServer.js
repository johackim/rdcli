/* eslint-disable */

import jsonServer from 'json-server';
import bodyParser from 'body-parser';

export default () => {
    const server = jsonServer.create();
    server.use(bodyParser.json());

    const defaultRoute = server._router.stack.slice();
    server.reset = () => {
        server._router.stack = defaultRoute.slice();
    };

    server.listen(3000);

    return server;
};
