export const formatNumber = (num: number | null): string => {
  if (num === null || num === undefined) return '-';

  if (Number.isInteger(num)) {
    // ถ้าเป็นจำนวนเต็ม แสดงพร้อม comma (เช่น 1,000)
    return num.toLocaleString();
  }
  // ปัดทศนิยมให้ 3 ตำแหน่ง
  const fixedNum = parseFloat(num.toFixed(3));
  return fixedNum.toLocaleString();
};
