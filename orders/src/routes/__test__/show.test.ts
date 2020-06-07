import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Tool } from '../../models/tool';
import { cookie } from 'express-validator';

const loanStart = "2020-06-15T14:00:00.000Z";
const loanEnd = "2020-06-15T16:00:00.000Z";

it('fetches the order', async () => {
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

    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/${createdOrder.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(createdOrder.id);
});

it('returns an error if a user tries to fetch another users order', async () => {
    const tool = Tool.build({
        title: 'tool1',
        price: 13,
        id: mongoose.Types.ObjectId().toHexString()
    });

    await tool.save();
    
    const user = global.signup();
    const user2 = global.signup();

    const { body: createdOrder } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ 
            toolId: tool.id,
            loanStart,
            loanEnd
        })
        .expect(201);

    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/${createdOrder.id}`)
        .set('Cookie', user2)
        .send()
        .expect(401);
});