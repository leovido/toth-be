import mongoose from "mongoose";

const schemaDefinition = {
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
  winner: { type: String, required: false },
  castURL: { type: String, required: false },
  nominationId: { type: String, required: false },
} as const;

const roundSchema = new mongoose.Schema(schemaDefinition);

export interface IRound extends mongoose.Document {
  id: string;
  roundNumber: number;
  nominationStartTime: Date;
  nominationEndTime: Date;
  votingStartTime: Date;
  votingEndTime: Date;
  createdAt: Date;
  status: string;
  winner: string;
  castURL?: string;
  nominationId?: string;
}

export const Round = mongoose.model<IRound>("Round", roundSchema);
