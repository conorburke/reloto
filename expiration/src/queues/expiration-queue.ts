import Queue from 'bull';

import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
    orderId: string;
}

// giving the Payload types gives TS the knowledge it needs to make sure the queue is getting the right info
const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        // this is in the relevant k8s file
        host: process.env.REDIS_HOST
    }
});

expirationQueue.process(async (job) => {
    console.log('Publishing an expiration:complete event for orderId', job.data.orderId);

    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    })
});

export { expirationQueue };