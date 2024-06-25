import cron from "node-cron";
import { Round } from "./schemas/round";
import cryptoModule from "crypto";

// Function to update rounds
async function updateRounds() {
  const now = new Date();

  try {
    const rounds = await Round.find({
      $or: [
        { status: "nominating", nominationEndTime: { $lte: now } },
        { status: "voting", votingEndTime: { $lte: now } },
      ],
    });

    for (const round of rounds) {
      if (round.status === "nominating" && now >= round.nominationEndTime) {
        round.status = "voting";
        round.votingStartTime = now; // Assuming this needs to be set here
      } else if (round.status === "voting" && now >= round.votingEndTime) {
        round.status = "completed";
        round.winner = await saveWinner();
      }

      await round.save();
    }
  } catch (error) {
    console.error("Error updating rounds:", error);
    // Consider re-throwing or handling specific errors further here
  }
}

async function createNewRound() {
  const nominationEndTime = new Date();
  nominationEndTime.setUTCHours(18, 0, 0, 0);

  const votingEndTime = new Date(nominationEndTime);
  votingEndTime.setUTCDate(votingEndTime.getUTCDate() + 1);

  const roundId = cryptoModule.randomUUID();
  const lastRound = await Round.findOne().sort({ roundNumber: -1 });
  const newRoundNumber = lastRound ? lastRound.roundNumber + 1 : 1;

  const newRound = new Round({
    id: roundId,
    roundNumber: newRoundNumber,
    nominationStartTime: new Date(),
    nominationEndTime,
    votingStartTime: nominationEndTime,
    votingEndTime,
    createdAt: new Date(),
    status: "nominating",
    winner: null,
  });

  try {
    await newRound.validate();
    await newRound.save();

    return newRound;
  } catch (e) {
    console.error(e);

    throw e;
  }
}

export const saveWinner = async (): Promise<string> => {
  const endpoint = `${process.env.PUBLIC_URL}/nominations`;

  try {
    const response = await fetch(endpoint);
    const json = await response.json();

    const castWinner = json[0];
    return `https://warpcast.com/${castWinner.username}/${castWinner.castId}`;
  } catch (error) {
    console.error("Error fetching cast winner:", error);
    throw error;
  }
};

// Export the cron job setup function
export const setupCronJobs = async () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Updating rounds: 12 AM UTC");
    await updateRounds();
    await createNewRound();
  });

  cron.schedule("0 18 * * *", async () => {
    console.log("Updating rounds: 6 PM UTC");
    await updateRounds();
  });
};
