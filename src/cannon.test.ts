import { fetchCastWinner } from "./cannon";
import fetch, { Response } from "node-fetch";

// Cast fetch to its actual type
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;
jest.mock("node-fetch", () => jest.fn());
jest.mock("./neynar/client", () => jest.fn());

describe("fetchCastWinner", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch the cast winner successfully", async () => {
    const mockResponse = {
      winner: "John Doe",
    };
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await fetchCastWinner();

    expect(result).toEqual(mockResponse.winner);
  });

  it("should handle error when fetching the cast winner", async () => {
    const errorMessage = "Failed to fetch cast winner";

    const mockResponse = {
      ok: false,
      status: 500,
      json: () => Promise.reject(),
    };

    mockedFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

    await expect(fetchCastWinner()).rejects.toThrow(errorMessage);
  });
});
