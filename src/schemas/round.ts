import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "id is required"],
  },
  roundNumber: {
    type: Number,
    required: true,
  },
  nominationStartTime: {
    type: Date,
    required: [true, "nominationStartTime is required"],
  },
  nominationEndTime: {
    type: Date,
    required: [true, "nominationEndTime is required"],
  },
  votingStartTime: {
    type: Date,
    required: [true, "createdAt is required"],
  },
  votingEndTime: {
    type: Date,
    required: [true, "votingEndTime is required"],
  },
  createdAt: {
    type: Date,
    required: [true, "createdAt is required"],
  },
  status: String, // active, voting, completed
  winner: { type: mongoose.Schema.Types.String, ref: "Nomination" },
});

export const Round = mongoose.model("Round", roundSchema);
