import request from 'supertest';
import mongoose from 'mongoose';
import { OrderStatus } from '@reloto/common';

import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';

// use the stripe mock file
jest.mock('../../stripe');

it('returns a 404 when purchasing an order that DNE', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup())
        .send({
            token: 'token',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that the user does not own', async () => {
    const order = await Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        customerId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 10,
        status: OrderStatus.Created
    }).save()

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup())
        .send({
            token: 'token',
            orderId: order.id
        })
        .expect(401);
});


it('returns a 400 when purchasing a cancelled order', async () => {
    const customerId = mongoose.Types.ObjectId().toHexString();
    const order = await Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        customerId,
        version: 0,
        price: 10,
        status: OrderStatus.Cancelled
    }).save()

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(customerId))
    .send({
        token: 'token',
        orderId: order.id
    })
    .expect(400);
});

it('returns a 201 with valid input', async () => {
    const customerId = mongoose.Types.ObjectId().toHexString();
    const order = await Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        customerId,
        version: 0,
        price: 10,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup(customerId))
        .send({
            // token that works for stripe accounts in test mode
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(10*100);
    expect(chargeOptions.currency).toEqual('usd');

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: 'testId'
    });
    expect(payment).not.toBeNull();
});