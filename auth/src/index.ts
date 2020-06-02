import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
    if (!process.env.RELOTO_JWT_KEY) {
        throw new Error('RELOTO_JWT_KEY must be defined');
    }

    if (!process.env.RELOTO_MONGO_URI_AUTH) {
        throw new Error('RELOTO_MONGO_URI must be defined')
    }

    try {
        await mongoose.connect(process.env.RELOTO_MONGO_URI_AUTH, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('connected to mongo'); 
    } catch (err) {
        console.log('error connecting to mongo', err);
    }
    app.listen(3000, () => {
        console.log('Listening on port 3000.')
    });
}

start();


