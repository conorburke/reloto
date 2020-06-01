import request from 'supertest';

import { app } from '../../app';
import { signinRouter } from '../signin';

it('should respond with details about current user', async () => {
    // const signupResponse = await request(app).post('/api/users/signup')
    //         .send({
    //             email: 'test@test.com',
    //             password: '1234'
    //         })
    //         .expect(201);
    
    // const cookie = signupResponse.get('Set-Cookie'); 
            
    const cookie = await global.signup();

    const response = await request(app).get('/api/users/currentuser')
            .set('Cookie', cookie)
            .send()
            .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('should return null if not authenticated', async () => {
    const response = await request(app)
            .get('/api/users/currentuser')
            .send()
            .expect(200);

    expect(response.body.currentUser).toBeNull();
});