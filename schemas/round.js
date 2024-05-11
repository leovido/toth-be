const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
  id: String,
  nominationStartTime: Date,
  nominationEndTime: Date,
  votingStartTime: Date,
  votingEndTime: Date,
  status: String, // active, voting, completed
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Nomination" },
});

const Round = mongoose.model("Round", roundSchema);

module.exports = Round;
