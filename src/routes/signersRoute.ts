// ts-ignore
import express from "express";
import { Signer } from "../schemas/signer";

const router = express.Router();

router.get("/signers", async (req, res) => {
  const signer = await Signer.findOne({
    fid: { $eq: req.query.fid },
  });

  if (signer) {
    res.status(200).send(signer);
  } else {
    res.status(204).json();
  }
});

router.get("/allSigners", async (_req, res) => {
  const allSigners = await Signer.find();

  res.status(200).send(allSigners);
});

router.post("/signers", async (req, res) => {
  try {
    await Signer.validate(req.body);

    const newItem = new Signer(req.body);
    const item = await newItem.save();
    res.status(201).send(item);
  } catch (e) {
    return res.status(400).send({ error: `signer error ${e}` });
  }
});

router.post("/updateSigner", async (req, res) => {
  try {
    const signer = await Signer.findOne({
      fid: { $eq: req.body.fid },
    });

    const _updatedSigner = {
      ...signer?.toJSON(),
      status: req.body.status,
    };

    const updatedSigner = new Signer(_updatedSigner);
    const item = await updatedSigner.updateOne(_updatedSigner);
    res.status(201).send(item);
  } catch (e) {
    return res.status(400).send({ error: `signer error ${e}` });
  }
});

export default router;
