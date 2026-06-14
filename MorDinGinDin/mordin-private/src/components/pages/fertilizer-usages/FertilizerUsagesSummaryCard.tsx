import { useEffect, useState } from 'react';

import { GenCard1 } from '@/components/gui/GuiButton';
import { getFertilizerSummary } from '@/services/api/fertilizer/FertilizerMajorApi';
import { FertilizerSummary } from '@/types/fertilizer/FertilizerMajor';

const FertilizerUsagesSummaryCard = () => {
  const [summary, setSummary] = useState<FertilizerSummary>({
    majorCount: 0,
    majorAvgPricePerSack: 0,
    minorCount: 0,
    minorAvgPricePerKg: 0,
  });

  useEffect(() => {
    getFertilizerSummary().then(setSummary).catch(console.error);
  }, []);
  return (
    <div className="row">
      <GenCard1
        color="bg-primary"
        icon="fas fa-tags"
        num={summary.majorCount}
        name="ชนิด (ปุ๋ยหลัก)"
        desc="จำนวนชนิดปุ๋ยหลัก"
      />
      <GenCard1
        color="bg-info"
        icon="fas fa-money-bill-alt"
        num={summary.majorAvgPricePerSack} //2 decimal places values
        name="บาทต่อกระสอบ"
        desc="ราคาปุ๋ยหลักเฉลี่ย"
      />
      <GenCard1
        color="bg-primary"
        icon="fas fa-tags"
        num={summary.minorCount}
        name="ชนิด (ธาตุอาหารรอง)"
        desc="จำนวนชนิดธาตุอาหารรอง"
      />
      <GenCard1
        color="bg-info"
        icon="fas fa-money-bill-alt"
        num={summary.minorAvgPricePerKg} //2 decimal places values
        name="เครื่อง-2"
        desc="ราคาธาตุอาหารรองเฉลีย"
      />
    </div>
  );
};

export default FertilizerUsagesSummaryCard;
