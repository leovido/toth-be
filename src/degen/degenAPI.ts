import fetch from "node-fetch";

export const fetchDegenTips = async (
  fid: number
): Promise<{ remainingAllowance: string; allowance: string }> => {
  const degenResponse = await fetch(
    `https://api.degen.tips/airdrop2/allowances?fid=${fid}`,
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

  const degenJson: {
    tip_allowance: string;
    remaining_tip_allowance: string;
  }[] = await degenResponse.json();

  if (degenJson.length === 0) {
    return {
      remainingAllowance: "0",
      allowance: "0",
    };
  } else {
    return {
      remainingAllowance: degenJson[0].remaining_tip_allowance,
      allowance: degenJson[0].tip_allowance,
    };
  }
};

export const tipDistribution = async (fid: number) => {
  const tipAmount = await fetchDegenTips(fid);
  const remainingAllowance = parseFloat(tipAmount.remainingAllowance);

  if (isNaN(remainingAllowance)) {
    throw new Error("Invalid remaining allowance");
  }

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

  // 10% to @tipothehat; in the case there is no winner, all tips go to @tipothehat
  const tothCut = Math.floor(remainingAllowance * 0.1);
  // 90% to the cast winner minus 1 to ensure we do not reach 0, as it can invalidate tips
  const castWinnerEarnings = Math.floor(remainingAllowance * 0.9) - 1;

  return {
    tothCut,
    castWinnerEarnings,
  };
};
