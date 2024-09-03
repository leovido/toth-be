import { PipelineStage } from 'mongoose';
import { Nomination, INomination } from './nominationModel';

export interface INominationRepository {
  findById(id: string): Promise<INomination[]>;
  findByFid(fid: number): Promise<INomination[]>;
  findByRound(roundId: string): Promise<INomination[]>;
  findTodaysNominations(): Promise<INomination[]>;
  createNomination(nomination: INomination): Promise<INomination | null>;
}

export class MDNominationRepository implements INominationRepository {
  async findById(id: string) {
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

    const nominations = await Nomination.aggregate(pipeline).limit(1);

    return nominations;
  }

  async findByFid(fid: number) {
    const startToday = new Date();
    startToday.setUTCHours(0, 0, 0, 0);

    const endToday = new Date();
    endToday.setUTCHours(18, 0, 0, 0);

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

    const nominations = await Nomination.aggregate(pipeline)
      .sort({
        weight: -1
      })
      .limit(1);

    return nominations;
  }

  async findByRound(roundId: string) {
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

    const nominations = await Nomination.aggregate(pipeline)
      .sort({
        weight: -1,
        createdAt: 1
      })
      .limit(5);

    return nominations;
  }

  async findTodaysNominations() {
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

    const nominations = await Nomination.aggregate(pipeline)
      .sort({
        votesCount: -1
      })
      .limit(5);

    return nominations;
  }

  async createNomination(nomination: INomination) {
    const startToday = new Date();
    startToday.setUTCHours(0, 0, 0, 0);

    const endToday = new Date();
    endToday.setUTCHours(18, 0, 0, 0);

    try {
      const matches = await Nomination.aggregate([
        {
          $match: {
            createdAt: { $gte: startToday, $lte: endToday },
            fid: nomination.fid
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
            votesCount: { $size: '$votes' }
          }
        }
      ]);
      if (matches.length === 0) {
        const newItem = new Nomination(nomination);
        const item = await newItem.save();
        return item;
      } else {
        return nomination;
      }
    } catch (error) {
      throw new Error(`Error creating nomination: ${(error as Error).message}`);
    }
  }
}
