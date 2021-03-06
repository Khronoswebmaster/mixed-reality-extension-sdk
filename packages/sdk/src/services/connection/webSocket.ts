/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as WS from 'ws';
import { EventedConnection } from '.';
import { Message } from '../..';

/**
 * An implementation of the Connection interface that wraps a WebSocket.
 */
export class WebSocket extends EventedConnection {
    // tslint:disable-next-line:variable-name
    constructor(private _ws: WS) {
        super();

        this._ws.on('close', () => {
            super.close();
        });

        this._ws.on('message', (json: WS.Data) => {
            // Uncomment to introduce latency on incoming messages.
            // setTimeout(() => {
            const message: Message = JSON.parse(json as string);
            super.recv(message);
            // }, 250);
        });

        super.on('send', (message: Message) => {
            try {
                const json = JSON.stringify(message);
                this._ws.send(json);
            } catch (e) {
                this.emit('error', e);
            }
        });
    }

    /** @override */
    public close(): void {
        try {
            this._ws.close();
        } catch (e) {
        }
    }
}
