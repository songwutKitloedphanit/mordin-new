import { useEffect, useState } from 'react';

import { GenCard1 } from '@/components/gui/GuiButton';
import { getFarmerSummary } from '@/services/api/FarmerApi';
import { cardData } from '@/types/common/SummaryCard';
import { FarmerSummary } from '@/types/Farmer';

function FarmerCard() {
  const [cardData, setCardData] = useState<cardData[]>([]);

  const fetchSummary = async () => {
    const response: FarmerSummary = await getFarmerSummary();

    setCardData([
      {
        color: 'bg-secondary',
        icon: 'fa fa-users',
        num: response.totalFarmers,
        name: 'เกษตรกร (คน)',
        desc: 'จำนวนเกษตรกรทั้งหมด',
      },
      {
        color: 'bg-success',
        icon: 'fas fa-map-marked',
        num: response.totalLands,
        name: 'แปลง',
        desc: 'จำนวนแปลงทั้งหมด',
      },
      {
        color: 'bg-primary',
        icon: 'fas fa-map-marked',
        num: response.totalSpaces,
        name: 'ไร่',
        desc: 'พื้นที่ทั้งหมด',
      },
    ]);
  };

  useEffect(() => {
    fetchSummary();
  }, []);
  return (
    <div className="row">
      {cardData.map(card => (
        <GenCard1
          key={`card-${card.name}`}
          color={card.color}
          icon={card.icon}
          num={card.num}
          name={card.name}
          desc={card.desc}
        />
      ))}
    </div>
  );
}

export default FarmerCard;
