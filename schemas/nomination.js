const mongoose = require("mongoose");

export const NominationSchema = new mongoose.Schema({
  id: String,
  username: String,
  castId: String,
  fid: Number,
  createdAt: Date,
  weight: Number,
  votesCount: Number,
});

export const Nomination = mongoose.model("Nomination", NominationSchema);
