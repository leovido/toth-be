import { StatusCodes } from 'http-status-codes';

import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { MDNominationRepository } from './nominationRepository';
import { INomination } from './nominationModel';

export class HelperService {
  private helperRepository: HelperRepository;

  constructor(repository: HelperRepository = new HelperRepository()) {
    this.helperRepository = repository;
  }

  async fetchDegenTips(fid: number): Promise<ServiceResponse<unknown | null>> {
    try {
      const item = await this.helperRepository.fetchDegenTips(fid);
      return ServiceResponse.success<unknown>('Degen tips fetched', item);
    } catch (ex) {
      const errorMessage = `Error creating nomination: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while creating a nomination.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(): Promise<ServiceResponse<unknown[] | null>> {
    try {
      const nominations =
        await this.nominationRepository.findTodaysNominations();
      if (!nominations || nominations.length === 0) {
        return ServiceResponse.failure(
          'No Nominations found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<unknown[]>(
        'Nominations found',
        nominations
      );
    } catch (ex) {
      const errorMessage = `Error finding all nominations: $${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while retrieving nominations',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Retrieves a single user by their ID
  async findById(id: string): Promise<ServiceResponse<unknown | null>> {
    try {
      const nomination = await this.nominationRepository.findById(id);
      if (!nomination) {
        return ServiceResponse.failure(
          'User not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<unknown>('nomination found', nomination);
    } catch (ex) {
      const errorMessage = `Error finding nomination with id ${id}:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding a nomination.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const helperServiceInstance = new HelperService();
