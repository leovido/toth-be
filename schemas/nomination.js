const mongoose = require("mongoose");

const NominationSchema = new mongoose.Schema({
  id: String,
  username: String,
  castId: String,
  fid: Number,
  createdAt: Date,
  weight: Number,
  votesCount: Number,
});

const Nomination = mongoose.model("Nomination", NominationSchema);

module.exports = Nomination;
