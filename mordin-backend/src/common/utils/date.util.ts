export const formatThaiDateWithOutWeekly = (dateStr: string | Date): string => {
  const date =
    typeof dateStr === 'string' && /^\d+$/.test(dateStr)
      ? new Date(Number(dateStr)) // แปลงจาก string (timestamp) เป็น number
      : new Date(dateStr);        // รองรับ Date object หรือ string แบบอื่น

  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatGlobalDateWithOutWeekly = (dateStr: string | Date): string => {
  const date =
    typeof dateStr === 'string' && /^\d+$/.test(dateStr)
      ? new Date(Number(dateStr)) // แปลงจาก string (timestamp) เป็น number
      : new Date(dateStr);        // รองรับ Date object หรือ string แบบอื่น

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};