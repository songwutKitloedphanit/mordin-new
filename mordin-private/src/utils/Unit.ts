export const enToTh = (word: string): string => {
  const dictionary: { [key: string]: string } = {
    'kg/ha': 'กก./ไร่',
    // เพิ่มคำได้ตามต้องการ
  };

  return dictionary[word.toLowerCase()] || word;
};
