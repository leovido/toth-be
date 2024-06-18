import { fetchDegenTips } from "./degenAPI";
import fetch, { Response } from "node-fetch";

// Cast fetch to its actual type
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

jest.mock("node-fetch", () => jest.fn());

describe("fetchDegenTips", () => {
  it("should fetch tip allowance from degen.tips API", async () => {
    const fid = 1;
    const mockResponse = {
      tip_allowance: "1000",
      remaining_allowance: "434",
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
    expect(response.allowance).toEqual(mockResponse.tip_allowance);
    expect(response.remainingAllowance).toEqual(
      mockResponse.remaining_allowance
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