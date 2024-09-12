function humanizedValue(value: number) {
  const roundFactor = 0.05; // 5% more or less
  return Math.round(value * (1 - roundFactor + Math.random() * 2 * roundFactor));
}

export default humanizedValue;
