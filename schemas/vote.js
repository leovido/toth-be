const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "id is required"],
  },
  nominationId: {
    type: String,
    required: [true, "nominationId is required"],
  },
  roundId: {
    type: String,
    required: [true, "roundId is required"],
  },
  createdAt: {
    type: Date,
    required: [true, "createdAt is required"],
  },
  fid: {
    type: Number,
    required: [true, "fid is required"],
  },
});

const Vote = mongoose.model("Vote", VoteSchema);

module.exports = Vote;
