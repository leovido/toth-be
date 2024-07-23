import cryptoModule from 'crypto';
import { IRound, Round } from './roundsModel';

export interface IRoundRepository {
  findAll(): Promise<IRound[]>;
  fetchLatestRound(): Promise<IRound | null>;
  createRound(): Promise<IRound>;
}

export class RoundsRepository implements IRoundRepository {
  async findAll(): Promise<IRound[]> {
    try {
      const rounds = await Round.find();

      return rounds;
    } catch (error) {
      throw new Error(`Error fetching rounds: ${(error as Error).message}`);
    }
  }

  async fetchLatestRound(): Promise<IRound | null> {
    try {
      const round = await Round.findOne({
        status: 'completed'
      })
        .sort({ createdAt: -1 })
        .limit(1);

      return round;
    } catch (error) {
      throw new Error(
        `Error fetching latest round: ${(error as Error).message}`
      );
    }
  }

  async createRound(): Promise<IRound> {
    const nominationEndTime = new Date();
    nominationEndTime.setUTCHours(18, 0, 0, 0);

    const votingEndTime = new Date(nominationEndTime);
    votingEndTime.setUTCDate(votingEndTime.getUTCDate() + 1);

    try {
      const lastRound = await Round.findOne().sort({ roundNumber: -1 });

      if (lastRound !== null) {
        const newRound = createNewRound(
          lastRound.roundNumber,
          nominationEndTime,
          votingEndTime
        );
        await newRound.validate();
        await newRound.save();

        return newRound;
      } else {
        throw new Error('No rounds found');
      }
    } catch (error) {
      throw new Error(`Error creating round: ${(error as Error).message}`);
    }
  }
}

const createNewRound = (
  roundNumber: number,
  nominationEndTime: Date,
  votingEndTime: Date
) => {
  const roundId = cryptoModule.randomUUID();

  const newRoundNumber = roundNumber + 1;

  const newRound = new Round({
    id: roundId,
    roundNumber: newRoundNumber,
    nominationStartTime: new Date(),
    nominationEndTime,
    votingStartTime: nominationEndTime,
    votingEndTime,
    createdAt: new Date(),
    status: 'nominating',
    winner: ''
  });

  return newRound;
};
