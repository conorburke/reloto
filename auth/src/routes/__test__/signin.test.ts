import request from 'supertest';

import { app } from '../../app';

it('fails when an email that dne is supplied', async () => {
    await request(app).post('/api/users/signin')
            .send({
                email: 'test@test.com',
                password: '12345678'
            })
            .expect(400);
});

it('fails when an incorect password is supplied', async () => {
    await request(app).post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: '12345678'
            })
            .expect(201);
    
    await request(app).post('/api/users/signin')
            .send({
                email: 'test@test.com',
                password: '123456789'
            })
            .expect(400); 
});

it('responds with a cookie when given valid credentials', async () => {
    await request(app).post('/api/users/signup')
            .send({
                email: 'test@test.com',
                password: '12345678'
            })
            .expect(201);
    
    const response = await request(app).post('/api/users/signin')
            .send({
                email: 'test@test.com',
                password: '12345678'
            })
            .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});