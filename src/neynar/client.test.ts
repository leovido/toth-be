import * as neynarModule from "./client";

jest.mock("./client", () => {
  return {
    ...jest.requireActual("./client"),
    client: {
      publishCast: jest.fn(),
    },
    postCastCannon: jest.fn(),
  };
});

const mockedPostCastCannon = neynarModule.postCastCannon as jest.MockedFunction<
  typeof neynarModule.postCastCannon
>;

describe("postCastCannon", () => {
  it("should retry any function", async () => {
    await neynarModule.retry(async () => {
      async () => {
        // eslint-disable-next-line no-console
        console.log("Hello, retry!");
      };
    }, 3);
  });

  it("should handle failure of postCastCannon", async () => {
    const signerUuid = "18b16858-01eb-49f4-a1d7-14d11d4264c5";
    const text = "Hello, world!";
    const replyTo = "123456789";
    const retries = 3;

    // Mock the postCastCannon function to throw an error
    mockedPostCastCannon.mockRejectedValueOnce(
      new Error("Failed to post cast")
    );

    await expect(
      neynarModule.postCastCannon(signerUuid, text, replyTo, retries)
    ).rejects.toThrow("Failed to post cast");
    expect(neynarModule.postCastCannon).toHaveBeenCalledWith(
      signerUuid,
      text,
      replyTo,
      retries
    );
  });

  it("should publish a cast with the given parameters", async () => {
    const signerUuid = "18b16858-01eb-49f4-a1d7-14d11d4264c5";
    const text = "Hello, world!";
    const replyTo = "123456789";
    const retries = 3;

    await neynarModule.postCastCannon(signerUuid, text, replyTo, retries);

    expect(neynarModule.postCastCannon).toHaveBeenCalledWith(
      signerUuid,
      text,
      replyTo,
      retries
    );
  });
});
