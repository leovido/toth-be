// ts-ignore
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse } from '@/common/utils/httpHandlers';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Router } from 'express';
import { z } from 'zod';
import { nominationServiceInstance } from './nominationService';

export const nominationsRegistry = new OpenAPIRegistry();
export const nominationsRouter: Router = express.Router();

nominationsRegistry.registerPath({
  method: 'get',
  path: 'nominations/nominations',
  tags: ['nominations'],
  responses: createApiResponse(z.null(), 'Success')
});

nominationsRegistry.registerPath({
  method: 'get',
  path: 'nominations/nominationsByRound',
  tags: ['nominations'],
  parameters: [
    {
      name: 'roundId',
      in: 'query',
      required: true,
      schema: { type: 'string' }
    }
  ],
  responses: createApiResponse(z.null(), 'Success')
});

nominationsRegistry.registerPath({
  method: 'get',
  path: 'nominations/nominationsById',
  tags: ['nominations'],
  parameters: [
    {
      name: 'id',
      in: 'query',
      required: true,
      schema: { type: 'string' }
    }
  ],
  responses: createApiResponse(z.null(), 'Success')
});

nominationsRegistry.registerPath({
  method: 'get',
  path: 'nominations/nominationsByFid',
  tags: ['nominations'],
  parameters: [
    {
      name: 'fid',
      in: 'query',
      required: true,
      schema: { type: 'string' }
    }
  ],
  responses: createApiResponse(z.null(), 'Success')
});

nominationsRouter.get('/nominationsByRound', async (req, res) => {
  const roundId = req.query.roundId;

  if (typeof roundId === 'string') {
    const serviceResponse = await nominationServiceInstance.findByRound(
      roundId
    );

    return handleServiceResponse(serviceResponse, res);
  } else {
    handleServiceResponse(
      ServiceResponse.failure('Invalid roundId. Must be a string', null),
      res
    );
  }
});

nominationsRouter.get('/nominationsById', async (req, res) => {
  const id = req.query.id;

  if (typeof id === 'string') {
    const serviceResponse = await nominationServiceInstance.findById(id);
    return handleServiceResponse(serviceResponse, res);
  } else {
    handleServiceResponse(
      ServiceResponse.failure('Invalid ID. Must be a string', null),
      res
    );
  }
});

// Fetches the current nominations for TODAY by FID
nominationsRouter.get('/nominationsByFid', async (req, res) => {
  const fid = req.query.fid;

  if (typeof fid === 'string') {
    const serviceResponse = await nominationServiceInstance.findByFid(
      Number(fid)
    );
    return handleServiceResponse(serviceResponse, res);
  } else {
    handleServiceResponse(
      ServiceResponse.failure('Invalid ID. Must be a string', null),
      res
    );
  }
});

// Fetches the current nominations for TODAY
nominationsRouter.get('/nominations', async (req, res) => {
  const serviceResponse =
    await nominationServiceInstance.findTodaysNominations();

  return handleServiceResponse(serviceResponse, res);
});
