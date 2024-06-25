import cron from "node-cron";
import { postCastCannon } from "./neynar/client";
import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { fetchDegenTips } from "./degen/degenAPI";
import fetch from "node-fetch";

export const fetchApprovedSigners = async (): Promise<Signer[]> => {
  const endpoint = "http://localhost:3000/approvedSigners";

  try {
    const response = await fetch(endpoint);
    const signers = await response.json();

    return signers;
  } catch (error) {
    console.error("Error fetching approved signers:", error);
    throw error;
  }
};

export const fetchCastWinner = async (): Promise<string> => {
  const endpoint = `http://localhost:3000/latest-round`;

  try {
    const response = await fetch(endpoint);
    const castWinner = await response.json();

    return castWinner.winner;
  } catch (error) {
    console.error("Error fetching cast winner:", error);
    throw new Error(`Failed to fetch cast winner: ${error}`);
  }
};

export const cannonCronJob = async () => {
  cron.schedule("0 * * * *", async () => {
    await executeCannon();
  });
};

export const executeCannon = async () => {
  try {
    // 1. Fetch DEGEN remaining
    // 2. Fetch castWinner
    // 3. Fetch approved signers
    // 4. Post cast cannon to each approved signer
    const castWinner = await fetchCastWinner();
    const approvedSigners = await fetchApprovedSigners();

    approvedSigners.forEach(async (signer) => {
      const { remainingAllowance } = await fetchDegenTips(signer.fid || 0);
      await postCastCannon(
        signer.signer_uuid,
        `${remainingAllowance} $DEGEN`,
        castWinner
      );
    });
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to execute cannon logic ${error}`);
  }
};
