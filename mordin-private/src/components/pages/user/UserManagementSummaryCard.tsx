import { useEffect, useState } from 'react';

import { GenCard1 } from '@/components/gui/GuiButton';
import { GenCard1Skeleton } from '@/components/gui/Skeleton';
import { getUserSummary } from '@/services/api/UserApi';
import { cardData } from '@/types/common/SummaryCard';
import { UserSummary } from '@/types/User';

const UserManagementSummaryCard = () => {
  const [cardData, setCardData] = useState<cardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const response: UserSummary = await getUserSummary();
      setCardData([
        {
          color: 'bg-secondary',
          icon: 'fa fa-users',
          num: response.totalUsers,
          name: 'Users',
          desc: `All users in the system: ${response.totalUsers}`,
        },
        {
          color: 'bg-primary',
          icon: 'fa fa-users',
          num: response.adminAmount,
          name: 'Admins',
          desc: `Admin ${response.adminAmount}/${response.totalUsers} = ${response.totalUsers ? Math.round((response.adminAmount / response.totalUsers) * 100) : 0}%`,
        },
        {
          color: 'bg-info',
          icon: 'fa fa-users',
          num: response.staffAmount,
          name: 'Staff',
          desc: `Staff ${response.staffAmount}/${response.totalUsers} = ${response.totalUsers ? Math.round((response.staffAmount / response.totalUsers) * 100) : 0}%`,
        },
        {
          color: 'bg-success',
          icon: 'fa fa-users',
          num: response.executiveAmount,
          name: 'Executive',
          desc: `Executive ${response.executiveAmount}/${response.totalUsers} = ${response.totalUsers ? Math.round((response.executiveAmount / response.totalUsers) * 100) : 0}%`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="row">
        {[1, 2, 3, 4].map(i => (
          <GenCard1Skeleton key={i} />
        ))}
      </div>
    );
  }

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
};

export default UserManagementSummaryCard;
