// ts-ignore
import express from "express";
import { fetchDegenTips } from "../degen/degenAPI";
import { Round } from "../schemas/round";

const router = express.Router();

router.get("/degen-tips", async (req, res, next) => {
  try {
    const fid = Number(req.query.fid);
    const json = await fetchDegenTips(fid);
    const { remainingAllowance, allowance } = json;

    res.status(200).send({
      remainingAllowance,
      allowance,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/current-period", async (req, res, next) => {
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
    next(error);
  }
});

export default router;
