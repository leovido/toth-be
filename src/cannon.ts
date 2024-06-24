import cron from "node-cron";
import { postCastCannon } from "./neynar/client";
import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { fetchDegenTips } from "./degen/degenAPI";
import fetch from "node-fetch";

async function fetchApprovedSigners(): Promise<Signer[]> {
  const endpoint = "http://localhost:3000/approvedSigners";

  try {
    const response = await fetch(endpoint);
    const signers = await response.json();

    return signers;
  } catch (error) {
    console.error("Error fetching approved signers:", error);
    throw error;
  }
}

export const fetchCastWinner = async () => {
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
  cron.schedule("0 0 * * *", async () => {
    console.log("Firing cannon!");
    // 1. Fetch DEGEN remaining
    // 2. Fetch castWinner
    // 3. Fetch approved signers
    // 4. Post cast cannon to each approved signer
    const castWinner = await fetchCastWinner();
    const approvedSigners = await fetchApprovedSigners();

    approvedSigners.forEach(async (signer) => {
      const tipAmount = await fetchDegenTips(signer.fid || 0);
      postCastCannon(signer.signer_uuid, `${tipAmount} $DEGEN`, castWinner);
    });
  });
};
