import express from 'express';
import { json } from 'body-parser';
// below import is for async error handling for express instead of using next keyword
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@reloto/common';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

const app = express();
app.set('trust proxy', true);
app.use(json());
// not signing cookie to allow for easier interop use. jwt is payload which is signed
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}));

// app.get('/api/users/currentuser', (req, res) => {
//     res.send('Hello World');
// })

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async () => {
    // don't have to use next(new NotFoundError()) due to the express-async-errors package imported above
    throw new NotFoundError();
    // next(new NotFoundError());
})

app.use(errorHandler);

export { app };