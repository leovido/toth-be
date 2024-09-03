import { StatusCodes } from 'http-status-codes';

import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { HelperRepository } from './helpersRepository';

export class HelperService {
  private helperRepository: HelperRepository;

  constructor(repository: HelperRepository = new HelperRepository()) {
    this.helperRepository = repository;
  }

  async fetchCurrentPeriod(
    date: Date
  ): Promise<ServiceResponse<unknown | null>> {
    try {
      const item = await this.helperRepository.fetchCurrentPeriod(date);
      return ServiceResponse.success<unknown>('Current period fetched', item);
    } catch (ex) {
      const errorMessage = `Error fetching current period: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while fetching current period.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchDegenTips(fid: number): Promise<ServiceResponse<unknown | null>> {
    try {
      const item = await this.helperRepository.fetchDegenTips(fid);
      return ServiceResponse.success<unknown>('Degen tips fetched', item);
    } catch (ex) {
      const errorMessage = `Error fetching degen tips: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while fetching degen tips.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const helperServiceInstance = new HelperService();
