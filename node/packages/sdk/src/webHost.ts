/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as http from 'http';
import * as Restify from 'restify';
import { Adapter, Logger, MultipeerAdapter, NullLogger } from '.';

/**
 * Sets up an HTTP server, and generates an MRE context for your app to use.
 */
export class WebHost {
    // tslint:disable:variable-name
    private _adapter: Adapter;
    private _baseDir: string;
    private _baseUrl: string;
    // tslint:enable:variable-name

    public get adapter() { return this._adapter; }
    public get baseDir() { return this._baseDir; }
    public get baseUrl() { return this._baseUrl; }

    public constructor(
        options: { baseDir?: string, baseUrl?: string, port?: number, logger?: Logger }
            = { baseDir: '.', baseUrl: null, port: 3901, logger: new NullLogger() }
    ) {
        this._baseDir = options.baseDir;
        this._baseUrl = options.baseUrl;

        // create an http server
        const server = Restify.createServer({ name: 'Multi-peer Adapter + Static Host'});
        this.serveStaticFiles(server);

        // Create a Multi-peer adapter
        this._adapter = new MultipeerAdapter({ server, logger: options.logger });
        this._adapter.listen().catch();

        // start up the server
        try {
            server.listen(options.port);
        } catch (e) {
            options.logger.log('error', e);
        }
    }

    private serveStaticFiles(server: http.Server): void {
        const restify = server as Restify.Server;
        // The static files location
        if (!this._baseUrl) {
            this._baseUrl =
                process.env.BASE_URL || (
                    process.env.WEBSITE_HOSTNAME ?
                        `//${process.env.WEBSITE_HOSTNAME}` :
                        restify.url.replace(/\[::\]/, '127.0.0.1')
                );
        }
        // Setup static files route
        restify.get('/*', Restify.plugins.serveStatic({
            directory: this._baseDir,
            default: 'index.html'
        }));
    }
}
