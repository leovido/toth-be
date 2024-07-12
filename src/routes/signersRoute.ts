// ts-ignore
import express from "express";
import { Signer } from "../schemas/signer";

const router = express.Router();

router.get("/signers", async (req, res, next) => {
  try {
    const signer = await Signer.findOne({
      public_key: { $eq: req.query.publicKey },
    });

    if (signer) {
      res.status(200).send(signer);
    } else {
      res.status(204).json();
    }
  } catch (error) {
    next(error);
  }
});

router.get("/signerByUUID", async (req, res, next) => {
  try {
    const signer = await Signer.findOne({
      signer_uuid: { $eq: req.query.signerUUID },
    });

    if (signer) {
      res.status(200).send(signer);
    } else {
      res.status(204).json();
    }
  } catch (error) {
    next(error);
  }
});

router.get("/signersByFid", async (req, res, next) => {
  try {
    const signer = await Signer.findOne({
      fid: { $eq: req.query.fid },
    });

    if (signer) {
      res.status(200).send(signer);
    } else {
      res.status(204).json();
    }
  } catch (error) {
    next(error);
  }
});

router.get("/allSigners", async (_req, res, next) => {
  try {
    const allSigners = await Signer.find();

    res.status(200).send(allSigners);
  } catch (error) {
    next(error);
  }
});

router.post("/signers", async (req, res, next) => {
  try {
    await Signer.validate(req.body);

    const newItem = new Signer(req.body);
    const item = await newItem.save();
    res.status(201).send(item);
  } catch (error) {
    next(error);
  }
});

router.post("/updateSigner", async (req, res, next) => {
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
  } catch (error) {
    next(error);
  }
});

export default router;
