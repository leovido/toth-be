import express from "express";
import { Nomination } from "../schemas/nomination";

const router = express.Router();

router.get("/history", async (req, res) => {
  const nominations = await Nomination.find({
    fid: { $eq: req.query.fid },
  }).limit(5);

  res.status(200).send(nominations);
});

router.get("/history", async (req, res) => {
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

export default router;
