import { StatusCodes } from 'http-status-codes';

import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { SignersRepository } from './signersRepository';
import { ISigner, Signer } from './signersModel';
import { fetchDegenTips } from '@/degen/degenAPI';

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

  async fetchCurrentPooledTips() {
    try {
      const allSigners: { fid: number }[] = await Signer.aggregate([
        {
          $match: {
            status: 'approved'
          }
        },
        {
          $project: {
            fid: '$fid'
          }
        }
      ]);

      const pooledTips = await Promise.all(
        allSigners.map((signer) => {
          return fetchDegenTips(signer.fid);
        })
      );

      const totalPooledTips = pooledTips.reduce((acc, curr) => {
        return acc + parseFloat(curr.remainingAllowance);
      }, 0);

      return ServiceResponse.success<unknown>('Signer found', {
        totalPooledTips
      });
    } catch (error) {
      throw new Error(`Error: ${(error as Error).message}`);
    }
  }

  async createSigner(signer: ISigner) {
    try {
      const newItem = new Signer(signer);
      const item = await newItem.save();

      return ServiceResponse.success<unknown>('Signer created', item);
    } catch (error) {
      throw new Error(`Error: ${(error as Error).message}`);
    }
  }
}

export const signerServiceInstance = new SignersService();
