import { StatusCodes } from 'http-status-codes';

import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { SignersRepository } from './signersRepository';
import { ISigner } from './signersModel';

export class SignersService {
  private signersRepository: SignersRepository;

  constructor(repository: SignersRepository = new SignersRepository()) {
    this.signersRepository = repository;
  }

  async findAll() {
    try {
      const signer = await this.signersRepository.findAll();
      if (signer.length === 0) {
        return ServiceResponse.failure(
          'Signers not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<ISigner[]>('Signers found', signer);
    } catch (ex) {
      const errorMessage = `Error finding signer with UUID:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding a signer.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByFid(fid: number) {
    try {
      const signer = await this.signersRepository.findByFid(fid);
      if (!signer) {
        return ServiceResponse.failure(
          'Signer not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<unknown>('Signer found', signer);
    } catch (ex) {
      const errorMessage = `Error finding signer with UUID:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding a signer.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async findByPublicKey(publicKey: string) {
    try {
      const signer = await this.signersRepository.findByPublicKey(publicKey);
      if (!signer) {
        return ServiceResponse.failure(
          'Signer not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<unknown>('Signer found', signer);
    } catch (ex) {
      const errorMessage = `Error finding signer with UUID:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding a signer.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByUUID(id: string): Promise<ServiceResponse<unknown | null>> {
    try {
      const signer = await this.signersRepository.findByUUID(id);
      if (!signer) {
        return ServiceResponse.failure(
          'Signer not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<unknown>('Signer found', signer);
    } catch (ex) {
      const errorMessage = `Error finding signer with UUID:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding a signer.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchApprovedSignersAllowance(): Promise<
    ServiceResponse<unknown | null>
  > {
    try {
      const signer =
        await this.signersRepository.fetchApprovedSignersAllowance();
      if (!signer) {
        return ServiceResponse.failure(
          'Signer not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<unknown>('Signer found', signer);
    } catch (ex) {
      const errorMessage = `Error finding signer with id:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding an signer).',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const signerServiceInstance = new SignersService();
