import { Round } from "../rounds/roundsModel";
import { IVote, Vote } from "./votesModel";

export interface IVotesRepository {
  createVote(vote: IVote): Promise<IVote | null>;
  fetchVotesByRoundId(roundId: string): Promise<IVote[] | null>;
}

export class VotesRepository implements IVotesRepository {
  async fetchVotesByRoundId(roundId: string) {
    try {
      const votes = await Vote.find({
        roundId,
      });

      return votes;
    } catch (error) {
      throw new Error(`Error fetching rounds: ${(error as Error).message}`);
    }
  }

  async createVote(vote: IVote) {
    try {
      const { roundId, fid } = vote;
      const round = await Round.findOne({
        id: roundId,
      });

      if (round === null) {
        throw new Error("Invalid vote for this round");
      }

      const now = new Date();
      if (now < round.votingStartTime || now > round.votingEndTime) {
        throw new Error("Voting is not currently allowed for this round.");
      }

      const votes = await Vote.aggregate([
        {
          $match: {
            roundId: roundId,
            createdAt: { $gte: now },
            fid: fid,
          },
        },
      ]);

      if (votes.length > 0) {
        throw new Error("You already voted for this round.");
      } else {
        const newItem = new Vote(vote);
        newItem.validateSync();

        return newItem;
      }
    } catch (error) {
      throw new Error(`Error creating vote: ${(error as Error).message}`);
    }
  }
}
