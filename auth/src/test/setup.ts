import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../app';

declare global {
    namespace NodeJS {
        interface Global {
            signup(): Promise<string[]>
        }
    }
}

let mongo: any;

beforeAll(async () => {
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

// global helper function for test environment only
global.signup = async () => {
    // const email = 'test@test.com';
    // const password = '12345678';

    // const response = await request(app)
    //     .post('/api/users/signup')
    //     .send({ email, password })
    //     .expect(201);

    // const cookie = response.get('Set-Cookie');

    // return cookie;
     // build a jwt payload {id, email}
     const payload = {
        //use a random id to be able to test multiple users
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    //create the token 

    const token = jwt.sign(payload, process.env.RELOTO_JWT_KEY!)

    // build session object{ jwt: MY_JWT}

    const session = { jwt: token };

    // turn that session into JSON

    const sessionJSON = JSON.stringify(session);

    // take json and encode it as base64

    const base64 = Buffer.from(sessionJSON).toString('base64')

    // return a string that thats the cookie with the encoded data
    // put in an array to make supertest happy
    return [`express:sess=${base64}`];
}