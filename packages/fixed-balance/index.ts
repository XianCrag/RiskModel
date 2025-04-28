// equal weight for fixed-balance, return the weights array

export const fixedBalance = (weights: number[]) => {
  if (weights.length === 0) {
    return [];
  }
  const average = weights.reduce((acc, weight) => acc + weight, 0) / weights.length;
  return Array(weights.length).fill(average);
};


