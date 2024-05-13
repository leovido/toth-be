const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const Nomination = require("./schemas/nomination");
const Vote = require("./schemas/vote");
const Round = require("./schemas/round");
const { setupCronJobs } = require("./cronjobs");
const cryptoModule = require("crypto");

require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const app = express();

const port = process.env.PORT || 3011;

// Body parser middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.DB_INSTANCE, {
    useNewUrlParser: true,
  })
  .then(() => {
    setupCronJobs();
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
          fid: req.body.fid,
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
      const isValid = await Nomination.validate(req.body);

      if (isValid) {
        const newItem = new Nomination(req.body);
        const item = await newItem.save();
        res.status(201).send(item);
      } else {
        res.status(400).send("Invalid nomination");
      }
    } else {
      res.status(200).send("Already nominated");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post("/votes", async (req, res) => {
  try {
    const { roundId, fid } = req.body;
    const round = await Round.find({
      id: roundId,
    });

    const now = new Date();
    if (now < round.votingStartTime || now > round.votingEndTime) {
      return res
        .status(400)
        .send({ error: "Voting is not currently allowed for this round." });
    }

    Vote.aggregate([
      {
        $match: {
          roundId: roundId,
          createdAt: { $gte: now },
          fid: fid,
        },
      },
    ])
      .then((votes) => {
        if (votes.length > 0) {
          return res.status(400).send({ error: "You already voted" });
        } else {
          const newItem = new Vote(req.body);
          newItem.validateSync();
          newItem
            .save()
            .then((item) => res.status(201).send(item))
            .catch((err) => res.status(400).send(err));
        }
      })
      .catch((err) => res.status(500).send(err));
  } catch (e) {
    return res.status(400).send({ error: `${e}` });
  }
});

app.get("/votes", (req, res) => {
  Vote.find({
    roundId: req.query.roundId,
  })
    .then((votes) => res.status(200).send(votes))
    .catch((err) => res.status(500).send(err));
});

app.get("/rounds", (req, res) => {
  Round.find()
    .then((votes) => res.status(200).send(votes))
    .catch((err) => res.status(500).send(err));
});

app.post("/rounds", async (req, res) => {
  const nominationEndTime = new Date();
  nominationEndTime.setUTCHours(18, 0, 0, 0);

  const votingEndTime = new Date(nominationEndTime);
  votingEndTime.setUTCDate(votingEndTime.getUTCDate() + 1);

  const roundId = cryptoModule.randomUUID();
  const lastRound = await Round.findOne().sort({ roundNumber: -1 });
  const newRoundNumber = lastRound ? lastRound.roundNumber + 1 : 1;

  const newRound = new Round({
    id: roundId,
    roundNumber: newRoundNumber,
    nominationStartTime: new Date(),
    nominationEndTime,
    votingStartTime: nominationEndTime,
    votingEndTime,
    createdAt: new Date(),
    status: "nominating",
    winner: null,
  });

  try {
    await newRound.validate();
    await newRound.save();

    res.status(200).send(newRound);
  } catch (e) {
    // eslint-disable-next-line no-undef
    console.error(e);

    throw e;
  }
});

// Fetches nominations by round. Useful for voting per round
app.get("/nominationsByRound", (req, res) => {
  const roundId = req.query.roundId;

  Nomination.aggregate([
    [
      {
        $match: {
          roundId: roundId,
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
      {
        $group: {
          _id: "$castId",
          document: { $first: "$$ROOT" },
          totalVotes: { $sum: "$votesCount" },
          weight: { $sum: "$weight" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$document",
              { votesCount: "$totalVotes", weight: "$weight" },
            ],
          },
        },
      },
    ],
  ])
    .sort({
      weight: -1,
      username: -1,
    })
    .limit(5)
    .then((nominations) => res.status(200).send(nominations))
    .catch((err) => res.status(500).send(err));
});

// Fetches the current nominations for TODAY
app.get("/nominationsByFid", (req, res) => {
  const startToday = new Date();
  startToday.setUTCHours(0, 0, 0, 0);

  const endToday = new Date();
  endToday.setUTCHours(18, 0, 0, 0);

  const fid = Number(req.query.fid);

  Nomination.aggregate([
    [
      {
        $match: {
          createdAt: {
            $gte: startToday,
            $lte: endToday,
          },
          fid: {
            $eq: fid,
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
      {
        $group: {
          _id: "$castId",
          document: { $first: "$$ROOT" },
          totalVotes: { $sum: "$votesCount" },
          weight: { $sum: "$weight" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$document",
              { votesCount: "$totalVotes", weight: "$weight" },
            ],
          },
        },
      },
    ],
  ])
    .sort({
      weight: -1,
    })
    .limit(1)
    .then((nominations) => res.status(200).send(nominations))
    .catch((err) => res.status(500).send(err));
});

// Fetches the current nominations for TODAY
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
      {
        $group: {
          _id: "$castId",
          document: { $first: "$$ROOT" },
          totalVotes: { $sum: "$votesCount" },
          weight: { $sum: "$weight" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$document",
              { votesCount: "$totalVotes", weight: "$weight" },
            ],
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

app.get("/history", async (req, res) => {
  try {
    const nominations = await Nomination.find({
      fid: {
        $eq: req.query.fid,
      },
    });

    res.json(nominations);
  } catch (error) {
    console.error("Failed to fetch history", error);
    res.status(500).send("Internal Server Error");
  }
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

    res.json(rounds);
  } catch (error) {
    console.error("Failed to determine current periods", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
