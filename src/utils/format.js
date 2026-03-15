export const formatPrice = (value) => {
  const amount = Number(value || 0) / 100;
  return `¥${amount.toFixed(2)}`;
};

export const clampText = (text = '', max = 42) => {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
};
