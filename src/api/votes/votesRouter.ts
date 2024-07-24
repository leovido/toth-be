// ts-ignore
import express, { Router } from "express";
import { IVote, Vote } from "./votesModel";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { votesServiceInstance } from "./votesService";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { z } from "zod";

export const votesRegistry = new OpenAPIRegistry();
export const votesRouter: Router = express.Router();

votesRegistry.registerPath({
  method: "get",
  path: "votes/votes",
  tags: ["signers"],
  responses: createApiResponse(z.null(), "Success"),
});

votesRegistry.registerPath({
  method: "post",
  path: "votes/votes",
  tags: ["signers"],
  responses: createApiResponse(z.null(), "Success"),
});

votesRouter.post("/votes", async (req, res, next) => {
  try {
    await Vote.validate(req.body);
    const serviceResponse = await votesServiceInstance.createVote(
      req.body as IVote
    );

    return handleServiceResponse(serviceResponse, res);
  } catch (e) {
    next(e);
  }
});

votesRouter.get("/votes", async (req, res, next) => {
  try {
    const roundId = req.query.roundId as string;
    const serviceResponse = await votesServiceInstance.fetchVotesByRoundId(
      roundId
    );

    return handleServiceResponse(serviceResponse, res);
  } catch (e) {
    next(e);
  }
});
