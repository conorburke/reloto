import { ToolCreatedEvent, ToolDeletedEvent } from '@reloto/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { ToolDeletedListener } from '../tool-deleted-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Tool } from '../../../models/tool';

const setup = async () => {
    // create a listener
    const listener = new ToolDeletedListener(natsWrapper.client);

    // create and save a tool
    const tool = Tool.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'tool1',
        price: 13
    });
    await tool.save();

    // create a fake data object
    const data: ToolCreatedEvent['data'] = {
        version: tool.version + 1,
        id: tool.id,
        title: 'tool1updated',
        price: 14,
        category: 'cat',
        description: 'desc',
        address1: 'addr1',
        address2: 'addr2',
        city: 'city',
        region: 'region',
        zipcode: '12345',
        ownerId: new mongoose.Types.ObjectId().toHexString()
    }

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    // return all
    return { msg, data, tool, listener };
};

it('finds and deletes a tool', async () => {
    const { msg, data, tool, listener } = await setup();

    await listener.onMessage(data, msg);

    const toolToDelete = await Tool.findById(tool.id);

    await tool.remove();

    expect((await Tool.find()).length).toEqual(0);
});

it('will ack the message', async () => {
    const { msg, data, tool, listener } = await setup();

    await listener.onMessage(data, msg);
    
    expect(msg.ack).toHaveBeenCalled(); 
});

it('does not call ack if the event has a version too far in the future', async () => {
    const { msg, data, tool, listener } = await setup();

    data.version = data.version + 10;

    try {
        await listener.onMessage(data, msg);
    } catch (err) {

    }

    expect(msg.ack).not.toHaveBeenCalled(); 
});