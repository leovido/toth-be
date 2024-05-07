const mongoose = require("mongoose");

export const roundSchema = new mongoose.Schema({
  roundId: String,
  nominationStartTime: Date,
  nominationEndTime: Date,
  votingStartTime: Date,
  votingEndTime: Date,
  status: String, // active, voting, completed
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Nomination" },
});

export const Round = mongoose.model("Round", roundSchema);
