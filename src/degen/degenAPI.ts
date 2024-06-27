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
    remainingAllowance: degenJson.allowance.remaining_allowance,
    allowance: degenJson.allowance.tip_allowance,
  };
};

export const tipDistribution = async (fid: number) => {
  const tipAmount = await fetchDegenTips(fid);
  const remainingAllowance = Number(tipAmount.remainingAllowance);

  if (remainingAllowance < 1) {
    throw new Error(
      "Invalid tip distribution. You have no remaining allowance to distribute"
    );
  }

  if (remainingAllowance < 7) {
    throw new Error(
      "Invalid tip distribution. Minimum is 7 $DEGEN remaining on your remaining allowance"
    );
  }

  const tothCut = Math.floor(remainingAllowance * 0.15); // 15% to @tipothehat
  const castWinnerEarnings = Math.floor(remainingAllowance * 0.85); // 85% to the cast winner

  return {
    tothCut,
    castWinnerEarnings,
  };
};
