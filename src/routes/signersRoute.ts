// ts-ignore
import express from "express";
import { Signer } from "../schemas/signer";

const router = express.Router();

router.get("/signers", async (req, res) => {
  const signer = await Signer.findOne({
    public_key: { $eq: req.query.publicKey },
  });

  if (signer) {
    res.status(200).send(signer);
  } else {
    res.status(204).json();
  }
});

router.get("/signerByUUID", async (req, res) => {
  const signer = await Signer.findOne({
    signer_uuid: { $eq: req.query.signerUUID },
  });

  if (signer) {
    res.status(200).send(signer);
  } else {
    res.status(204).json();
  }
});

router.get("/signersByFid", async (req, res) => {
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
      signer_uuid: { $eq: req.body.signerUUID },
    });

    const _updatedSigner = {
      ...signer?.toJSON(),
      signer_uuid: req.body.signerUUID,
      status: req.body.status,
      fid: req.body.fid,
    };

    const updatedSigner = new Signer(_updatedSigner);
    const item = await updatedSigner.updateOne(_updatedSigner);
    res.status(201).send(item);
  } catch (e) {
    return res.status(400).send({ error: `signer error ${e}` });
  }
});

export default router;
