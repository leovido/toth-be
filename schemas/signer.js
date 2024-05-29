const mongoose = require("mongoose");

const SignerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "id is required"],
  },
  fid: {
    type: Number,
    required: [true, "id is required"],
  },
  signer_uuid: {
    type: String,
    required: [true, "signer_uuid is required"],
  },
  public_key: {
    type: String,
    required: [true, "public_key is required"],
  },
  status: {
    type: String,
    required: [true, "status is required"],
  },
  signer_approval_url: {
    type: String,
    required: [true, "signer_approval_url is required"],
  },
});

const Signer = mongoose.model("Signer", SignerSchema);

module.exports = Signer;
