import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { SignersRepository } from "./signersRepository";
import { type ISigner, Signer } from "./signersModel";
import { fetchDegenTips } from "@/degen/degenAPI";

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
          "Signers not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<ISigner[]>("Signers found", signer);
    } catch (ex) {
      const errorMessage = `Error finding signer with UUID:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding a signer.",
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
          "Signer not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<ISigner>("Signer found", signer);
    } catch (ex) {
      const errorMessage = `Error finding signer with UUID:, ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while finding a signer.",
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
          "Signer not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<ISigner>("Signer found", signer);
    } catch (ex) {
      const errorMessage = `Error finding signer with UUID:, ${
        (ex as Error).message
      }`;
      return ServiceResponse.failure(
        errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByUUID(id: string) {
    try {
      const signer = await this.signersRepository.findByUUID(id);
      if (!signer) {
        return ServiceResponse.failure(
          "Signer not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<ISigner>("Signer found", signer);
    } catch (ex) {
      const errorMessage = `Error finding signer with UUID:, ${
        (ex as Error).message
      }`;
      return ServiceResponse.failure(
        errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async fetchApprovedSignersAllowance() {
    try {
      const signer =
        await this.signersRepository.fetchApprovedSignersAllowance();
      if (!signer) {
        return ServiceResponse.failure(
          "Signer not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<unknown>("Signer allowance found", signer);
    } catch (ex) {
      const errorMessage = `Error finding signer with id:, ${
        (ex as Error).message
      }`;
      return ServiceResponse.failure(
        errorMessage,
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
            status: "approved",
          },
        },
        {
          $project: {
            fid: "$fid",
          },
        },
      ]);

      const pooledTips = await Promise.all(
        allSigners.map((signer) => {
          return fetchDegenTips(signer.fid);
        })
      );

      const totalPooledTips = pooledTips.reduce((acc, curr) => {
        return acc + parseFloat(curr.remainingAllowance);
      }, 0);

      return ServiceResponse.success<unknown>("Signer found", {
        totalPooledTips,
      });
    } catch (ex) {
      const errorMessage = `Error finding fetching pooled tips: , ${
        (ex as Error).message
      }`;
      return ServiceResponse.failure(
        errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createSigner(signer: ISigner) {
    try {
      const newItem = new Signer(signer);
      const item = await newItem.save();

      return ServiceResponse.success<ISigner>("Signer created", item);
    } catch (ex) {
      const errorMessage = `Error creating a signer: , ${
        (ex as Error).message
      }`;
      return ServiceResponse.failure(
        errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateSigner(signer: ISigner) {
    try {
      const existingSigner = await Signer.findOne({
        signer_uuid: { $eq: signer.signer_uuid },
      });

      const _updatedSigner = {
        ...existingSigner?.toJSON(),
        signer_uuid: signer.signer_uuid,
        status: signer.status,
        fid: signer.fid,
      };

      const updatedSigner = new Signer(_updatedSigner);
      const item = await updatedSigner.updateOne(_updatedSigner);

      if (item.acknowledged) {
        return ServiceResponse.success<ISigner>("Signer updated", item);
      } else {
        return ServiceResponse.failure(
          "Signer not updated",
          null,
          StatusCodes.NOT_FOUND
        );
      }
    } catch (ex) {
      const errorMessage = `Error updating a signer: , ${
        (ex as Error).message
      }`;
      return ServiceResponse.failure(
        errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const signerServiceInstance = new SignersService();
