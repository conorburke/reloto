import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Tool } from '../../models/tool';
import { cookie } from 'express-validator';

const buildTool = async () => {
    const tool = Tool.build({
        title: 'tool',
        price: 13,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await tool.save();

    return tool;
}

it('fetches orders for the current user', async () => {
    // create three tools, one reserved by one user and two reserved by another user
    const tool1 = await buildTool();
    const tool2 = await buildTool();
    const tool3 = await buildTool();
    
    const user1 = global.signup();
    const user2 = global.signup();

    await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ toolId: tool1.id})
        .expect(201);
    
    const { body: body1 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ toolId: tool2.id})
        .expect(201);
    
    const { body: body2 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ toolId: tool3.id})
        .expect(201);

    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', user2)
        .expect(200);

    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(body1.id);
    expect(response.body[1].id).toEqual(body2.id);
    expect(response.body[0].tool.id).toEqual(tool2.id);
    expect(response.body[1].tool.id).toEqual(tool3.id);

    // console.log(response.body);
});