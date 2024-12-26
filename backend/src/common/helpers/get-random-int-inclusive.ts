/** 上限を含み下限も含む */
export const getRandomIntInclusive = (min: number, max: number): number => {
  const minCeiled  = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
};
