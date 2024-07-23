// ts-ignore
import express, { Router } from 'express';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { roundServiceInstance } from './roundsService';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

export const roundsRegistry = new OpenAPIRegistry();
export const roundsRouter: Router = express.Router();

roundsRouter.get('/rounds', async (req, res) => {
  const serviceResponse = await roundServiceInstance.findAll();

  return handleServiceResponse(serviceResponse, res);
});

roundsRouter.get('/latest-round', async (_req, res) => {
  const serviceResponse = await roundServiceInstance.fetchLatestRound();

  return handleServiceResponse(serviceResponse, res);
});

roundsRouter.post('/rounds', async (_req, res) => {
  const serviceResponse = await roundServiceInstance.createRound();

  return handleServiceResponse(serviceResponse, res);
});
