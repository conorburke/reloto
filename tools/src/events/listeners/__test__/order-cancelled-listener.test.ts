import { OrderCancelledEvent, OrderStatus } from '@reloto/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Tool } from '../../../models/tool';

const setup = async () => {
    // create a listener instance
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = mongoose.Types.ObjectId().toHexString();

    // create and save a tool
    const tool = Tool.build({
        title: 'tool1',
        category: 'cat',
        description: 'des',
        price: 10,
        address1: 'addr1',
        address2: 'addr2',
        city: 'city',
        region: 'region',
        zipcode: 'zipcode',
        ownerId: 'user1',
    });
    tool.set({ orderId });
    await tool.save();

    // create the fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        status: OrderStatus.Cancelled,
        customerId: 'anything',
        expiresAt: 'timestamp',
        tool: {
            id: tool.id,
        }   
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, tool, data, msg, orderId };
}

// split into multiple tests
it('updates the tool, publishes an event, and acks the message', async () => {
    const { listener, tool, data, msg, orderId } = await setup();

    await listener.onMessage(data, msg);

    const updatedTool = await Tool.findById(tool.id);
    expect(updatedTool?.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

