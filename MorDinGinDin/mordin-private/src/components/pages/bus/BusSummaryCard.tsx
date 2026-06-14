import { useEffect, useState } from 'react';

import { GenCard1 } from '@/components/gui/GuiButton';
import { getBusSummary } from '@/services/api/BusApi';
import { BusSummary } from '@/types/Bus';
import { cardData } from '@/types/common/SummaryCard';

function BusSummaryCard() {
  const [cardData, setCardData] = useState<cardData[]>([]);

  const fetchSummary = async () => {
    const response: BusSummary = await getBusSummary();

    setCardData([
      {
        color: 'bg-secondary',
        icon: 'fas fa-bus-alt',
        num: response.totalBuses,
        name: 'รถให้บริการ (คัน)',
        desc: 'จำนวนรถให้บริการทั้งหมด',
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

export default BusSummaryCard;
