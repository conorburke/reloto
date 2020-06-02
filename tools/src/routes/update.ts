import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, NotFoundError, requireAuth, NotAuthorizedError, BadRequestError } from '@reloto/common';
import { natsWrapper } from '../nats-wrapper';

import { Tool } from '../models/tool';
import { ToolUpdatedPublisher } from '../events/publishers/tool-updated-publisher';

const router = express.Router();

router.put('/api/tools/:id', 
    requireAuth, 
    [
        body('title').not().isEmpty().withMessage('Title is required'),
        body('category').not().isEmpty().withMessage('Category is required'),
        body('address1').not().isEmpty().withMessage('Address 1 is required'),
        body('address2').not().isEmpty().withMessage('Address 2 is required'),
        body('city').not().isEmpty().withMessage('City is required'),
        body('region').not().isEmpty().withMessage('Region / State is required'),
        body('zipcode').not().isEmpty().withMessage('Zipcode is required'),
        body('price')
          .isFloat({ gt: 0 })
          .withMessage('Price must be greater than 0'),
      ],
    validateRequest,
    async (req: Request, res: Response) => {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
        throw new NotFoundError();
    }

    if (tool.ownerId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    if (tool.orderId) {
        // don't let the owner update the tool while it is being reserved
        throw new BadRequestError('Tool is reserved; cannot edit while reserved.');
    }

    tool.set({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        region: req.body.region,
        zipcode: req.body.zipcode
    });

    //this also save the variable tool to the updated tool
    await tool.save();

    new ToolUpdatedPublisher(natsWrapper.client).publish({
        id: tool.id,
        version: tool.version,
        title: tool.title,
        category: tool.category,
        description: tool.description,
        price: tool.price,
        address1: tool.address1,
        address2: tool.address2,
        city: tool.city,
        region: tool.region,
        zipcode: tool.zipcode,
        ownerId: tool.ownerId
    });

    res.send(tool);
});

export { router as updateToolRouter };