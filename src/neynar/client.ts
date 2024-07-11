import dotenv from "dotenv";
import path from "path";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { randomUUID } from "crypto";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY || "");

export const postCastCannon = async (
  signerUuid: string,
  text: string,
  replyTo: string
) => {
  const idem = randomUUID();

  await client.publishCast(signerUuid, text, {
    replyTo: replyTo,
    idem,
  });
};
