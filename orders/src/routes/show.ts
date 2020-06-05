import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError, NotAuthorizedError } from '@reloto/common';

import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('tool');

    if (!order) {
        throw new NotFoundError();
    }

    if (order.customerId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    res.send(order);
} );

export { router as showOrderRouter };