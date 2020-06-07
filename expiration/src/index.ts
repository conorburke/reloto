import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined')
    }

    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined')
    }

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined')
    }

    try {
        // third argument, url, is based off of the k8s file for nats
        // await natsWrapper.connect('reloto', 'randomfornow', 'http://nats-srv:4222');
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
        // handle graceful shutdown
        // have it here so that we don't have shutdown functionallity hidden
        natsWrapper.client.on('close', () => {
            console.log('Nats connection closed');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();

    } catch (err) {
        console.log('error connecting to nats client', err);
    }
}

start();


