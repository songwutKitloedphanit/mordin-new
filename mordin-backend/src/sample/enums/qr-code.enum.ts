export enum QrCodeTypeEnum {
  Booking = 'booking',
  Walkin = 'walkin',
  Spread = 'spread',
}

export enum SampleTypeEnum {
  Soil = 'soil',
  Sample = 'sample',
  Blank = 'blank',
}

export enum SampleStatusEnum {
  DISTRIBUTED = "distributed",   // แจกถุงให้เกษตรกร
  COLLECTED = "collected",       // เก็บตัวอย่างเสร็จ
  RECEIVED = "received",         // เจ้าหน้าที่รับตัวอย่าง
  ANALYZING = "analyzing",       // กำลังวิเคราะห์ในแล็บ
  ANALYZED = "analyzed",         // วิเคราะห์ครบแล้ว
  APPROVED = "approved",         // ตรวจสอบผลเรียบร้อย พร้อมเผยแพร่
}
