import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@reloto/common';

import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { stripe } from '../stripe';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments', 
    requireAuth,
    [
        body('token').not().isEmpty(),
        body('orderId').not().isEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError();
        }

        // put bang after currentUser because the requireAuth middleware above checks for this but TS doesn't know that
        // could also check for an error like so:
        // if (!req.currentUser) {
        //     throw new Error();
        // }
        if(order.customerId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if(order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('The order is already cancelled, cannot pay for a cancelled order');
        }

        const charge = await stripe.charges.create({
            currency: 'usd',
            // order.price is in dollars, convert it to cents
            amount: order.price * 100,
            source: token
        });

        //TODO implement a better test for this without relying on a mock
        if (process.env.NODE_ENV === 'test') {
            charge.id = 'testId';
        }
        
        const payment = Payment.build({
            orderId,
            stripeId: charge.id
        });
        await payment.save();
        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        })

        res.status(201).send({ id: payment.id });
    }
);

export { router as createChargeRouter };