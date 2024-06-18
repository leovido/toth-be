import express from "express";
import { Vote } from "../schemas/vote";
import { Round } from "../schemas/round";

const router = express.Router();

router.post("/votes", async (req, res) => {
  try {
    const { roundId, fid } = req.body;
    const round = await Round.findOne({
      id: roundId,
    });

    if (round === null) {
      return res.status(400).send({ error: "Round not found" });
    }

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
      .then((votes: unknown[]) => {
        if (votes.length > 0) {
          return res.status(400).send({ error: "You already voted" });
        } else {
          const newItem = new Vote(req.body);
          newItem.validateSync();
          newItem
            .save()
            .then((item: unknown) => res.status(201).send(item))
            .catch((err: unknown) => res.status(400).send(err));
        }
      })
      .catch((err: unknown) => res.status(500).send(err));
  } catch (e) {
    return res.status(400).send({ error: `${e}` });
  }
});

router.get("/votes", (req, res) => {
  Vote.find({
    roundId: req.query.roundId,
  })
    .then((votes: unknown) => res.status(200).send(votes))
    .catch((err: unknown) => res.status(500).send(err));
});

export default router;
