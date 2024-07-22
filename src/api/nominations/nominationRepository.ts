import { Nomination, INomination } from './nominationModel';
import { INominationRepository } from './nominationRepositoryInterface';

export class MDNominationRepository implements INominationRepository {
  findById(id: string): Promise<unknown[]> {
    throw new Error('Method not implemented.');
  }
  findByFid(fid: number): Promise<unknown[]> {
    throw new Error('Method not implemented.');
  }
  findByRound(round: string): Promise<unknown[]> {
    throw new Error('Method not implemented.');
  }
  findTodaysNominations(): Promise<unknown[]> {
    throw new Error('Method not implemented.');
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
