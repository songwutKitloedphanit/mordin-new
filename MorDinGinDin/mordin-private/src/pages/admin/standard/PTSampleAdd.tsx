import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { LaboratoryInfoInterface } from '../../../types/Laboratory';

import PTSampleAddForm from '@/components/pages/pt-sample/PTSampleAddForm';
import PTSampleSelectLab from '@/components/pages/pt-sample/PTSampleSelectLab';

const PTSampleAdd: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLabs, setSelectedLabs] = useState<
    LaboratoryInfoInterface[] | null
  >(null);

  useEffect(() => {
    //console.log('[Page] selectedLabs state updated:', selectedLabs);
  }, [selectedLabs]);

  const handleConfirm = (labs: LaboratoryInfoInterface[]) => {
    //console.log('[Page] handleConfirm got labs:', labs);
    setSelectedLabs(labs);
  };
  const handleSuccess = () => {
    //console.log('[Page] handleSuccess — navigating away');
    navigate('/admin/standard');
  };
  const handleCancel = () => {
    //console.log('[Page] handleCancel — returning');
    navigate('/admin/standard');
  };

  return selectedLabs ? (
    <PTSampleAddForm
      selectedLabs={selectedLabs}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
    />
  ) : (
    <PTSampleSelectLab onConfirm={handleConfirm} onCancel={handleCancel} />
  );
};

export default PTSampleAdd;
