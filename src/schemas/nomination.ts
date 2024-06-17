const mongoose = require("mongoose");

const NominationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "id is required"],
  },
  roundId: {
    type: String,
    required: [true, "roundId is required"],
  },
  username: {
    type: String,
    required: [true, "id is required"],
  },
  castId: {
    type: String,
    required: [true, "id is required"],
  },
  fid: {
    type: Number,
    required: [true, "id is required"],
  },
  createdAt: {
    type: Date,
    required: [true, "id is required"],
  },
  weight: {
    type: Number,
    required: [true, "weight is required"],
  },
  votesCount: {
    type: Number,
    required: false,
  },
});

export const Nomination = mongoose.model("Nomination", NominationSchema);
