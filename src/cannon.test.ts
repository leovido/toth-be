import * as cannonModule from "./cannon";
import { jest } from "@jest/globals";
import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import * as degenAPIModule from "./degen/degenAPI";

import cron from "node-cron";
import fetch, { Response } from "node-fetch";
import { postCastCannon } from "./neynar/client";

const mockApprovedSigners: Signer[] = [
  {
    fid: 203666,
    signer_uuid: "18b16858-01eb-49f4-a1d7-14d11d4264c5",
    public_key:
      "0x32579541e743367d30195d06d632914afef638d64ccddcac74cc2c19f6e6bf83",
    status: "approved",
    signer_approval_url:
      "https://client.warpcast.com/deeplinks/signed-key-request?token=0x1080f0681bd300b5b4e145783c8c875187232b029b0d2943",
  },
  {
    fid: 3433,
    signer_uuid: "18b16858-01eb-49f4-a1d7-14d11d4264c5",
    public_key:
      "0x32579541e743367d30195d06d632914afef638d64ccddcac74cc2c19f6e6bf81",
    status: "approved",
    signer_approval_url:
      "https://client.warpcast.com/deeplinks/signed-key-request?token=0x1080f0681bd300b5b4e145783c8c875187232b029b0d2943",
  },
];

// Cast fetch to its actual type
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;
jest.mock("node-fetch", () => jest.fn());
jest.mock("./neynar/client", () => ({
  postCastCannon: jest.fn(),
}));
jest.mock("node-cron");

// jest.mock("./cannon", () => {
//   const originalModule: typeof import("./cannon") =
//     jest.requireActual("./cannon");

//   return {
//     __esModule: true,
//     fetchCastWinner: jest.fn().mockImplementation(() => "John Doe"),
//     fetchApprovedSigners: jest
//       .fn()
//       .mockImplementation(() => mockApprovedSigners),
//     cannonCronJob: originalModule.cannonCronJob,
//     executeCannon: originalModule.executeCannon,
//   };
// });

jest.mock("node-cron", () => ({
  schedule: jest.fn(),
}));

describe("fetchCastWinner", () => {
  it("should fetch the cast winner successfully", async () => {
    const mockResponse = {
      winner: "John Doe",
    };
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await cannonModule.fetchCastWinner();

    expect(result).toEqual(mockResponse.winner);
  });

  // it("should handle error when fetching the cast winner", async () => {
  //   const errorMessage = "Failed to fetch cast winner";

  //   const mockResponse = {
  //     ok: false,
  //     status: 500,
  //     json: () => Promise.reject(),
  //   };

  //   mockedFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

  //   await expect(fetchCastWinner()).rejects.toThrow(errorMessage);
  // });
});

describe("cannonCronJob", () => {
  beforeEach(() => {
    jest.spyOn(cannonModule, "fetchCastWinner").mockResolvedValue("John Doe");
    jest
      .spyOn(cannonModule, "fetchApprovedSigners")
      .mockResolvedValue(mockApprovedSigners);
    jest.spyOn(degenAPIModule, "fetchDegenTips").mockResolvedValue({
      allowance: "1000",
      remainingAllowance: "434",
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should schedule a cron job and execute the cannon logic", async () => {
    await cannonModule.cannonCronJob();

    expect(cron.schedule).toHaveBeenCalledWith(
      "0 * * * *",
      expect.any(Function)
    );
  });

  it.only("should fetch the cast winner and approved signers", async () => {
    await cannonModule.executeCannon();
    expect(cannonModule.fetchCastWinner).toHaveBeenCalledTimes(1);
    expect(cannonModule.fetchApprovedSigners).toHaveBeenCalled();
    expect(degenAPIModule.fetchDegenTips).toHaveBeenCalledTimes(2);
    expect(postCastCannon).toHaveBeenCalledWith(
      "18b16858-01eb-49f4-a1d7-14d11d4264c5",
      "434 $DEGEN",
      "John Doe"
    );
  });

  // it("should handle errors during cannon execution", async () => {
  //   const { fetchDegenTips } = require("./degen/degenAPI");
  //   const cron = require("node-cron");

  //   const errorMessage = "Failed to fetch cast winner";
  //   fetchCastWinner.mockRejectedValue(new Error(errorMessage));

  //   await expect(cannonCronJob()).rejects.toThrow(errorMessage);

  //   expect(cron.schedule).toHaveBeenCalledWith(
  //     "0 0 * * *",
  //     expect.any(Function)
  //   );
  //   expect(fetchCastWinner).toHaveBeenCalled();
  //   expect(fetchApprovedSigners).not.toHaveBeenCalled();
  //   expect(fetchDegenTips).not.toHaveBeenCalled();
  //   expect(require("./neynar/client").postCastCannon).not.toHaveBeenCalled();
  // });
});
