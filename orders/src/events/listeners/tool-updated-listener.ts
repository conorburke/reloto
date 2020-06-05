import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ToolUpdatedEvent } from '@reloto/common';

import { Tool } from '../../models/tool';
import { queueGroupName } from './queue-group-name';

export class ToolUpdatedListener extends Listener<ToolUpdatedEvent> {
    subject: Subjects.ToolUpdated = Subjects.ToolUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: ToolUpdatedEvent['data'], msg: Message) {
        // const tool = await Tool.findById(data.id);
        // const tool = await Tool.findOne({
        //     _id: data.id,
        //     version: data.version - 1
        // });

        const tool = await Tool.findByEvent(data);

        
        if (!tool) {
            throw new Error('Tool not found');
        }

        const { title, price } = data;

        tool.set({
            title, price
        });

        await tool.save();

        msg.ack();
    }
}