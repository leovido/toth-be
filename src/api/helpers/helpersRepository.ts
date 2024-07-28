import { fetchDegenTips } from '@/degen/degenAPI';
import { Round } from '../rounds/roundsModel';

export interface IHelperRepository {
  fetchDegenTips(
    fid: number
  ): Promise<{ remainingAllowance: string; allowance: string }>;

  fetchCurrentPeriod(date: Date): Promise<unknown>;
}

export class HelperRepository implements IHelperRepository {
  async fetchCurrentPeriod(date: Date) {
    try {
      const now = date;
      const rounds = await Round.find({
        $or: [
          {
            nominationEndTime: { $gte: now },
            nominationStartTime: { $lte: now }
          },
          { votingEndTime: { $gte: now }, votingStartTime: { $lte: now } }
        ]
      });

      return rounds;
    } catch (error) {
      throw new Error(
        `Error fetching current period: ${(error as Error).message}`
      );
    }
  }
  async fetchDegenTips(fid: number) {
    try {
      const json = await fetchDegenTips(fid);
      const { remainingAllowance, allowance } = json;

      const tipsResponse = {
        remainingAllowance,
        allowance
      };

      return tipsResponse;
    } catch (error) {
      throw new Error(`Error fetching degen tips: ${(error as Error).message}`);
    }
  }
}
