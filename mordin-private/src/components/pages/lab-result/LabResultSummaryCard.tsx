import { GenCard1 } from '@/components/gui/GuiButton';

interface LabResultSummaryCardProps {
  /** จำนวนตัวอย่างของวันบริการที่เลือก */
  numberOfSamples?: number | null;
  /** จำนวนที่จองวิเคราะห์ */
  numberOfBookings?: number | null;
  /** จำนวนที่วิเคราะห์แล้ว */
  numberOfExaminations?: number | null;
}

const LabResultSummaryCard: React.FC<LabResultSummaryCardProps> = ({
  numberOfSamples,
  numberOfBookings,
  numberOfExaminations,
}) => {
  const samples = numberOfSamples ?? 0;
  const bookings = numberOfBookings ?? 0;
  const examined = numberOfExaminations ?? 0;
  const pending = Math.max(bookings - examined, 0);
  const progress = bookings > 0 ? Math.round((examined / bookings) * 100) : 0;

  return (
    <div className="row">
      <GenCard1
        color="bg-secondary"
        icon="fas fa-vial"
        num={samples}
        name="ตัวอย่างทั้งหมด"
        desc="ตัวอย่างของวันบริการนี้"
      />
      <GenCard1
        color="bg-primary"
        icon="fas fa-clipboard-list"
        num={bookings}
        name="จองวิเคราะห์"
        desc="รายการที่จองวิเคราะห์"
      />
      <GenCard1
        color="bg-success"
        icon="fas fa-flask"
        num={examined}
        name="วิเคราะห์แล้ว"
        desc={`${examined}/${bookings} = ${progress}%`}
      />
      <GenCard1
        color="bg-warning"
        icon="fas fa-hourglass-half"
        num={pending}
        name="รอวิเคราะห์"
        desc="ค้างวิเคราะห์"
      />
    </div>
  );
};

export default LabResultSummaryCard;
