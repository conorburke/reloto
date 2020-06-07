import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@reloto/common';
import { body } from 'express-validator';

import { Tool } from '../models/tool'
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

// an order will expire in 10 minutes, freeing a tool to be reserved by another user
const EXPIRATION_WINDOW_SECONDS = 10 * 60;

const router = express.Router();

router.post('/api/orders', requireAuth, [
    // this mongoose adds a tight coupling to tools db. should delete
    body('toolId').not().isEmpty().custom((input: string) => mongoose.Types.ObjectId.isValid(input)).withMessage('ToolId must be provided'),
    body('loanStart').not().isEmpty().withMessage('loanStart must be provided'),
    body('loanEnd').not().isEmpty().withMessage('loanEnd must be provided'),
    body('loanStart').isISO8601().toDate().withMessage('loanStart must be in proper datetime format'),
    body('loanEnd').isISO8601().toDate().withMessage('loanEnd must be in proper datetime format'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const { toolId } = req.body;
        const loanStart = new Date(req.body.loanStart);
        const loanEnd = new Date(req.body.loanEnd);

        // orders must be for at least one hour
        const hour = 60 * 60 * 1000;
        const tempLoanStart = new Date(loanStart.getTime() + hour);
        if (loanEnd < tempLoanStart) {
            throw new Error('loanEnd must be greater than loanStart by at least one hour.');
        }

        // find the tool the user is trying to locate
        const tool = await Tool.findById(toolId);
        
        if (!tool) {
            throw new NotFoundError();
        }

        // make sure the tool is not already reserved.
        const isReserved = await tool.isReserved(new Date(loanStart), new Date(loanEnd));
        if (isReserved) {
            throw new BadRequestError('Tool is already reserved for this time period.');
        }

        // calculate the expiration date for this order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

        // build the order and save it to the database
        const order = Order.build({
            customerId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            loanStart: new Date(loanStart),
            loanEnd: new Date(loanEnd),
            tool 
        });

        await order.save();


        //  publish an event saying an order was created
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            customerId: order.customerId,
            expiresAt: order.expiresAt.toISOString(),
            tool: {
                id: tool.id,
                price: tool.price
            }
        })
        
        // send the response
        res.status(201).send(order);
    }
);

export { router as createOrderRouter };