import { fetchDegenTips, tipDistribution } from "./degenAPI";
import fetch, { Response } from "node-fetch";

// Cast fetch to its actual type
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

jest.mock("node-fetch", () => jest.fn());

describe("fetchDegenTips", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 0 when Error is in the response", async () => {
    const fid = 1;
    const mockResponse = {
      Error: "No such document",
    };

    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const response = await fetchDegenTips(fid);

    expect(mockedFetch).toHaveBeenCalledWith(
      `https://www.degentip.me/api/get_allowance?fid=${fid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    expect(response.allowance).toEqual("0");
    expect(response.remainingAllowance).toEqual("0");
  });

  it("should fetch tip allowance from degen.tips API", async () => {
    const fid = 1;
    const mockResponse = {
      allowance: {
        tip_allowance: "1000",
        remaining_tip_allowance: "434",
      },
    };

    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const response = await fetchDegenTips(fid);

    expect(mockedFetch).toHaveBeenCalledWith(
      `https://www.degentip.me/api/get_allowance?fid=${fid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    expect(response.allowance).toEqual(mockResponse.allowance.tip_allowance);
    expect(response.remainingAllowance).toEqual(
      mockResponse.allowance.remaining_tip_allowance
    );
  });

  it("should throw an error if the response is not ok", async () => {
    const fid = 203666;

    const mockResponse = {
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    };

    mockedFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

    await expect(fetchDegenTips(fid)).rejects.toThrow();
  });
});

describe("tipDistribution", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should calculate the correct tip distribution", async () => {
    const fid = 1;
    const mockResponse = {
      allowance: {
        tip_allowance: "1000",
        remaining_tip_allowance: "1000",
      },
    };
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const expectedTothCut =
      Number(mockResponse.allowance.remaining_tip_allowance) * 0.1;
    const expectedCastWinnerEarnings =
      Number(mockResponse.allowance.remaining_tip_allowance) * 0.9 - 1;

    const result = await tipDistribution(fid);

    expect(result.tothCut).toEqual(expectedTothCut);
    expect(result.castWinnerEarnings).toEqual(expectedCastWinnerEarnings);
  });

  it("should handle remaining allowance < 0, throwing an error", async () => {
    const fid = 1;
    const mockResponse = {
      allowance: {
        tip_allowance: "1000",
        remaining_tip_allowance: "-1",
      },
    };
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const errorMessage =
      "Invalid tip distribution. You have no remaining allowance to distribute";

    await expect(tipDistribution(fid)).rejects.toThrow(errorMessage);
  });

  it("should handle remaining allowance as 0, throwing an error", async () => {
    const fid = 1;
    const mockResponse = {
      allowance: {
        tip_allowance: "1000",
        remaining_tip_allowance: "0",
      },
    };
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const errorMessage =
      "Invalid tip distribution. You have no remaining allowance to distribute";

    await expect(tipDistribution(fid)).rejects.toThrow(errorMessage);
  });

  it("should not send any tips if below 7 $DEGEN", async () => {
    const fid = 1;
    const mockResponse = {
      allowance: {
        tip_allowance: "1000",
        remaining_tip_allowance: "1",
      },
    };
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const errorMessage =
      "Invalid tip distribution. Minimum is 7 $DEGEN remaining on your remaining allowance";

    await expect(tipDistribution(fid)).rejects.toThrow(errorMessage);
  });

  it("should handle error when fetching tip amount", async () => {
    const fid = 3;
    const mockResponse = {
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    };

    mockedFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

    const errorMessage = "Failed to fetch data from degen.tips";

    await expect(tipDistribution(fid)).rejects.toThrow(errorMessage);
  });

  it("should handle remaining allowance equal to 1", async () => {
    const fid = 1;
    const mockResponse = {
      allowance: {
        tip_allowance: "1000",
        remaining_tip_allowance: "invalid",
      },
    };
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);
    expect(tipDistribution(fid)).rejects.toThrow(
      new Error("Invalid remaining allowance")
    );
  });
});
