import express from 'express';
import { json } from 'body-parser';
// below import is for async error handling for express instead of using next keyword
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@reloto/common';

import { deleteOrderRouter } from './routes/delete';
import { indexOrderRouter } from './routes/index';
import { createOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';

const app = express();
app.set('trust proxy', true);
app.use(json());

if (!process.env.RELOTO_COOKIE_SECRET) {
    throw new Error('Cookie secret not defined in environment');
}
if (process.env.NODE_ENV === 'test') {
    app.use(cookieSession({
        signed: false,
        secure: false
    }));
} else {
    app.use(cookieSession({
        keys: [process.env.RELOTO_COOKIE_SECRET],
        secure: true
    }));
}
app.use(currentUser);
// app.get('/api/users/currentuser', (req, res) => {
//     res.send('Hello World');
// })


app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(createOrderRouter);
app.use(showOrderRouter);


app.all('*', async () => {
    // don't have to use next(new NotFoundError()) due to the express-async-errors package imported above
    throw new NotFoundError();
    // next(new NotFoundError());
})

app.use(errorHandler);

// test auth github action deployment workflow

export { app };