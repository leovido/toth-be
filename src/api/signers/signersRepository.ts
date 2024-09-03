import { fetchDegenTips } from "@/degen/degenAPI";
import { ISigner, Signer } from "./signersModel";

export interface ISignersRepository {
  findAll(): Promise<ISigner[]>;
  findByPublicKey(publicKey: string): Promise<ISigner | null>;
  findByUUID(signerUUID: string): Promise<ISigner | null>;
  findByFid(fid: number): Promise<ISigner | null>;
  findByPublicKey(publicKey: string): Promise<ISigner | null>;
  fetchApprovedSignersAllowance(): Promise<unknown>;
}

export class SignersRepository implements ISignersRepository {
  async findAll(): Promise<ISigner[]> {
    try {
      const signers = await Signer.find();
      return signers;
    } catch (error) {
      throw new Error(`Error fetching signers: ${(error as Error).message}`);
    }
  }

  async findByUUID(signerUUID: string) {
    try {
      const signer = await Signer.findOne({
        signer_uuid: { $eq: signerUUID },
      });

      if (signer) {
        return signer;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Error: ${(error as Error).message}`);
    }
  }

  async findByFid(fid: number) {
    try {
      const signer = await Signer.findOne({
        fid: { $eq: fid },
      });

      if (signer) {
        return signer;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Error: ${(error as Error).message}`);
    }
  }
  async findByPublicKey(publicKey: string) {
    try {
      const signer = await Signer.findOne({
        public_key: { $eq: publicKey },
      });

      if (signer) {
        return signer;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Error: ${(error as Error).message}`);
    }
  }

  async fetchApprovedSignersAllowance() {
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

      const tips = await Promise.all(
        allSigners.map((signer) => {
          return fetchDegenTips(signer.fid).then(
            (tips: { remainingAllowance: string; allowance: string }) => {
              return {
                fid: signer.fid,
                tips,
              };
            }
          );
        })
      );

      return tips;
    } catch (error) {
      throw new Error(
        `Error fetching approved signers allowance: ${(error as Error).message}`
      );
    }
  }
}
