import express from "express";
import cryptoModule from "crypto";
import { Round } from "../schemas/round";

const router = express.Router();

router.get("/rounds", (req, res) => {
  Round.find()
    .then((votes: unknown) => res.status(200).send(votes))
    .catch((err: unknown) => res.status(500).send(err));
});

router.get("/latest-round", (_req, res) => {
  Round.findOne({
    status: "completed",
  })
    .sort({ createdAt: -1 })
    .limit(1)
    .then((round: unknown) => res.status(200).send(round));
});

router.post("/rounds", async (_req, res) => {
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
    console.error(e);

    throw e;
  }
});

export default router;
