import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';

it('returns a 404 if the tool is not found', async () => {
    await request(app)
            .get(`/api/tools/${mongoose.Types.ObjectId().toHexString()}`)
            .send()
            .expect(404);
});

it('returns the tool if the tool is found', async () => {
    const title = 'tool';
    const price = 10
    
    const response = await request(app)
                            .post('/api/tools')
                            .set('Cookie', global.signup())
                            .send({
                                title,
                                category: 'cat',
                                description: 'des',
                                price,
                                address1: 'addr1',
                                address2: 'addr2',
                                city: 'city',
                                region: 'region',
                                zipcode: '12345',
                            })
                            .expect(201);

    const toolResponse = await request(app)
                                    .get(`/api/tools/${response.body.id}`)
                                    .send()
                                    .expect(200);

    expect(toolResponse.body.title).toEqual(title);
    expect(toolResponse.body.price).toEqual(price);
});