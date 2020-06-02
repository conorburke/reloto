import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const start = async () => {
    if (!process.env.RELOTO_JWT_KEY) {
        throw new Error('RELOTO_JWT_KEY must be defined');
    }

    if (!process.env.RELOTO_MONGO_URI_TOOLS) {
        throw new Error('RELOTO_MONGO_URI_TOOLS must be defined');
    }

    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined');
    }

    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined');
    }

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined');
    }

    try {
        console.log(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
        // third argument, url, is based off of the k8s file for nats
        // await natsWrapper.connect('reloto', 'name_of_pod', 'http://nats-srv:4222');
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
        new OrderCancelledListener(natsWrapper.client).listen();

    } catch (err) {
        console.log('error connecting to nats client', err);
    }

    try {
        await mongoose.connect(process.env.RELOTO_MONGO_URI_TOOLS, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('connected to mongo'); 
    } catch (err) {
        console.log('error connecting to mongo', err);
    }
    app.listen(3000, () => {
        console.log('Listening on port 3000.')
    });
}

start();


