import { GenCard1 } from '@/components/gui/GuiButton';

export default function LabCard() {
  return (
    <div className="row">
      <GenCard1
        color="bg-secondary"
        icon="fas fa-bong"
        num={10}
        name="ทั้งหมด"
        desc="การวิเคราะห์ทั้งหมด"
      />
      <GenCard1
        color="bg-primary"
        icon="fas fa-bong"
        num={2}
        name="อ่านค่า"
        desc="การวิเคราะห์แบบอ่านค่า"
      />
      <GenCard1
        color="bg-primary"
        icon="fas fa-bong"
        num={2}
        name="เครื่อง-1"
        desc="การวิเคราะห์จากเครื่องแบบที่1"
      />
      <GenCard1
        color="bg-primary"
        icon="fas fa-bong"
        num={6}
        name="เครื่อง-2"
        desc="การวิเคราะห์จากเครื่องแบบที่2"
      />
    </div>
  );
}
