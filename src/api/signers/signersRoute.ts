// ts-ignore
import express from 'express';
import { Signer } from '../signers/signersModel';
import { handleServiceResponse } from '@/common/utils/httpHandlers';
import { signerServiceInstance } from './signersService';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.get('/signerByPublicKey', async (req, res) => {
  if (typeof req.query.publicKey === 'string') {
    const serviceResponse = await signerServiceInstance.findByPublicKey(
      req.query.publicKey
    );

    return handleServiceResponse(serviceResponse, res);
  } else {
    return handleServiceResponse(
      ServiceResponse.failure(
        'Invalid public key',
        null,
        StatusCodes.BAD_REQUEST
      ),
      res
    );
  }
});

router.get('/signerByUUID', async (req, res) => {
  if (typeof req.query.signerUUID === 'string') {
    const serviceResponse = await signerServiceInstance.findByUUID(
      req.query.signerUUID
    );

    return handleServiceResponse(serviceResponse, res);
  } else {
    return handleServiceResponse(
      ServiceResponse.failure(
        'Invalid signerUUID',
        null,
        StatusCodes.BAD_REQUEST
      ),
      res
    );
  }
});

router.get('/signersByFid', async (req, res) => {
  const serviceResponse = await signerServiceInstance.findByFid(
    Number(req.query.fid)
  );

  return handleServiceResponse(serviceResponse, res);
});

router.get('/allSigners', async (_req, res) => {
  const serviceResponse = await signerServiceInstance.findAll();

  return handleServiceResponse(serviceResponse, res);
});

router.get('/approvedSignersAllowance', async (_req, res) => {
  const serviceResponse =
    await signerServiceInstance.fetchApprovedSignersAllowance();

  handleServiceResponse(serviceResponse, res);
});

router.get('/currentPooledTips', async (_req, res) => {
  const serviceResponse = await signerServiceInstance.fetchCurrentPooledTips();

  handleServiceResponse(serviceResponse, res);
});

router.post('/signers', async (req, res, next) => {
  try {
    if (req.body) {
      await Signer.validate(req.body);
      const serviceResponse = await signerServiceInstance.createSigner(
        req.body
      );

      handleServiceResponse(serviceResponse, res);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/updateSigner', async (req, res, next) => {
  try {
    const signer = await Signer.findOne({
      signer_uuid: { $eq: req.body.signerUUID }
    });

    const _updatedSigner = {
      ...signer?.toJSON(),
      signer_uuid: req.body.signerUUID,
      status: req.body.status,
      fid: req.body.fid
    };

    const updatedSigner = new Signer(_updatedSigner);
    const item = await updatedSigner.updateOne(_updatedSigner);

    res.status(201).send(item);
  } catch (error) {
    next(error);
  }
});

export default router;
