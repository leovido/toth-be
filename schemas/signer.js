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
  data: {
    type: Object,
    required: [true, "data is required"],
  },
});

const Signer = mongoose.model("Nomination", SignerSchema);

module.exports = Signer;
