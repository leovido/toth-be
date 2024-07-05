import cron from "node-cron";
import { client, postCastCannon } from "./neynar/client";
import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { tipDistribution } from "./degen/degenAPI";
import fetch from "node-fetch";

export const fetchApprovedSigners = async (): Promise<Signer[]> => {
  const endpoint = `${process.env.PUBLIC_URL}/allSigners`;

  try {
    const response = await fetch(endpoint);
    const signers = await response.json();

    const approvedSigners = await Promise.all(
      signers.map(async (signer: Signer) => {
        return await client.lookupDeveloperManagedSigner(signer.public_key);
      })
    );

    const filteredSigners = approvedSigners.filter((signer) => {
      return signer.status === "approved";
    });

    const mmm = filteredSigners.map((signer) => {
      const current = signers.find((s: Signer) => s.fid === signer.fid);
      return {
        fid: current.fid,
        public_key: current.public_key,
        status: current.status,
        signer_uuid: current.signer_uuid,
      };
    });

    return mmm;
  } catch (error) {
    console.error("Error fetching approved signers:", error);
    throw error;
  }
};

export const fetchCastWinner = async (): Promise<string> => {
  const endpoint = `${process.env.PUBLIC_URL}/latest-round`;

  try {
    const response = await fetch(endpoint);
    const castWinner = await response.json();

    return castWinner.winner;
  } catch (error) {
    throw new Error(`Failed to fetch cast winner: ${error}`);
  }
};

export const cannonCronJob = async () => {
  cron.schedule("50 23 * * *", async () => {
    await executeCannon();
  });
};

export const executeCannon = async () => {
  try {
    console.warn("cannon fired");
    // 1. Fetch DEGEN remaining
    // 2. Fetch castWinner
    // 3. Fetch approved signers
    // 4. Post cast cannon to each approved signer
    const castWinner = await fetchCastWinner();

    if (castWinner.length > 0) {
      const allSigners = await fetchApprovedSigners();

      allSigners.forEach(async (signer) => {
        const { tothCut, castWinnerEarnings } = await tipDistribution(
          signer.fid || 0
        );

        await postCastCannon(
          signer.signer_uuid,
          `@tipothehat $${castWinnerEarnings} DEGEN`,
          castWinner
        );

        await postCastCannon(
          signer.signer_uuid,
          `Your cast is the winner for @tipothehat. Follow us on /tipothehat ${tothCut} $DEGEN`,
          "0xe2ea9f4dedc4ab2ffba3e2718aa0521ad2d60b4c"
        );
      });
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to execute cannon logic ${error}`);
  }
};
