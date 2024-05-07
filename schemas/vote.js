const mongoose = require("mongoose");

export const VoteSchema = new mongoose.Schema({
  id: String,
  nominationId: String,
  createdAt: Date,
  fid: String,
});

export const Vote = mongoose.model("Vote", VoteSchema);
