// ts-ignore
import express from "express";
import { fetchDegenTips } from "../degen/degenAPI";
import { Round } from "../schemas/round";

const router = express.Router();

router.get("/degen-tips", async (req, res) => {
  try {
    const fid = Number(req.query.fid);
    const json = await fetchDegenTips(fid);
    const { remainingAllowance, allowance } = json;

    res.status(200).send({
      remainingAllowance,
      allowance,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/current-period", async (req, res) => {
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

export default router;
