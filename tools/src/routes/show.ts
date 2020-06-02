import express, { Request, Response } from 'express';
import { NotFoundError } from '@reloto/common';

import { Tool } from '../models/tool';

const router = express.Router();

router.get('/api/tools/:id', async (req: Request, res: Response) => {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
        throw new NotFoundError();
    }

    res.send(tool);
});

export { router as showToolRouter };