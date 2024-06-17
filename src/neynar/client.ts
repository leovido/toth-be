import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { randomUUID } from "crypto";

export const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY || "");

export const retry = async (
  fn: { (): Promise<void>; (): unknown },
  retries = 3
) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
};

export const postCast = async (
  signerUuid: string,
  text: string,
  replyTo: string,
  retries: number = 3
) => {
  const idem = randomUUID();
  await retry(async () => {
    await client.publishCast(signerUuid, text, {
      replyTo,
      idem,
    });
  }, retries);
};
