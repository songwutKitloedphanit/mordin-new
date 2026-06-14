import { useEffect, useState } from 'react';

import { GenCard1 } from '@/components/gui/GuiButton';
import { getServiceTypeSummary } from '@/services/api/service-type/ServiceTypeApi';
import { ServiceTypeSummary } from '@/types/service-type/ServiceTypes';

export default function ServiceTypeCard() {
  const [summary, setSummary] = useState<ServiceTypeSummary>({
    totalServiceTypes: 0,
    totalServiceLaboratories: 0,
  });

  useEffect(() => {
    getServiceTypeSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div className="row">
      <GenCard1
        color="bg-secondary"
        icon="fab fa-servicestack"
        num={summary.totalServiceTypes}
        name="ประเภทการให้บริการ"
        desc="จำนวนการให้บริการทั้งหมด"
      />
      <GenCard1
        color="bg-secondary"
        icon="fab fa-servicestack"
        num={summary.totalServiceLaboratories}
        name="ประเภทการประเมิน"
        desc="จำนวนการประเมินทั้งหมด"
      />
    </div>
  );
}
