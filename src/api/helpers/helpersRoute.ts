// ts-ignore
import express, { Router } from 'express';
import { fetchDegenTips } from '@/degen/degenAPI';
import { Round } from '@/schemas/round';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { z } from 'zod';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export const helpersRegistry = new OpenAPIRegistry();
export const helpersRouter: Router = express.Router();

helpersRegistry.registerPath({
  method: 'get',
  path: '/helpers',
  tags: ['Helpers'],
  responses: createApiResponse(z.null(), 'Success')
});

helpersRouter.get('/degen-tips', async (req, res, next) => {
  try {
    const fid = Number(req.query.fid);
    const json = await fetchDegenTips(fid);
    const { remainingAllowance, allowance } = json;

    res.status(200).send({
      remainingAllowance,
      allowance
    });
  } catch (error) {
    next(error);
  }
});

helpersRouter.get('/current-period', async (req, res, next) => {
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
