import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
    private _client?: Stan;

    get client() {
        if (!this._client) {
            throw new Error('Cannot access Nats client before connecting');
        }
        return this._client;
    }

    // modelled after mongoose
    connect(clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, { url });

        // this._client.on('connect', () => {
        //     console.log('Connected to Nats');
        // });

        return new Promise((resolve, reject) => {
            // don't need the !, can just use the ts getter
            // this._client!.on('connect', () => {
            this.client.on('connect', () => {
                console.log('Connected to Nats');
                resolve();
            });
            this.client.on('error', (err) => {
                reject(err);
            })
        })

    }
}

export const natsWrapper = new NatsWrapper();