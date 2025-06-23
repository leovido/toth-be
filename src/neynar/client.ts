import dotenv from "dotenv";
import path from "path";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { randomUUID } from "crypto";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

let client: NeynarAPIClient | undefined;

if (process.env.NEYNAR_API_KEY) {
  client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
}

export { client };

export const postCastCannon = async (
  signerUuid: string,
  text: string,
  replyTo: string
) => {
  const idem = randomUUID();

  if (!client) {
    throw new Error("NEYNAR_API_KEY is missing");
  }

  try {
    await client.publishCast(signerUuid, text, { replyTo, idem });
  } catch (error) {
    console.error("Error posting cast cannon:", error);
    throw error;
  }
};
