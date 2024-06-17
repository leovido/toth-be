import fetch from "node-fetch";

export const fetchDegenTips = async (
  fid: number
): Promise<{ remainingAllowance: string; allowance: string }> => {
  try {
    const degenResponse = await fetch(
      `https://www.degen.tips/api/airdrop2/tip-allowance?fid=${fid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!degenResponse.ok) {
      throw new Error("Failed to fetch data from degen.tips");
    }

    const degenJson = await degenResponse.json();

    return degenJson;
  } catch (error) {
    throw error;
  }
};
