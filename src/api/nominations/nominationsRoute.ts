// ts-ignore
import express, { Router } from 'express';
import { PipelineStage } from 'mongoose';
import { Nomination } from '@/schemas/nomination';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { z } from 'zod';
import { handleServiceResponse } from '@/common/utils/httpHandlers';
import { nominationServiceInstance } from './nominationRepository';

export const nominationsRegistry = new OpenAPIRegistry();
export const nominationsRouter: Router = express.Router();

nominationsRegistry.registerPath({
  method: 'get',
  path: '/nominations',
  tags: ['nominations'],
  responses: createApiResponse(z.null(), 'Success')
});

nominationsRouter.post('/nominations', async (req, res) => {
  const serviceResponse = await nominationServiceInstance.createNomination(
    req.body
  );
  return handleServiceResponse(serviceResponse, res);
});

// Fetches nominations by round. Useful for voting per round
nominationsRouter.get('/nominationsByRound', (req, res) => {
  const roundId = req.query.roundId;

  const pipeline: PipelineStage[] = [
    {
      $match: {
        roundId: roundId
      }
    },
    {
      $lookup: {
        from: 'votes',
        localField: 'id',
        foreignField: 'nominationId',
        as: 'votes'
      }
    },
    {
      $addFields: {
        votesCount: {
          $size: '$votes'
        }
      }
    },
    {
      $group: {
        _id: '$castId',
        document: { $first: '$$ROOT' },
        totalVotes: { $sum: '$votesCount' },
        weight: { $sum: '$weight' }
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$document',
            { votesCount: '$totalVotes', weight: '$weight' }
          ]
        }
      }
    }
  ];

  Nomination.aggregate(pipeline)
    .sort({
      weight: -1,
      createdAt: 1
    })
    .limit(5)
    .then((nominations: unknown) => res.status(200).send(nominations))
    .catch((err: unknown) => res.status(500).send(err));
});

nominationsRouter.get('/nominationsById', (req, res) => {
  const id = req.query.id;

  const pipeline: PipelineStage[] = [
    {
      $match: {
        id: {
          $eq: id
        }
      }
    },
    {
      $lookup: {
        from: 'votes',
        localField: 'id',
        foreignField: 'nominationId',
        as: 'votes'
      }
    },
    {
      $addFields: {
        votesCount: {
          $size: '$votes'
        }
      }
    },
    {
      $group: {
        _id: '$castId',
        document: { $first: '$$ROOT' },
        totalVotes: { $sum: '$votesCount' },
        weight: { $sum: '$weight' }
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$document',
            { votesCount: '$totalVotes', weight: '$weight' }
          ]
        }
      }
    }
  ];

  Nomination.aggregate(pipeline)
    .limit(1)
    .then((nominations: unknown) => res.status(200).send(nominations))
    .catch((err: unknown) => res.status(500).send(err));
});

// Fetches the current nominations for TODAY by FID
nominationsRouter.get('/nominationsByFid', (req, res) => {
  const startToday = new Date();
  startToday.setUTCHours(0, 0, 0, 0);

  const endToday = new Date();
  endToday.setUTCHours(18, 0, 0, 0);

  const fid = Number(req.query.fid);

  const pipeline: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startToday,
          $lte: endToday
        },
        fid: {
          $eq: fid
        }
      }
    },
    {
      $lookup: {
        from: 'votes',
        localField: 'id',
        foreignField: 'nominationId',
        as: 'votes'
      }
    },
    {
      $addFields: {
        votesCount: {
          $size: '$votes'
        }
      }
    },
    {
      $group: {
        _id: '$castId',
        document: { $first: '$$ROOT' },
        totalVotes: { $sum: '$votesCount' },
        weight: { $sum: '$weight' }
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$document',
            { votesCount: '$totalVotes', weight: '$weight' }
          ]
        }
      }
    }
  ];

  Nomination.aggregate(pipeline)
    .sort({
      weight: -1
    })
    .limit(1)
    .then((nominations: unknown) => res.status(200).send(nominations))
    .catch((err: unknown) => res.status(500).send(err));
});

// Fetches the current nominations for TODAY
nominationsRouter.get('/nominations', (req, res) => {
  const startToday = new Date();
  startToday.setUTCHours(18, 0, 0, 0);

  const endToday = new Date();
  endToday.setUTCHours(18, 0, 0, 0);

  const pipeline: PipelineStage[] = [
    {
      $match: {
        createdAt: {
          $gte: startToday,
          $lte: endToday
        }
      }
    },
    {
      $lookup: {
        from: 'votes',
        localField: 'id',
        foreignField: 'nominationId',
        as: 'votes'
      }
    },
    {
      $addFields: {
        votesCount: {
          $size: '$votes'
        }
      }
    },
    {
      $group: {
        _id: '$castId',
        document: { $first: '$$ROOT' },
        totalVotes: { $sum: '$votesCount' },
        weight: { $sum: '$weight' }
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$document',
            { votesCount: '$totalVotes', weight: '$weight' }
          ]
        }
      }
    }
  ];

  Nomination.aggregate(pipeline)
    .sort({
      votesCount: -1
    })
    .limit(5)
    .then((nominations: unknown) => res.status(200).send(nominations))
    .catch((err: unknown) => res.status(500).send(err));
});
