const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  id: String,
  nominationId: String,
  createdAt: Date,
  fid: String,
});

const Vote = mongoose.model("Vote", VoteSchema);

module.exports = Vote;
