// ts-ignore
import express, { Router, type Request, type Response } from 'express';
import { fetchDegenTips } from '@/degen/degenAPI';
import { Round } from '@/schemas/round';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { z } from 'zod';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { handleServiceResponse } from '@/common/utils/httpHandlers';
import { helperServiceInstance } from './helpersService';

export const helpersRegistry = new OpenAPIRegistry();
export const helpersRouter: Router = express.Router();

helpersRegistry.registerPath({
  method: 'get',
  path: '/helpers',
  tags: ['Helpers'],
  responses: createApiResponse(z.null(), 'Success')
});

helpersRouter.get('/degen-tips', async (req: Request, res: Response, next) => {
  try {
    const serviceResponse = await helperServiceInstance.fetchDegenTips(
      Number(req.query.fid)
    );
    handleServiceResponse(serviceResponse, res);
  } catch (error) {
    next(error);
  }
});

helpersRouter.get('/current-period', async (req, res: Response, next) => {
  try {
    const now = new Date();

    const rounds = await Round.find({
      $or: [
        {
          nominationEndTime: { $gte: now },
          nominationStartTime: { $lte: now }
        },
        { votingEndTime: { $gte: now }, votingStartTime: { $lte: now } }
      ]
    });

    res.json(rounds);
  } catch (error) {
    next(error);
  }
});
