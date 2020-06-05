import { ToolCreatedEvent } from '@reloto/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { ToolCreatedListener } from '../tool-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Tool } from '../../../models/tool';

const setup = async () => {
    // create an instance of the listener
    const listener = new ToolCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: ToolCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'tool1',
        price: 10,
        category: 'cat',
        description: 'desc',
        address1: 'addr1',
        address2: 'addr2',
        city: 'city',
        region: 'region',
        zipcode: '12345',
        ownerId: new mongoose.Types.ObjectId().toHexString()
    }

    // create a fake message object (for the ack)
    // we don't care about most props/methods for msg so use ts ignore
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg};
};

it('creates and saves a tool', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage funciton with the data object and message object
    await listener.onMessage(data, msg);

    // write assertions to make sure the tool was created

    const tool = await Tool.findById(data.id);

    expect(tool).toBeDefined();
    expect(tool!.id).toEqual(data.id);
    expect(tool!.title).toEqual(data.title);

});

it('will ack the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage funciton with the data object and message object
    await listener.onMessage(data, msg);

    // write assertions to make sure the message was acked
    expect(msg.ack).toHaveBeenCalled();

});