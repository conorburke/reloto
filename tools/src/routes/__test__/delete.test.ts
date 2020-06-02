import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Tool } from '../../models/tool';

it('returns a 404 if id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .delete(`/api/tools/${id}`)
        .set('Cookie', global.signup())
        .expect(404);
});

it('returns a 401 if user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .delete(`/api/tools/${id}`)
        .expect(401);
});

it('returns a 401 if the user does not own the tool', async () => {
    const response = await request(app)
        .post(`/api/tools`)
        .set('Cookie', global.signup())
        .send({
            title: 'tool1',
            category: 'cat',
            description: 'des',
            price: 10,
            address1: 'addr1',
            address2: 'addr2',
            city: 'city',
            region: 'region',
            zipcode: '12345',
        });

    await request(app)
        .delete(`/api/tools/${response.body.id}`)
        .set('Cookie', global.signup())
        .expect(401);   
});

it('deletes the tool tool is owned and unreserved', async () => {
    const cookie = global.signup();
    const response = await request(app)
        .post(`/api/tools`)
        .set('Cookie', cookie)
        .send({
            title: 'tool1',
            category: 'cat',
            description: 'des',
            price: 10,
            address1: 'addr1',
            address2: 'addr2',
            city: 'city',
            region: 'region',
            zipcode: '12345',
        });

    await request(app)
        .delete(`/api/tools/${response.body.id}`)
        .set('Cookie', cookie)
        .expect(204);   
});

it('publishes an event', async () => {
    const cookie = global.signup();
    const response = await request(app)
        .post(`/api/tools`)
        .set('Cookie', cookie)
        .send({
            title: 'tool1',
            category: 'cat',
            description: 'des',
            price: 10,
            address1: 'addr1',
            address2: 'addr2',
            city: 'city',
            region: 'region',
            zipcode: '12345',
        });

    await request(app)
        .delete(`/api/tools/${response.body.id}`)
        .set('Cookie', cookie)
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the tool is reserved', async () => {
    const cookie = global.signup();
    const response = await request(app)
        .post(`/api/tools`)
        .set('Cookie', cookie)
        .send({
            title: 'tool1',
            category: 'cat',
            description: 'des',
            price: 10,
            address1: 'addr1',
            address2: 'addr2',
            city: 'city',
            region: 'region',
            zipcode: '12345',
        });

    const tool = await Tool.findById(response.body.id);
    tool!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
    await tool!.save();

    await request(app)
        .delete(`/api/tools/${response.body.id}`)
        .set('Cookie', cookie)
        .expect(401);
});