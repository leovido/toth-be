import mongoose from 'mongoose';

export interface ISigner extends mongoose.Document {
  id: string;
  fid: number;
  signer_uuid: string;
  createdAt: Date;
  public_key: string;
  status: 'pending_approval' | 'approved' | 'revoked';
  signer_approval_url: string;
}

const SignerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'id is required']
  },
  fid: {
    type: Number,
    required: [false, 'fid not required']
  },
  signer_uuid: {
    type: String,
    required: [false, 'signer_uuid is required']
  },
  createdAt: {
    type: Date,
    required: [false, 'createdAt is required']
  },
  public_key: {
    type: String,
    required: [false, 'public_key is required']
  },
  status: {
    type: String,
    required: [true, 'status is required']
  },
  signer_approval_url: {
    type: String,
    required: [false, 'signer_approval_url is required']
  }
});

export const Signer = mongoose.model<ISigner>('Signer', SignerSchema);
