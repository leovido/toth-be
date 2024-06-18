import fetch from "node-fetch";

export const fetchDegenTips = async (
  fid: number
): Promise<{ remainingAllowance: string; allowance: string }> => {
  const degenResponse = await fetch(
    `https://www.degentip.me/api/get_allowance?fid=${fid}`,
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

  return {
    remainingAllowance: degenJson.remaining_allowance,
    allowance: degenJson.tip_allowance,
  };
};
