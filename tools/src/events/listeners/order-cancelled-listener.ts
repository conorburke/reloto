import { Listener, OrderCancelledEvent, Subjects } from '@reloto/common';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queue-group-name';
import { Tool } from '../../models/tool';
import { ToolUpdatedPublisher } from '../publishers/tool-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // find the tool that the order is reserving
        const tool = await Tool.findById(data.tool.id);

        // if no tool then throw error
        if(!tool) {
            throw new Error('Tool not found');
        }

        // mark the tool as reserved by setting the tool orderId property
        // use undefined instead of null because that works better with some 'does this exist' checks in other parts
        tool.set({ orderId: undefined})

        // save the tool
        await tool.save();
        // need to update the tool version to keep the services in sync
        // don't want to do this simple client import because will make testing more difficult (the natsWrapper is mocked in tests, so don't import it in the actual file)
        // new ToolUpdatedPublisher(natsWrapper.client)

        await new ToolUpdatedPublisher(this.client).publish({
            id: tool.id,
            version: tool.version,
            title: tool.title,
            category: tool.category,
            description: tool.description,
            price: tool.price,
            address1: tool.address1,
            address2: tool.address2,
            city: tool.city,
            region: tool.region,
            zipcode: tool.zipcode,
            ownerId: tool.ownerId,
            orderId: tool.orderId
        })

        // ack the message
        msg.ack();
    };
    
}