import { OrderCreatedEvent, OrderStatus } from '@reloto/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Tool } from '../../../models/tool';

const setup = async () => {
    // create a listener instance
    const listener = new OrderCreatedListener(natsWrapper.client);

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
    await tool.save();

    // create the fake data event
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        customerId: 'anything',
        expiresAt: 'timestamp',
        tool: {
            id: tool.id,
            price: tool.price
        }   
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, tool, data, msg };
}

it('sets the userId of the tool', async () => {
    const { listener, tool, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTool = await Tool.findById(tool.id);

    expect(updatedTool!.orderId).toEqual(data.id);
});

it('will ack the message', async () => {
    const { listener, tool, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a tool updated event', async () => {
    const { listener, tool, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    
    // tell TS this is ok because we are mocking it
    // // @ts-ignore
    // console.log(natsWrapper.client.publish.mock.calls[0][1]);

    // a better way to have TS work with jest mock
    const toolUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(data.id).toEqual(toolUpdatedData.orderId);
});