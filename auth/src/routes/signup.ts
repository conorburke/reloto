import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@reloto/common';

import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signup', [
    body('email').isEmail().withMessage('Valid email must be provided.'),
    body('password').trim().isLength({min: 8}).withMessage('Password must be 8 characters or longer.')
], validateRequest, async (req: Request, res: Response) => {
    // taken care of by validateRequst
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //     // use a custom middleware instead of writing out resp errors each time
    //     // return res.status(400).send(errors.array());
    //     // throw new Error('Invalid email or password');
    //     throw new RequestValidationError(errors.array());
    // }
    
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new BadRequestError('Email already exists');
    }

    const user = User.build({ email, password });
    await user.save();

    // generate JWT and store on session object
    const userJwt = jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.RELOTO_JWT_KEY!);

    req.session = {
        jwt: userJwt
    }

    res.status(201).send(user);
});

export { router as signupRouter };