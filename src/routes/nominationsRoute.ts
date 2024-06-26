// ts-ignore
import express from "express";
import { PipelineStage } from "mongoose";
import { Nomination } from "../schemas/nomination";

const router = express.Router();

router.post("/nominations", async (req, res) => {
  const startToday = new Date();
  startToday.setUTCHours(0, 0, 0, 0);

  const endToday = new Date();
  endToday.setUTCHours(18, 0, 0, 0);

  try {
    const matches = await Nomination.aggregate([
      {
        $match: {
          createdAt: { $gte: startToday, $lte: endToday },
          fid: 203666,
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
      await Nomination.validate(req.body);

      const newItem = new Nomination(req.body);
      const item = await newItem.save();
      res.status(201).send(item);
    } else {
      res.status(200).send("Already nominated");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

// Fetches nominations by round. Useful for voting per round
router.get("/nominationsByRound", (req, res) => {
  const roundId = req.query.roundId;

  const pipeline: PipelineStage[] = [
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
  ];

  Nomination.aggregate(pipeline)
    .sort({
      weight: -1,
      createdAt: 1,
    })
    .limit(5)
    .then((nominations: unknown) => res.status(200).send(nominations))
    .catch((err: unknown) => res.status(500).send(err));
});

router.get("/nominationsById", (req, res) => {
  const id = req.query.id;

  const pipeline: PipelineStage[] = [
    {
      $match: {
        id: {
          $eq: id,
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
  ];

  Nomination.aggregate(pipeline)
    .limit(1)
    .then((nominations: unknown) => res.status(200).send(nominations))
    .catch((err: unknown) => res.status(500).send(err));
});

// Fetches the current nominations for TODAY by FID
router.get("/nominationsByFid", (req, res) => {
  const startToday = new Date();
  startToday.setUTCHours(0, 0, 0, 0);

  const endToday = new Date();
  endToday.setUTCHours(18, 0, 0, 0);

  const fid = Number(req.query.fid);

  const pipeline: PipelineStage[] = [
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
  ];

  Nomination.aggregate(pipeline)
    .sort({
      weight: -1,
    })
    .limit(1)
    .then((nominations: unknown) => res.status(200).send(nominations))
    .catch((err: unknown) => res.status(500).send(err));
});

// Fetches the current nominations for TODAY
router.get("/nominations", (req, res) => {
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

  const pipeline: PipelineStage[] = [
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
  ];

  Nomination.aggregate(pipeline)
    .sort({
      votesCount: -1,
    })
    .limit(5)
    .then((nominations: unknown) => res.status(200).send(nominations))
    .catch((err: unknown) => res.status(500).send(err));
});

export default router;
