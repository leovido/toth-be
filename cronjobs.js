const cron = require("node-cron");
const mongoose = require("mongoose");
const Round = require("./schemas/round");

// Function to update rounds
async function updateRounds() {
  const now = new Date();
  console.log("Checking and updating round statuses");

  try {
    const rounds = await Round.find({
      $or: [
        { status: "active", nominationEndTime: { $lte: now } },
        { status: "voting", votingEndTime: { $lte: now } },
      ],
    });

    rounds.forEach(async (round) => {
      if (round.status === "active" && now >= round.nominationEndTime) {
        round.status = "voting";
        round.votingStartTime = now;
      } else if (round.status === "voting" && now >= round.votingEndTime) {
        round.status = "completed";
        round.winner = calculateWinner(round);
      }
      await round.save();
    });
  } catch (error) {
    console.error("Error updating rounds:", error);
  }
}

function calculateWinner(round) {
  // Add logic to determine the winner of the round
  return null;
}

// Export the cron job setup function
function setupCronJobs() {
  cron.schedule("0 0 * * *", async () => {
    console.log("Updating rounds: 12 AM UTC");
    await updateRounds();
  });

  cron.schedule("0 18 * * *", async () => {
    console.log("Updating rounds: 6 PM UTC");
    await updateRounds();
  });
}

module.exports = { setupCronJobs };
