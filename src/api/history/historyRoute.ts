// ts-ignore
import express from "express";
import { Nomination } from "../schemas/nomination";

const router = express.Router();

router.get("/history", async (req, res, next) => {
  try {
    const nominations = await Nomination.find({
      fid: { $eq: req.query.fid },
    }).limit(5);

    res.status(200).send(nominations);
  } catch (error) {
    next(error);
  }
});

router.get("/history", async (req, res, next) => {
  try {
    const nominations = await Nomination.find({
      fid: {
        $eq: req.query.fid,
      },
    });

    res.json(nominations);
  } catch (error) {
    next(error);
  }
});

export default router;
