import fetch from 'node-fetch';

export const fetchDegenTips = async (
  fid: number
): Promise<{ remainingAllowance: string; allowance: string }> => {
  const degenResponse = await fetch(
    `https://www.degentip.me/api/get_allowance?fid=${fid}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (!degenResponse.ok) {
    throw new Error('Failed to fetch data from degen.tips');
  }

  const degenJson = await degenResponse.json();

  if (degenJson.Error) {
    return {
      remainingAllowance: '0',
      allowance: '0'
    };
  }

  if (degenJson.allowance) {
    return {
      remainingAllowance: degenJson.allowance.remaining_allowance,
      allowance: degenJson.allowance.tip_allowance
    };
  } else {
    return {
      remainingAllowance: '0',
      allowance: '0'
    };
  }
};

export const tipDistribution = async (fid: number) => {
  const tipAmount = await fetchDegenTips(fid);
  const remainingAllowance = parseFloat(tipAmount.remainingAllowance);

  if (isNaN(remainingAllowance)) {
    throw new Error('Invalid remaining allowance');
  }

  if (remainingAllowance < 1) {
    throw new Error(
      'Invalid tip distribution. You have no remaining allowance to distribute'
    );
  }

  if (remainingAllowance < 7) {
    throw new Error(
      'Invalid tip distribution. Minimum is 7 $DEGEN remaining on your remaining allowance'
    );
  }

  // 10% to @tipothehat; in the case there is no winner, all tips go to @tipothehat
  const tothCut = Math.floor(remainingAllowance * 0.1);
  // 90% to the cast winner minus 1 to ensure we do not reach 0, as it can invalidate tips
  const castWinnerEarnings = Math.floor(remainingAllowance * 0.9) - 1;

  return {
    tothCut,
    castWinnerEarnings
  };
};
