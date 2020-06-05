import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ToolCreatedEvent } from '@reloto/common';

import { Tool } from '../../models/tool';
import { queueGroupName } from './queue-group-name';

export class ToolCreatedListener extends Listener<ToolCreatedEvent> {
    subject: Subjects.ToolCreated = Subjects.ToolCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: ToolCreatedEvent['data'], msg: Message) {
        const { id, title, price } = data;
        const tool = Tool.build({
            id, title, price
        });
        await tool.save();

        msg.ack();
    }
}