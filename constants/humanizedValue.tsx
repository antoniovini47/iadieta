function humanizedValue(value: number) {
  const roundFactor = 0.5;
  return Math.round(value + (roundFactor + Math.random() * roundFactor));
}

export default humanizedValue;
