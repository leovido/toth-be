// import { fetchDegenTips } from "./degenAPI";
// const { mocked } = require("ts-jest/utils");
const fetchDegenTips = require("./degenAPI");

jest.mock("node-fetch");

describe("fetchDegenTips", () => {
  it("should fetch tip allowance from degen.tips API", async () => {
    const fid = 203666;
    const mockResponse = {
      allowance: 1000,
      currency: "ETH",
    };

    // mocked(fetch).mockResolvedValueOnce({
    //   ok: true,
    //   json: jest.fn().mockResolvedValueOnce(mockResponse),
    // });

    const response = await fetchDegenTips(fid);

    expect(fetch).toHaveBeenCalledWith(
      `https://www.degen.tips/api/airdrop2/tip-allowance?fid=${fid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    expect(response).toEqual(mockResponse);
  });

  it("should throw an error if the response is not ok", async () => {
    const fid = 203666;

    // mocked(fetch).mockResolvedValueOnce({
    //   ok: false,
    // });

    await expect(fetchDegenTips(fid)).rejects.toThrow(
      "Failed to fetch data from degen.tips"
    );
  });

  it("should return the error object if an error occurs", async () => {
    const fid = 203666;
    const errorMessage = "Network error";

    // mocked(fetch).mockRejectedValueOnce(new Error(errorMessage));

    const response = await fetchDegenTips(fid);

    expect(response).toBeInstanceOf(Error);
    expect(response.message).toBe(errorMessage);
  });
});
