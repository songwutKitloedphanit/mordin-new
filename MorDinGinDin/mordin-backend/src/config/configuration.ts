export default () => ({
  qrSecret: process.env.QR_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  // เพิ่ม config อื่น ๆ ได้ที่นี่ เช่น database, port ฯลฯ
});
