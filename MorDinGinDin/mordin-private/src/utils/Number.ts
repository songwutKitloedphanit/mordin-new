export const formatNumber = (num: number | null) => {
  if (!num) return '-';
  else if (Number.isInteger(num)) {
    return num.toLocaleString();
  } else {
    const fixedNum = parseFloat(num.toFixed(3));
    return fixedNum.toLocaleString();
  }
};
