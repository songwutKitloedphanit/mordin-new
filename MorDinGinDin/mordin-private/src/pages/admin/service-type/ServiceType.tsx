import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { getAllLaboratories } from '../../../services/api/laboratory/LaboratoryApi';
import { getAllServiceTypes } from '../../../services/api/service-type/ServiceTypeApi';

import ServiceTypeCard from '@/components/pages/service-type/ServiceTypeCard';
import { Laboratory } from '@/types/Laboratory';
import { ServiceTypeInfo } from '@/types/service-type/ServiceTypes';

const ServiceType = () => {
  const [serviceTypeData, setServiceTypeData] = useState<ServiceTypeInfo[]>([]);
  const [laboratoryTest, setLaboratoryTest] = useState<Laboratory[]>([]);
  const navigate = useNavigate();

  // Mock API
  useEffect(() => {
    const fetchServiceType = async () => {
      const data = await getAllServiceTypes();
      setServiceTypeData(data);

      const lab = await getAllLaboratories();
      setLaboratoryTest(lab);
    };
    fetchServiceType();
  }, []);

  return (
    <>
      <div className="row">
        <ServiceTypeCard />
      </div>

      <div className="row">
        <h3 className="fw-bold mb-3">
          ประเภทการให้บริการ
          <span>
            <GenButtonCircle
              color={B_LIST.add.color}
              icon={B_LIST.add.icon}
              link="/admin/service-type/add"
              className="ms-2"
            />
          </span>
        </h3>

        <div className="row justify-content-center align-items-center mb-5">
          {serviceTypeData.map(t => (
            <div key={t.serviceTypeId} className="col-md-3 ps-md-0">
              <div className={`card-pricing2 card-${t.color} mb-3`}>
                <div className="pricing-header">
                  <h3 className="fw-bold mb-3">
                    {t.name}{' '}
                    <i
                      className={`fas ${t.isDisplay ? 'fa-eye' : 'fa-eye-slash'}`}
                    ></i>
                  </h3>
                  <span className="sub-title">
                    {(t.serviceCategories ?? []).map((a, idx) => (
                      <span key={a.serviceCategoryId}>
                        {a.name}{' '}
                        <i
                          className={`fas ${
                            a.isDisplay ? 'fa-eye' : 'fa-eye-slash'
                          }`}
                        ></i>
                        {idx < t.serviceCategories.length - 1 && ' / '}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="price-value">
                  <div className="value">
                    <span className="amount">
                      {t.price === 0 ? 'ฟรี' : (t.price ?? '-')}
                    </span>
                    <span className="month">
                      {String(t.price).includes('/') ? t.price : t.unitDetail}
                    </span>
                  </div>
                </div>
                <ul className="pricing-content">
                  {laboratoryTest.map((lab: Laboratory) => {
                    const found = t.serviceLaboratories.find(
                      item =>
                        item.laboratoryId === lab.laboratoryId && item.isDisplay
                    );

                    return (
                      <li
                        key={lab.laboratoryId}
                        className={found ? '' : 'disable'}
                      >
                        {lab.name}
                      </li>
                    );
                  })}
                </ul>
                <a
                  onClick={() =>
                    navigate(`/admin/service-type/${t.serviceTypeId}/edit`)
                  }
                  className="btn btn-success btn-border btn-lg w-75 fw-bold mb-3"
                >
                  แก้ไขข้อมูล
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ServiceType;
