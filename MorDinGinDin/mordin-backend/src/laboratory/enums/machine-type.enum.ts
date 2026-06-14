export enum MachineTypeTypes {
  RAW_VALUE = 'ค่าดิบ',
  REVERSE_LINEAR = 'สมการผกผันรูปแบบที่ 1 (สูตร OM)', //เก็บทุก field ใน lab setting
  P_COMPLEX = 'สมการผกผันรูปแบบที่ 2 (สูตร P)', //เก็บ dirtWeight, extractAmount, intercept, slope ใน lab setting
  EXTRACT_RATIO = 'สมการผกผันรูปแบบที่ 3 (สูตรทั่วไป)', // เก็บแค่ dirtWeight, extractAmount ใน lab setting
}
