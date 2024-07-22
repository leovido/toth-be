// ts-ignore
import express, { Router, type Request, type Response } from 'express';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { z } from 'zod';
import { Nomination } from '../nominations/nominationModel';

export const historyRegistry = new OpenAPIRegistry();
export const historyRouter: Router = express.Router();

historyRegistry.registerPath({
  method: 'get',
  path: '/history',
  tags: ['History'],
  responses: createApiResponse(z.null(), 'Success')
});

historyRouter.get('/history', async (req: Request, res: Response, next) => {
  try {
    const nominations = await Nomination.find({
      fid: { $eq: req.query.fid }
    }).limit(5);

    res.status(200).send(nominations);
  } catch (error) {
    next(error);
  }
});

historyRouter.get('/history', async (req: Request, res: Response, next) => {
  try {
    const nominations = await Nomination.find({
      fid: {
        $eq: req.query.fid
      }
    });

    res.json(nominations);
  } catch (error) {
    next(error);
  }
});
