export const TimeStampToDate = (timeStamp?: number | string): string => {
  if (!timeStamp) return '-'; // undefined หรือ null
  // แปลง string → number ถ้าจำเป็น
  const ms =
    typeof timeStamp === 'string' ? parseInt(timeStamp, 10) : timeStamp;

  if (Number.isNaN(ms)) return '-'; // ไม่ใช่ number จริง ๆ

  const date = new Date(ms);
  if (isNaN(date.getTime())) return '-'; // invalid date อีกชั้น

  // format
  const dd = String(date.getDate()).padStart(2, '0');
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return `${yyyy}-${MM}-${dd} ${HH}:${mm}`;
};

export const formatThaiDate = (dateStr: string | Date): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatThaiDateWithOutWeekly = (dateStr: string | Date): string => {
  const date =
    typeof dateStr === 'string' && /^\d+$/.test(dateStr)
      ? new Date(Number(dateStr)) // แปลงจาก string เป็น number ก่อน
      : new Date(dateStr); // หรือรับ Date object ก็ได้

  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const convertTimestampToDate = (
  timeStamp: number | string | null
): string => {
  if (!timeStamp) return '-';
  const ts = typeof timeStamp === 'string' ? Number(timeStamp) : timeStamp;
  const date = new Date(ts);
  return date.toISOString().split('T')[0];
};

export const getTimeInTimeStamp = (
  timeStamp: number | string | null
): string => {
  if (!timeStamp) return '-';
  const date = new Date(Number(timeStamp));
  if (isNaN(date.getTime())) return '-';

  // ตัดเอาเวลาจาก ISO string: "2025-05-21T15:56:43.492Z"
  return date.toISOString().split('T')[1].split('.')[0]; // ได้ "15:56:43"
};

export const formatDMYDate = (date: string | Date) => {
  const formattedDate = new Date(date).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return formattedDate;
};
