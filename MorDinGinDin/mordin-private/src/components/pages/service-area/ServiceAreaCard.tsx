import { useEffect, useState } from 'react';

import { GenCard1 } from '@/components/gui/GuiButton';
import { getFactorySummary } from '@/services/api/service-area/FactoryApi';
import { cardData } from '@/types/common/SummaryCard';
import { FactorySummary } from '@/types/service-area/Factories';

export default function ServiceAreaCard() {
  const [cardData, setCardData] = useState<cardData[]>([]);

  const fetchSummary = async () => {
    const response: FactorySummary = await getFactorySummary();

    setCardData([
      {
        color: 'bg-secondary',
        icon: 'fas fa-archway',
        num: response.totalFactories,
        name: 'โรงงาน',
        desc: 'จำนวนโรงงานทั้งหมด',
      },
      {
        color: 'bg-info',
        icon: 'fas fa-map-marker-alt',
        num: response.totalServiceAres,
        name: 'เขตส่งเสริม',
        desc: 'จำนวนเขตส่งเสริมทั้งหมด',
      },
    ]);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <>
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
    </>
  );
}
