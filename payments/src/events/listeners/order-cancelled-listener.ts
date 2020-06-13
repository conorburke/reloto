import { OrderCancelledEvent, Subjects, Listener, OrderStatus } from '@reloto/common';

import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // this finds most recent order; may not strictly need because if not order then one hasn't been created so shouldn't be cancelled
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        });

        if (!order) {
            throw new Error('Order not found.');
        }

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        msg.ack();
    }

}