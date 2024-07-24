import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { VotesRepository } from "./votesRepository";
import { IVote } from "./votesModel";

export class VotesService {
  private votesRepository: VotesRepository;

  constructor(repository: VotesRepository = new VotesRepository()) {
    this.votesRepository = repository;
  }

  async createVote(vote: IVote) {
    try {
      const currentVote = await this.votesRepository.createVote(vote);
      if (!currentVote) {
        return ServiceResponse.failure(
          "Vote not created",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<unknown>("Vote created", currentVote);
    } catch (ex) {
      const errorMessage = `Error creating vote:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while creating a vote.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchVotesByRoundId(roundId: string) {
    try {
      const votes = await this.votesRepository.fetchVotesByRoundId(roundId);

      return ServiceResponse.success<IVote[]>(
        `Votes found for round ${roundId}`,
        votes
      );
    } catch (ex) {
      const errorMessage = `Error fetching votes for round ${roundId}:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "Error fetching votes",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const votesServiceInstance = new VotesService();
