// ts-ignore
import express, { Router } from "express";
import { Signer } from "../signers/signersModel";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { signerServiceInstance } from "./signersService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { z } from "zod";

export const signersRegistry = new OpenAPIRegistry();
export const signersRouter: Router = express.Router();

signersRegistry.registerPath({
  method: "get",
  path: "/signers/signerByUUID",
  tags: ["signers"],
  responses: createApiResponse(z.null(), "Success"),
});

signersRegistry.registerPath({
  method: "get",
  path: "/signers/signersByFid",
  tags: ["signers"],
  responses: createApiResponse(z.null(), "Success"),
});

signersRegistry.registerPath({
  method: "get",
  path: "/signers/allSigners",
  tags: ["signers"],
  responses: createApiResponse(z.null(), "Success"),
});

signersRegistry.registerPath({
  method: "get",
  path: "/signers/approvedSignersAllowance",
  tags: ["signers"],
  responses: createApiResponse(z.null(), "Success"),
});

signersRegistry.registerPath({
  method: "get",
  path: "/signers/currentPooledTips",
  tags: ["signers"],
  responses: createApiResponse(z.null(), "Success"),
});

signersRegistry.registerPath({
  method: "post",
  path: "/signers/signers",
  tags: ["signers"],
  requestBody: {
    content: {
      "application/json": {
        schema: { type: "object" },
      },
    },
  },
  responses: createApiResponse(z.null(), "Success"),
});

signersRegistry.registerPath({
  method: "post",
  path: "/signers/updateSigner",
  tags: ["signers"],
  requestBody: {
    content: {
      "application/json": {
        schema: { type: "object" },
      },
    },
  },
  responses: createApiResponse(z.null(), "Success"),
});

signersRouter.get("/signerByPublicKey", async (req, res) => {
  if (typeof req.query.publicKey === "string") {
    const serviceResponse = await signerServiceInstance.findByPublicKey(
      req.query.publicKey
    );

    return handleServiceResponse(serviceResponse, res);
  } else {
    return handleServiceResponse(
      ServiceResponse.failure(
        "Invalid public key",
        null,
        StatusCodes.BAD_REQUEST
      ),
      res
    );
  }
});

signersRouter.get("/signerByUUID", async (req, res) => {
  const serviceResponse = await signerServiceInstance.findByUUID(
    req.query.signerUUID as string
  );

  return handleServiceResponse(serviceResponse, res);
});

signersRouter.get("/signersByFid", async (req, res) => {
  const serviceResponse = await signerServiceInstance.findByFid(
    Number(req.query.fid)
  );

  return handleServiceResponse(serviceResponse, res);
});

signersRouter.get("/allSigners", async (_req, res) => {
  const serviceResponse = await signerServiceInstance.findAll();

  return handleServiceResponse(serviceResponse, res);
});

signersRouter.get("/approvedSignersAllowance", async (_req, res) => {
  const serviceResponse =
    await signerServiceInstance.fetchApprovedSignersAllowance();

  return handleServiceResponse(serviceResponse, res);
});

signersRouter.get("/currentPooledTips", async (_req, res) => {
  const serviceResponse = await signerServiceInstance.fetchCurrentPooledTips();

  return handleServiceResponse(serviceResponse, res);
});

signersRouter.post("/signers", async (req, res, next) => {
  try {
    if (req.body) {
      await Signer.validate(req.body);
      const serviceResponse = await signerServiceInstance.createSigner(
        req.body
      );

      return handleServiceResponse(serviceResponse, res);
    } else {
      return handleServiceResponse(
        ServiceResponse.failure("Body cannot be empty", null, 400),
        res
      );
    }
  } catch (error) {
    next(error);
  }
});

signersRouter.post("/updateSigner", async (req, res, next) => {
  try {
    if (req.body) {
      const serviceResponse = await signerServiceInstance.updateSigner(
        req.body
      );

      return handleServiceResponse(serviceResponse, res);
    } else {
      return handleServiceResponse(
        ServiceResponse.failure("Body cannot be empty", null, 400),
        res
      );
    }
  } catch (error) {
    console.error(error, "here111");
    next(error);
  }
});
