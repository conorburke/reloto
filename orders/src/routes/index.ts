import express, { Request, Response } from 'express';
import { requireAuth } from '@reloto/common';

import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth,  async (req: Request, res: Response) => {
    const orders = await Order.find({
        customerId: req.currentUser!.id
    }).populate('tool');
    
    res.send(orders);
} );

export { router as indexOrderRouter };