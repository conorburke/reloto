import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ToolDeletedEvent } from '@reloto/common';

import { Tool } from '../../models/tool';
import { queueGroupName } from './queue-group-name';

export class ToolDeletedListener extends Listener<ToolDeletedEvent> {
    subject: Subjects.ToolDeleted = Subjects.ToolDeleted;
    queueGroupName = queueGroupName;

    async onMessage(data: ToolDeletedEvent['data'], msg: Message) {
        // const tool = await Tool.findById(data.id);
        // const tool = await Tool.findOne({
        //     _id: data.id,
        //     version: data.version - 1
        // });

        const tool = await Tool.findByEvent(data);

        
        if (!tool) {
            throw new Error('Tool not found');
        }

        await tool.remove();

        msg.ack();
    }
}