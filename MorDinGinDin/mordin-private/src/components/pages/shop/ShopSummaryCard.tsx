import { useEffect, useState } from 'react';

import { GenCard1 } from '@/components/gui/GuiButton';
import { getShopSummary } from '@/services/api/ShopApi';
import { cardData } from '@/types/common/SummaryCard';
import { ShopSummary } from '@/types/Shop';

function ShopSummaryCard() {
  const [cardData, setCardData] = useState<cardData[]>([]);

  const fetchSummary = async () => {
    const response: ShopSummary = await getShopSummary();

    setCardData([
      {
        color: 'bg-secondary',
        icon: 'fas fa-store',
        num: response.totalShops,
        name: 'Shops',
        desc: 'All shops in the system',
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

export default ShopSummaryCard;
