const cron = require("node-cron");
const Round = require("./schemas/round");
const cryptoModule = require("crypto");

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
        round.winner = calculateWinner(round); // Ensure this function handles asynchronous operations if needed
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
    // eslint-disable-next-line no-undef
    console.error(e);

    throw e;
  }
}

function calculateWinner(round: string) {
  console.log(round, "round winner");
  // Add logic to determine the winner of the round
  return null;
}

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
