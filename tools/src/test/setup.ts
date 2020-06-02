import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../app';

declare global {
    namespace NodeJS {
        interface Global {
            signup(): string[]
        }
    }
}

// this looks for an identical named file in the __mocks__ dir in namespace where file is located for any file that uses the nats-wrapper
jest.mock('../nats-wrapper');


let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY='test';

    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
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
global.signup = () => {
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