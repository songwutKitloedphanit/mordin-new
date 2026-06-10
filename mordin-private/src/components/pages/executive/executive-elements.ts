// ชื่อธาตุอาหารแบบเต็มภาษาไทย เพื่อให้ผู้บริหารเข้าใจได้ทันทีว่ากราฟแต่ละตัวคืออะไร
// ใช้ร่วมกันระหว่างหน้า Executive Dashboard ทั้งสองหน้า
export const ELEMENT_LABELS: Record<string, { name: string; symbol: string }> =
  {
    OM: { name: 'อินทรียวัตถุ', symbol: 'OM' },
    N: { name: 'ไนโตรเจน', symbol: 'N' },
    P: { name: 'ฟอสฟอรัส', symbol: 'P' },
    K: { name: 'โพแทสเซียม', symbol: 'K' },
    Ca: { name: 'แคลเซียม', symbol: 'Ca' },
    Mg: { name: 'แมกนีเซียม', symbol: 'Mg' },
    pH: { name: 'ความเป็นกรด-ด่าง', symbol: 'pH' },
  };

export const formatElementTitle = (code: string) => {
  const meta = ELEMENT_LABELS[code];
  return meta ? `${meta.name} (${meta.symbol})` : code;
};

export const formatElementShort = (code: string) => {
  const meta = ELEMENT_LABELS[code];
  return meta ? meta.name : code;
};
