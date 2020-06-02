import express , { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@reloto/common';

import { Tool } from '../models/tool';
import { ToolCreatedPublisher } from '../events/publishers/tool-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
    '/api/tools',
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
      const { title, category, description, price, address1, address2, city, region, zipcode } = req.body;

      const tool = Tool.build({
        title,
        category, 
        description, 
        price, 
        address1, 
        address2, 
        city, 
        region, 
        zipcode,
        ownerId: req.currentUser!.id
      })
      await tool.save();
      await new ToolCreatedPublisher(natsWrapper.client).publish({
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
      })

      res.status(201).send(tool);
    }
  );

export { router as createToolRouter };
