const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const app = express();

const port = process.env.PORT || 3011;

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

app.post("/nominations", async (req, res) => {
  const startToday = new Date();
  startToday.setUTCHours(0, 0, 0, 0);

  const endToday = new Date();
  endToday.setUTCHours(18, 0, 0, 0);

  try {
    const matches = await Nomination.aggregate([
      {
        $match: {
          createdAt: { $gte: startToday, $lte: endToday },
          nominationId: req.body.nominationId,
        },
      },
      {
        $lookup: {
          from: "votes",
          localField: "id",
          foreignField: "nominationId",
          as: "votes",
        },
      },
      {
        $addFields: {
          votesCount: { $size: "$votes" },
        },
      },
    ]);

    if (matches.length === 0) {
      const newItem = new Nomination(req.body);
      const item = await newItem.save();
      res.status(201).send(item);
    } else {
      const weightToAdd = req.body.isPowerUser ? 3 : 1;
      await Nomination.updateOne(
        { _id: matches[0]._id },
        { $inc: { weight: weightToAdd } }
      );
      res.status(200).send({ message: "Nomination updated successfully" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post("/votes", (req, res) => {
  const newItem = new Vote(req.body);
  newItem
    .save()
    .then((item) => res.status(201).send(item))
    .catch((err) => res.status(400).send(err));
});

app.get("/votes", (req, res) => {
  Vote.find()
    .then((votes) => res.status(200).send(votes))
    .catch((err) => res.status(500).send(err));
});

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

  Nomination.aggregate([
    [
      {
        $match: {
          createdAt: {
            $gte: startToday,
            $lte: endToday,
          },
        },
      },
      {
        $lookup: {
          from: "votes",
          localField: "id",
          foreignField: "nominationId",
          as: "votes",
        },
      },
      {
        $addFields: {
          votesCount: {
            $size: "$votes",
          },
        },
      },
    ],
  ])
    .sort({
      weight: -1,
    })
    .limit(5)
    .then((nominations) => res.status(200).send(nominations))
    .catch((err) => res.status(500).send(err));
});

app.get("/current-period", async (req, res) => {
  try {
    const now = new Date();
    const rounds = await Round.find({
      $or: [
        {
          nominationEndTime: { $gte: now },
          nominationStartTime: { $lte: now },
        },
        { votingEndTime: { $gte: now }, votingStartTime: { $lte: now } },
      ],
    });

    const currentPeriods = rounds.map((round) => {
      let period = "inactive";
      if (now >= round.nominationStartTime && now <= round.nominationEndTime) {
        period = "nomination";
      } else if (now >= round.votingStartTime && now <= round.votingEndTime) {
        period = "voting";
      }
      return {
        roundId: round.roundId,
        period,
        status: round.status,
      };
    });

    res.json(currentPeriods);
  } catch (error) {
    console.error("Failed to determine current periods", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
