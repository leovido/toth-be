const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const app = express();
const port = 3000;

// Body parser middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.DB_INSTANCE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected successfully to MongoDB");
});

// Schema
const NominationSchema = new mongoose.Schema({
  id: String,
  username: String,
  castId: String,
  fid: Number,
  createdAt: Date,
  weight: Number,
  votesCount: Number,
});

// Model
const Nomination = mongoose.model("Nomination", NominationSchema);

// Create
app.post("/nominations", (req, res) => {
  const newItem = new Nomination(req.body);
  newItem
    .save()
    .then((item) => res.status(201).send(item))
    .catch((err) => res.status(400).send(err));
});

// Read
app.get("/nominations", (req, res) => {
  const startToday = new Date();
  startToday.setUTCHours(0);
  startToday.setUTCMinutes(0);
  startToday.setUTCSeconds(0);
  startToday.setUTCMilliseconds(0);

  const endToday = new Date();
  endToday.setUTCHours(18);
  endToday.setUTCMinutes(0);
  endToday.setUTCSeconds(0);
  endToday.setUTCMilliseconds(0);

  Nomination.find({
    createdAt: {
      $gte: startToday,
      $lte: endToday,
    },
  })
    .sort({
      weight: -1,
    })
    .limit(5)
    .then((nominations) => res.status(200).send(nominations))
    .catch((err) => res.status(500).send(err));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
