import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Tool } from '../../models/tool';
import { cookie } from 'express-validator';
import { natsWrapper } from '../../nats-wrapper';

const loanStart = "2020-06-15T14:00:00.000Z";
const loanEnd = "2020-06-15T16:00:00.000Z";

it('marks an order as cancelled', async () => {
    const tool = Tool.build({
        title: 'tool1',
        price: 13,
        id: mongoose.Types.ObjectId().toHexString()
    });

    await tool.save();
    
    const user = global.signup();

    const { body: createdOrder } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ 
            toolId: tool.id,
            loanStart,
            loanEnd
        })
        .expect(201);

     await request(app)
        .delete(`/api/orders/${createdOrder.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    const updatedOrder = await Order.findById(createdOrder.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

// it.todo('emits an event when order is cancelled');

it('emits an order cancelled event', async () => {
    const tool = Tool.build({
        title: 'tool1',
        price: 13,
        id: mongoose.Types.ObjectId().toHexString()
    });

    await tool.save();
    
    const user = global.signup();

    const { body: createdOrder } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ 
            toolId: tool.id,
            loanStart,
            loanEnd
        })
        .expect(201);

     await request(app)
        .delete(`/api/orders/${createdOrder.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
