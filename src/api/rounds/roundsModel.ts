import mongoose from 'mongoose';

export interface IRound extends mongoose.Document {
  id: string;
  roundNumber: number;
  nominationStartTime: Date;
  nominationEndTime: Date;
  votingStartTime: Date;
  votingEndTime: Date;
  createdAt: Date;
  status: 'nominating' | 'voting' | 'completed';
  winner: string;
}

const schemaDefinition = {
  id: {
    type: String,
    required: [true, 'id is required']
  },
  roundNumber: {
    type: Number,
    required: true
  },
  nominationStartTime: {
    type: Date,
    required: [true, 'nominationStartTime is required']
  },
  nominationEndTime: {
    type: Date,
    required: [true, 'nominationEndTime is required']
  },
  votingStartTime: {
    type: Date,
    required: [true, 'createdAt is required']
  },
  votingEndTime: {
    type: Date,
    required: [true, 'votingEndTime is required']
  },
  createdAt: {
    type: Date,
    required: [true, 'createdAt is required']
  },
  status: String, // nominating, voting, completed
  winner: { type: String, required: false }
} as const;

const roundSchema = new mongoose.Schema(schemaDefinition);

export const Round = mongoose.model<IRound>('Round', roundSchema);
