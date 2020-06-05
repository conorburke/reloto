import { Listener, ExpirationCompleteEvent, Subjects, OrderStatus } from '@reloto/common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('tool');

        if (!order) {
            throw new Error('Order not found');
        }
        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        // don't need to set the tool field to null because want to keep track of tool number
        // also, the Cancelled status works with the isReserved function; it is not one of the enums that say the tool is reserved
        order.set({
            status: OrderStatus.Cancelled
        });
        await order.save();
        
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            expiresAt: order.expiresAt.toISOString(),
            tool: {
                id: order.tool.id
            }
        });

        msg.ack();
    }

}