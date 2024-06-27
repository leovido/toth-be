import * as neynarModule from "./client";

jest.mock("./client", () => {
  return {
    ...jest.requireActual("./client"),
    client: {
      publishCast: jest.fn(),
    },
    retry: jest.fn(),
  };
});

describe.skip("postCastCannon", () => {
  it("should publish a cast with the given parameters", async () => {
    const signerUuid = "18b16858-01eb-49f4-a1d7-14d11d4264c5";
    const text = "Hello, world!";
    const replyTo = "123456789";
    const retries = 3;

    await neynarModule.postCastCannon(signerUuid, text, replyTo, retries);

    expect(neynarModule.retry).toHaveBeenCalledWith(
      expect.any(Function),
      retries
    );
    expect(neynarModule.postCastCannon).toHaveBeenCalledWith(signerUuid, text, {
      replyTo: replyTo,
      idem: expect.any(String),
    });
  });
});
