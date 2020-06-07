import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Tool } from '../../models/tool';
import { cookie } from 'express-validator';
import { natsWrapper } from '../../nats-wrapper';

const loanStart = "2020-06-15T14:00:00.000Z";
const loanEnd = "2020-06-15T16:00:00.000Z";

it('returns an error if the tool DNE', async () => {
    const toolId = mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({
            toolId,
            loanStart,
            loanEnd
        })
        .expect(404);
});

it('returns an error if the tool is reserved', async () => {
    const tool = Tool.build({
        title: 'tool1',
        price: 13,
        id: mongoose.Types.ObjectId().toHexString()

    });
    await tool.save();

    const order = Order.build({
        customerId: 'randomuserid',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        loanStart: new Date(loanStart),
        loanEnd: new Date(loanEnd),
        tool
    });
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ 
            toolId: tool.id,
            // have the request coincide with the order built above
            loanStart: "2020-06-15T15:00:00.000Z",
            loanEnd: "2020-06-15T18:00:00.000Z"
        })
        .expect(400)
});

it('reserves a tool if allowed', async () => {
    const tool = Tool.build({
        title: 'tool1',
        price: 13,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await tool.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ 
            toolId: tool.id,
            loanStart,
            loanEnd
         })
        .expect(201);
});

//TODO
// it.todo('emits an order created event');

it('emits an order created event', async () => {
    const tool = Tool.build({
        title: 'tool1',
        price: 13,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await tool.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ 
            toolId: tool.id,
            loanStart,
            loanEnd
         })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});