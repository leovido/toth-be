// ts-ignore
import express, { Router, type Request, type Response } from 'express';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { z } from 'zod';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { handleServiceResponse } from '@/common/utils/httpHandlers';
import { helperServiceInstance } from './helpersService';

export const helpersRegistry = new OpenAPIRegistry();
export const helpersRouter: Router = express.Router();

const degenTipsResponseSchema = z.object({
  remainingAllowance: z.string(),
  allowance: z.string()
});

helpersRegistry.registerPath({
  method: 'get',
  path: '/helpers/degen-tips',
  tags: ['Helpers'],
  summary: 'Fetch Degen Tips',
  responses: createApiResponse(degenTipsResponseSchema, 'Success'),
  parameters: [
    {
      name: 'fid',
      in: 'query',
      required: true,
      schema: { type: 'integer' }
    }
  ]
});

helpersRegistry.registerPath({
  method: 'get',
  path: '/helpers/current-period',
  tags: ['Helpers'],
  summary: 'Fetch Current Period',
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
    const serviceResponse = await helperServiceInstance.fetchCurrentPeriod(
      new Date()
    );
    handleServiceResponse(serviceResponse, res);
  } catch (error) {
    next(error);
  }
});
