import { useEffect, useState } from 'react';

import { GenCard1 } from '@/components/gui/GuiButton';
import { getLandSummary } from '@/services/api/LandApi';
import { cardData } from '@/types/common/SummaryCard';
import { LandSummary } from '@/types/Land';

export default function LandCard() {
  const [cardData, setCardData] = useState<cardData[]>([]);

  const fetchSummary = async () => {
    const response: LandSummary = await getLandSummary();

    setCardData([
      {
        color: 'bg-secondary',
        icon: 'fas fa-map-marked',
        num: response.totalLands,
        name: 'แปลง',
        desc: 'จำนวนแปลงทั้งหมด',
      },
      {
        color: 'bg-danger',
        icon: 'fas fa-map-marked',
        num: response.needsImprovementCount,
        name: 'ดินต้องปรับปรุง',
        desc: `ดินต้องปรับปรุง ${response.needsImprovementCount}/${response.totalLands} = ${response.totalLands ? Math.round((response.needsImprovementCount / response.totalLands) * 100) : 0}%`,
      },
      {
        color: 'bg-primary',
        icon: 'fas fa-map-marked',
        num: response.normalSoilCount,
        name: 'ดินปกติ',
        desc: `ดินปกติ ${response.normalSoilCount}/${response.totalLands} = ${response.totalLands ? Math.round((response.normalSoilCount / response.totalLands) * 100) : 0}%`,
      },
      {
        color: 'bg-success',
        icon: 'fas fa-map-marked',
        num: response.fertileSoilCount,
        name: 'ดินสมบูรณ์',
        desc: `ดินสมบูรณ์ ${response.fertileSoilCount}/${response.totalLands} = ${response.totalLands ? Math.round((response.fertileSoilCount / response.totalLands) * 100) : 0}%`,
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
