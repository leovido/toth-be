// ts-ignore
import express, { Router } from "express";
import { IVote, Vote } from "./votesModel";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { votesServiceInstance } from "./votesService";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const votesRegistry = new OpenAPIRegistry();
export const votesRouter: Router = express.Router();

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
