import { StatusCodes } from 'http-status-codes';

import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { RoundsRepository } from './roundsRepository';

export class RoundsService {
  private roundRepository: RoundsRepository;

  constructor(repository: RoundsRepository = new RoundsRepository()) {
    this.roundRepository = repository;
  }

  async findAll(): Promise<ServiceResponse<unknown | null>> {
    try {
      const rounds = await this.roundRepository.findAll();
      if (rounds.length === 0) {
        return ServiceResponse.failure(
          'round)not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<unknown>('Rounds found', rounds);
    } catch (ex) {
      const errorMessage = `Error finding rounds:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding rounds).',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchLatestRound(): Promise<ServiceResponse<unknown | null>> {
    try {
      const round = await this.roundRepository.fetchLatestRound();
      if (!round) {
        return ServiceResponse.failure(
          'Latest rounds not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<unknown>('Latest rounds found', round);
    } catch (ex) {
      const errorMessage = `Error finding latest rounds:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'Error finding latest rounds',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createRound(): Promise<ServiceResponse<unknown | null>> {
    try {
      const round = await this.roundRepository.createRound();
      if (!round) {
        return ServiceResponse.failure(
          'Latest rounds not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<unknown>('Round created', round);
    } catch (ex) {
      const errorMessage = `Error creating a round:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'Error creating a round',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const roundServiceInstance = new RoundsService();
