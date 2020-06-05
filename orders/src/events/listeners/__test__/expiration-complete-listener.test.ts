import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Tool } from '../../../models/tool';
import { Order, OrderStatus } from '../../../models/order';
import { ExpirationCompleteEvent } from '@reloto/common';

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const tool = Tool.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'tool1',
        price: 13
    });
    await tool.save();

    const order = Order.build({
        status: OrderStatus.Created,
        customerId: 'random',
        expiresAt: new Date(),
        tool
    });
    await order.save();

    const data: ExpirationCompleteEvent['data'] ={
        orderId: order.id
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, tool, data, msg };
}

it('updates the order status to cancelled', async () => {
    const { listener, order, tool, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit and OrderCancelled event', async () => {
    const { listener, order, tool, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // calls is the array of the different times publish was invoked
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
    const { listener, order, tool, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});