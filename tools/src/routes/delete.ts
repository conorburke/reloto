import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError, NotAuthorizedError } from '@reloto/common';

import { Tool } from '../models/tool';
import { ToolDeletedPublisher } from '../events/publishers/tool-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/tools/:id', requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;

    const tool = await Tool.findById(id);

    if (!tool) {
        throw new NotFoundError();
    }

    if (tool.ownerId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    // can't delete tool if currently reserved
    // TODO have workflow to cancel reservation first
    if (tool.orderId) {
        throw new NotAuthorizedError();
    }

    await tool.save();

    // publish the event
    new ToolDeletedPublisher(natsWrapper.client).publish({
        id: tool.id,
        version: tool.version,
        
    })

    await Tool.deleteOne(tool);
    
    res.status(204).send(tool);
} );

export { router as deleteToolRouter };