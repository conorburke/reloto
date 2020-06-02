import request from 'supertest';

import { app } from '../../app';
import { Tool } from '../../models/tool';

import { natsWrapper } from '../../nats-wrapper';

// // this looks for an identical named file in the __mocks__ dir in namespace where file is located
// jest.mock('../../nats-wrapper');

it('has a route handler listening to /api/tools for post requests', async () => {
    const response = await request(app)
        .post('/api/tools')
        .send({})

    expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    await request(app)
        .post('/api/tools')
        .send({})
        .expect(401);
});

it('returns a status other than 401 if signed in', async () => {
    const response = await request(app)
        .post('/api/tools')
        .set('Cookie', global.signup())
        .send({});
    expect(response.status).not.toEqual(401);
})

it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tools')
        .set('Cookie', global.signup())
        .send({
            title: '',
            category: 'cat',
            description: 'des',
            price: 10,
            address1: 'addr1',
            address2: 'addr2',
            city: 'city',
            region: 'region',
            zipcode: '12345',
        })
        .expect(400);

    await request(app)
        .post('/api/tools')
        .set('Cookie', global.signup())
        .send({
            category: 'cat',
            description: 'des',
            price: 10,
            address1: 'addr1',
            address2: 'addr2',
            city: 'city',
            region: 'region',
            zipcode: '12345',
        })
        .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tools')
        .set('Cookie', global.signup())
        .send({
            title: 'tool1',
            category: 'cat',
            description: 'des',
            price: -10,
            address1: 'addr1',
            address2: 'addr2',
            city: 'city',
            region: 'region',
            zipcode: '12345',
        })
        .expect(400);

    await request(app)
        .post('/api/tools')
        .set('Cookie', global.signup())
        .send({
            title: 'tool1',
            category: 'cat',
            description: 'des',
            address1: 'addr1',
            address2: 'addr2',
            city: 'city',
            region: 'region',
            zipcode: '12345',
        })
        .expect(400);
});

it('creates a tool with valid inputs', async () => {
    // add in a check to make sure a tool was saved

    let tools = await Tool.find({});
    expect(tools.length).toEqual(0);


    await request(app)
            .post('/api/tools')
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
            })
            .expect(201);
    
    tools = await Tool.find({});
    expect(tools.length).toEqual(1)
    expect(tools[0].title).toEqual('tool1');
});

it('publishes an event', async () => {
    await request(app)
    .post('/api/tools')
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
    })
    .expect(201);

    console.log(natsWrapper);

    // tests that the event publisher is actually called
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
