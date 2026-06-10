import { GenCard1 } from '@/components/gui/GuiButton';

export const SampleReceivingInfoSummaryCard = () => {
  return (
    <div className="row">
      <GenCard1
        color="bg-secondary"
        icon="fas fa-map-marked"
        num={2}
        name="แปลง"
        desc="จำนวนแปลงทั้งหมด"
      />
      <GenCard1
        color="bg-danger"
        icon="fas fa-map-marked"
        num={0}
        name="ดินต้องปรับปรุง"
        desc="ดินต้องปรับปรุง 0/2 = 0%"
      />
      <GenCard1
        color="bg-primary"
        icon="fas fa-map-marked"
        num={2}
        name="ดินปกติ"
        desc="ดินปกติ 2/2 = 100%"
      />
      <GenCard1
        color="bg-success"
        icon="fas fa-map-marked"
        num={0}
        name="ดินสมบูรณ์"
        desc="ดินสมบูรณ์ 0/2 = 0%"
      />
    </div>
  );
};

export const SampleReceivingManagementSummaryCard = () => {
  return (
    <>
      {/* Cards Section 1 */}
      <div className="row">
        <GenCard1
          color="bg-secondary"
          icon="fas fa-qrcode"
          num={100}
          name="ตัวอย่าง"
          desc="โคต้าตัวอย่างทั้งหมด"
        />
        <GenCard1
          color="bg-warning"
          icon="fas fa-bong"
          num={30}
          name="QR code ว่าง"
          desc="ว่าง 30/100 = 30%"
        />
        <GenCard1
          color="bg-primary"
          icon="fas fa-bong"
          num="50:70"
          name="จองวิเคราะห์"
          desc="จอง:รับวิเคราะห์ 50% : 70%"
        />
        <GenCard1
          color="bg-success"
          icon="fas fa-bong"
          num={11}
          name="วิเคราะห์แล้ว"
          desc="วิเคราะห์แล้ว 11/100 = 11%"
        />
      </div>

      {/* Cards Section 2 */}
      <div className="row">
        <GenCard1
          color="bg-secondary"
          icon="fas fa-map-marked"
          num={2}
          name="แปลง"
          desc="จำนวนแปลงทั้งหมด"
        />
        <GenCard1
          color="bg-danger"
          icon="fas fa-map-marked"
          num={0}
          name="ดินต้องปรับปรุง"
          desc="ดินต้องปรับปรุง 0/2 = 0%"
        />
        <GenCard1
          color="bg-primary"
          icon="fas fa-map-marked"
          num={2}
          name="ดินปกติ"
          desc="ดินปกติ 2/2 = 100%"
        />
        <GenCard1
          color="bg-success"
          icon="fas fa-map-marked"
          num={0}
          name="ดินสมบูรณ์"
          desc="ดินสมบูรณ์ 0/2 = 0%"
        />
      </div>
    </>
  );
};
