import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAllLaboratories } from '@/services/api/laboratory/LaboratoryApi';
import { getCalendarById } from '@/services/api/ServiceCalendarApi';
import { Laboratory } from '@/types/Laboratory';
import { CalendarInfoInterface } from '@/types/ServiceCalendar';

export const ParameterSettingComponent: React.FC<{
  onNext: (params: { [key: string]: boolean }) => void;
  serviceCalendarId: number;
}> = ({ onNext, serviceCalendarId }) => {
  const [selectedParams, setSelectedParams] = useState<{
    [key: string]: boolean;
  }>({});
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [serviceCalendar, setServiceCalendar] =
    useState<CalendarInfoInterface>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const labs = await getAllLaboratories();
        setLaboratories(labs);
        const initialParams = labs.reduce(
          (acc: { [key: string]: boolean }, lab: Laboratory) => ({
            ...acc,
            [lab.shortNameBefore]: lab.isMain || false,
          }),
          {}
        );
        setSelectedParams(initialParams);
        localStorage.setItem('selectedParams', JSON.stringify(initialParams));

        const calendar = await getCalendarById(serviceCalendarId);
        setServiceCalendar(calendar);
      } catch (error) {
        console.error('Error fetching laboratories:', error);
      }
    };
    fetchData();
  }, [serviceCalendarId]);

  const handleCheckboxChange = (labId: number) => {
    const lab = laboratories.find(l => l.laboratoryId === labId);
    if (lab) {
      setSelectedParams(prev => {
        const newState = {
          ...prev,
          [lab.shortNameBefore]: !prev[lab.shortNameBefore],
        };
        localStorage.setItem('selectedParams', JSON.stringify(newState));
        return newState;
      });
    }
  };

  return (
    <div className="row">
      <div className="col-md-12">
        {serviceCalendar && (
          <div className="row p-2">
            <h3>
              ผลการวิเคราะห์ รถ {serviceCalendar.bus.busName} วันที่วิเคราะห์{' '}
              {new Date().toLocaleDateString()}
            </h3>
            <h5>
              Upload file: input.csv (Upload time: {new Date().toLocaleString()}
              )
            </h5>
          </div>
        )}
      </div>
      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">
              Parameter setting{' '}
              <span className="text-gray">(เลือกอย่างน้อย 1 parameter)</span>
            </h4>
          </div>
          <div className="card-body">
            <div className="col-md-8 ms-auto me-auto">
              <div className="row">
                {laboratories.map(lab => (
                  <div className="col-md-12 col-lg-12" key={lab.laboratoryId}>
                    <div className="form-group">
                      <input
                        type="checkbox"
                        id={`lab-${lab.laboratoryId}`}
                        checked={!!selectedParams[lab.shortNameBefore]}
                        onChange={() => handleCheckboxChange(lab.laboratoryId)}
                      />
                      <label className="mx-2">{lab.name}</label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-action">
                <div className="row row-demo-grid">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: '120px' }}
                    onClick={() => onNext(selectedParams)}
                  >
                    ต่อไป
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger ms-auto"
                    style={{ width: '120px' }}
                    onClick={() => navigate('/officer/lab-result')}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
