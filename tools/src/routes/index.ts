import express, { Request, Response } from 'express';

import { Tool } from '../models/tool';

const router = express.Router();

router.get('/api/tools', async (req: Request, res: Response) => {
    const tools = await Tool.find({});

    res.send(tools);
});

export {router as indexToolRouter};