// ts-ignore
import express from "express";
import cryptoModule from "crypto";
import { Round } from "../schemas/round";

const router = express.Router();

const createNewRound = (
  roundNumber: number,
  nominationEndTime: Date,
  votingEndTime: Date
) => {
  const roundId = cryptoModule.randomUUID();

  const newRoundNumber = roundNumber + 1;

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

  return newRound;
};

router.get("/rounds", (req, res) => {
  Round.find()
    .then((votes: unknown) => res.status(200).send(votes))
    .catch((err: unknown) => res.status(500).send(err));
});

router.get("/allNominationsForRounds", async (req, res) => {
  try {
    const allNominationsForRounds = await Round.aggregate([
      {
        $lookup: {
          from: "nominations",
          localField: "id",
          foreignField: "roundId",
          as: "nominations",
        },
      },
      {
        // Filter out rounds that have empty nominations arrays
        $match: {
          nominations: { $ne: [] },
        },
      },
      {
        $unwind: "$nominations", // Flatten the nominations array
      },
      {
        $group: {
          _id: "$roundNumber", // Group by roundNumber
          roundNumber: { $first: "$roundNumber" }, // Add roundNumber field
          nominations: {
            $push: "$nominations", // Directly push nominations without nesting
          },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          roundNumber: 1,
          nominations: 1,
        },
      },
    ]);

    res.status(200).send(allNominationsForRounds);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/allVotesForRounds", async (req, res) => {
  try {
    const allVotesForRounds = await Round.aggregate([
      {
        $lookup: {
          from: "votes",
          localField: "id",
          foreignField: "roundId",
          as: "votes",
        },
      },
      {
        // Filter out rounds that have empty nominations arrays
        $match: {
          votes: { $ne: [] },
        },
      },
      {
        $unwind: "$votes", // Flatten the nominations array
      },
      {
        $group: {
          _id: "$roundNumber", // Group by roundNumber
          roundNumber: { $first: "$roundNumber" }, // Add roundNumber field
          votes: {
            $push: "$votes", // Directly push nominations without nesting
          },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          roundNumber: 1,
          votes: 1,
        },
      },
    ]);

    res.status(200).send(allVotesForRounds);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/latest-round", async (_req, res, next) => {
  try {
    await Round.findOne({
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .limit(1)
      .then((round: unknown) => res.status(200).send(round));
  } catch (error) {
    next(error);
  }
});

router.post("/rounds", async (_req, res, next) => {
  const nominationEndTime = new Date();
  nominationEndTime.setUTCHours(18, 0, 0, 0);

  const votingEndTime = new Date(nominationEndTime);
  votingEndTime.setUTCDate(votingEndTime.getUTCDate() + 1);

  try {
    const lastRound = await Round.findOne().sort({ roundNumber: -1 });

    if (lastRound !== null) {
      const newRound = createNewRound(
        lastRound.roundNumber,
        nominationEndTime,
        votingEndTime
      );
      await newRound.validate();
      await newRound.save();

      res.status(200).send(newRound);
    } else {
      throw new Error("No rounds found");
    }
  } catch (error) {
    next(error);
  }
});

export default router;
