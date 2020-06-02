import request from 'supertest';
import { app } from '../../app';

const createTool = () => {
    return request(app)
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
        ownerId: 'ownerId'
    });
}


it('can fetch a list of tools', async () => {
    await createTool();
    await createTool();
    await createTool();

    const response = await request(app)
        .get('/api/tools')
        .send()
        .expect(200);

    expect(response.body.length).toEqual(3);
})