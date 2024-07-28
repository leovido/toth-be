import mongoose from "mongoose";

const schemaDefinition = {
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
} as const;

const VoteSchema = new mongoose.Schema(schemaDefinition);

export interface IVote extends mongoose.Document {
  id: string;
  nominationId: string;
  roundId: string;
  createdAt: Date;
  fid: number;
}

export const Vote = mongoose.model<IVote>("Vote", VoteSchema);
