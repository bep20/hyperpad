import BigNumber from "bignumber.js";

// Function to calculate adjusted total supply
export function calculateTotalSupply(totalSupply, decimals) {
  const divisor = new BigNumber(10).exponentiatedBy(decimals);

  // Perform the division using BigNumber
  const adjustedTotalSupply = new BigNumber(totalSupply).dividedBy(divisor);

  return adjustedTotalSupply.toString();
}
