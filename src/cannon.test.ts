import * as cannonModule from "./cannon";
import * as clientModule from "./neynar/client";
import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import * as degenAPIModule from "./degen/degenAPI";

import cron from "node-cron";
import fetch, { Response } from "node-fetch";

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;
jest.mock("node-fetch", () => jest.fn());
jest.mock("node-cron", () => ({
  schedule: jest.fn(),
}));

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

describe("fetchCastWinner", () => {
  it("should fetch the cast winner successfully", async () => {
    const mockResponse = {
      winner: "0xe2ea9f4dedc4ab2ffba3e2718aa0521ad2d60b4c",
    };
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await cannonModule.fetchCastWinner();

    expect(result).toEqual(mockResponse.winner);
  });

  it("should return an empty string when null", async () => {
    const mockResponse = {
      ok: false,
      status: 200,
      json: () => Promise.resolve(null),
    };

    mockedFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

    const winner = await cannonModule.fetchCastWinner();
    expect(winner).toBe("");
  });

  it("should return an empty string when rejecting promise", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: () => Promise.reject(),
    };

    mockedFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

    const winner = await cannonModule.fetchCastWinner();
    expect(winner).toBe("");
  });
});

describe("cannonCronJob", () => {
  beforeEach(() => {
    jest
      .spyOn(cannonModule, "fetchCastWinner")
      .mockResolvedValue("0xe2ea9f4dedc4ab2ffba3e2718aa0521ad2d60b4c");
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
      "50 23 * * *",
      expect.any(Function)
    );
  });

  it("should fetch the cast winner and approved signers", async () => {
    await cannonModule.executeCannon();
    expect(cannonModule.fetchCastWinner).toHaveBeenCalledTimes(1);
    expect(cannonModule.fetchApprovedSigners).toHaveBeenCalled();
    expect(degenAPIModule.fetchDegenTips).toHaveBeenCalledTimes(2);
  });

  it("pass when receiving null as the cast winner", async () => {
    jest.spyOn(cannonModule, "fetchCastWinner").mockResolvedValue("");
    const castWinner = await cannonModule.fetchCastWinner();
    expect(castWinner).toBe("");
  });

  it("any string", async () => {
    jest.spyOn(cannonModule, "fetchCastWinner").mockResolvedValue("testing");
    const castWinner = await cannonModule.fetchCastWinner();
    expect(castWinner).toBe("testing");
  });
});

describe("executeCannon", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("should post cast cannon for each signer with cast winner", async () => {
    const mockCastWinner = "0xe2ea9f4dedc4ab2ffba3e2718aa0521ad2d60b4c";
    const mockAllSigners: Signer[] = [
      {
        fid: 203666,
        signer_uuid: "18b16858-01eb-49f4-a1d7-14d11d4264c5",
        public_key:
          "0x32579541e743367d30195d06d632914afef638d64ccddcac74cc2c19f6e6bf83",
        status: "approved",
      },
      {
        fid: 3433,
        signer_uuid: "18b16858-01eb-49f4-a1d7-14d11d4264c5",
        public_key:
          "0x32579541e743367d30195d06d632914afef638d64ccddcac74cc2c19f6e6bf81",
        status: "approved",
      },
    ];
    const mockTothCut = 100;
    const mockCastWinnerEarnings = 200;

    jest
      .spyOn(cannonModule, "fetchCastWinner")
      .mockResolvedValue(mockCastWinner);
    jest
      .spyOn(cannonModule, "fetchApprovedSigners")
      .mockResolvedValue(mockAllSigners);
    jest.spyOn(degenAPIModule, "tipDistribution").mockResolvedValue({
      tothCut: mockTothCut,
      castWinnerEarnings: mockCastWinnerEarnings,
    });

    const mockPostCastCannon = jest
      .spyOn(clientModule, "postCastCannon")
      .mockResolvedValue();

    await cannonModule.executeCannon();

    expect(cannonModule.fetchCastWinner).toHaveBeenCalledTimes(1);
    expect(cannonModule.fetchApprovedSigners).toHaveBeenCalledTimes(1);
    expect(degenAPIModule.tipDistribution).toHaveBeenCalledTimes(
      mockAllSigners.length
    );
    expect(mockPostCastCannon).toHaveBeenCalledTimes(mockAllSigners.length * 2);

    mockAllSigners.forEach((signer) => {
      expect(mockPostCastCannon).toHaveBeenCalledWith(
        signer.signer_uuid,
        `Congratulations!🎉\n\nYour cast is the winner for @tipothehat\n\nFollow us on /tipothehat\n\n${mockCastWinnerEarnings} $DEGEN`,
        mockCastWinner
      );
    });
  });

  it("should post cast cannon for each signer without cast winner", async () => {
    const mockCastWinner = "";
    const mockAllSigners: Signer[] = [
      {
        fid: 203666,
        signer_uuid: "18b16858-01eb-49f4-a1d7-14d11d4264c5",
        public_key:
          "0x32579541e743367d30195d06d632914afef638d64ccddcac74cc2c19f6e6bf83",
        status: "approved",
      },
      {
        fid: 3433,
        signer_uuid: "18b16858-01eb-49f4-a1d7-14d11d4264c5",
        public_key:
          "0x32579541e743367d30195d06d632914afef638d64ccddcac74cc2c19f6e6bf81",
        status: "approved",
      },
    ];
    const mockTothCut = 100;
    const mockCastWinnerEarnings = 200;

    jest
      .spyOn(cannonModule, "fetchCastWinner")
      .mockResolvedValue(mockCastWinner);
    jest
      .spyOn(cannonModule, "fetchApprovedSigners")
      .mockResolvedValue(mockAllSigners);
    jest.spyOn(degenAPIModule, "tipDistribution").mockResolvedValue({
      tothCut: mockTothCut,
      castWinnerEarnings: mockCastWinnerEarnings,
    });

    const mockPostCastCannon = jest.spyOn(clientModule, "postCastCannon");

    await cannonModule.executeCannon();

    expect(cannonModule.fetchCastWinner).toHaveBeenCalledTimes(1);
    expect(cannonModule.fetchApprovedSigners).toHaveBeenCalledTimes(1);
    expect(degenAPIModule.tipDistribution).toHaveBeenCalledTimes(
      mockAllSigners.length
    );
    expect(mockPostCastCannon).toHaveBeenCalledTimes(mockAllSigners.length);

    mockAllSigners.forEach((signer) => {
      const aggregateTips = mockTothCut + mockCastWinnerEarnings;
      expect(mockPostCastCannon).toHaveBeenCalledWith(
        signer.signer_uuid,
        `${aggregateTips} $DEGEN`,
        "0xe2ea9f4dedc4ab2ffba3e2718aa0521ad2d60b4c"
      );
    });
  });

  it("should capture and ignore errors thrown by signers", async () => {
    const mockCastWinner = "0xe2ea9f4dedc4ab2ffba3e2718aa0521ad2d60b4c";
    const mockAllSigners: Signer[] = [
      {
        fid: 203666,
        signer_uuid: "18b16858-01eb-49f4-a1d7-14d11d4264c5",
        public_key:
          "0x32579541e743367d30195d06d632914afef638d64ccddcac74cc2c19f6e6bf83",
        status: "approved",
      },
      {
        fid: 3433,
        signer_uuid: "18b16858-01eb-49f4-a1d7-14d11d4264c5",
        public_key:
          "0x32579541e743367d30195d06d632914afef638d64ccddcac74cc2c19f6e6bf81",
        status: "approved",
      },
    ];
    const mockTothCut = 100;
    const mockCastWinnerEarnings = 200;

    jest
      .spyOn(cannonModule, "fetchCastWinner")
      .mockResolvedValue(mockCastWinner);
    jest
      .spyOn(cannonModule, "fetchApprovedSigners")
      .mockResolvedValue(mockAllSigners);
    jest.spyOn(degenAPIModule, "tipDistribution").mockResolvedValue({
      tothCut: mockTothCut,
      castWinnerEarnings: mockCastWinnerEarnings,
    });

    const mockPostCastCannon = jest
      .spyOn(clientModule, "postCastCannon")
      .mockRejectedValue(new Error("Failed to post cast cannon"));

    await cannonModule.executeCannon();

    expect(cannonModule.fetchCastWinner).toHaveBeenCalledTimes(1);
    expect(cannonModule.fetchApprovedSigners).toHaveBeenCalledTimes(1);
    expect(degenAPIModule.tipDistribution).toHaveBeenCalledTimes(
      mockAllSigners.length
    );
    expect(mockPostCastCannon).toHaveBeenCalledTimes(mockAllSigners.length * 2);

    mockAllSigners.forEach((signer) => {
      expect(mockPostCastCannon).toHaveBeenCalledWith(
        signer.signer_uuid,
        `Congratulations!🎉\n\nYour cast is the winner for @tipothehat\n\nFollow us on /tipothehat\n\n${mockCastWinnerEarnings} $DEGEN`,
        mockCastWinner
      );
    });
  });
});
