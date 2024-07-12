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
