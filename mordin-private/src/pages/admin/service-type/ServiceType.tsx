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
      <ServiceTypeCard />

      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between py-3">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-layer-group me-2 text-primary"></i>
                ประเภทการให้บริการ
              </h4>
              <GenButtonCircle
                color={B_LIST.add.color}
                icon={B_LIST.add.icon}
                link="/admin/service-type/add"
              />
            </div>
            <div className="private-card-body">
              <div className="row g-3">
                {serviceTypeData.map(t => (
                  <div
                    key={t.serviceTypeId}
                    className="col-xl-3 col-lg-4 col-md-6"
                  >
                    <div className={`private-pricing-card private-pricing-card-${t.color}`}>
                      <div className="pricing-header">
                        <div className="d-flex align-items-start justify-content-between mb-2">
                          <h3 className="fw-bold mb-0">{t.name}</h3>
                          <span
                            className={`badge ms-2 mt-1 flex-shrink-0 ${t.isDisplay ? 'bg-success' : 'bg-secondary'}`}
                          >
                            <i
                              className={`fas ${t.isDisplay ? 'fa-eye' : 'fa-eye-slash'} me-1`}
                            ></i>
                            {t.isDisplay ? 'แสดง' : 'ซ่อน'}
                          </span>
                        </div>
                        <div className="sub-title">
                          {(t.serviceCategories ?? []).map(a => (
                            <span
                              key={a.serviceCategoryId}
                              className={`badge me-1 mb-1 border ${a.isDisplay ? 'bg-light text-dark' : 'bg-light text-muted'}`}
                            >
                              <i
                                className={`fas ${a.isDisplay ? 'fa-eye' : 'fa-eye-slash'} me-1`}
                              ></i>
                              {a.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="price-value">
                        <div className="value">
                          <span className="amount">
                            {t.price === 0 ? 'ฟรี' : (t.price ?? '-')}
                          </span>
                          <span className="month">
                            {String(t.price).includes('/')
                              ? t.price
                              : t.unitDetail}
                          </span>
                        </div>
                      </div>
                      <ul className="pricing-content">
                        {laboratoryTest.map((lab: Laboratory) => {
                          const found = t.serviceLaboratories.find(
                            item =>
                              item.laboratoryId === lab.laboratoryId &&
                              item.isDisplay
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
                          navigate(
                            `/admin/service-type/${t.serviceTypeId}/edit`
                          )
                        }
                        className="btn btn-success btn-border btn-lg w-75 fw-bold mb-3"
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="fas fa-edit me-2"></i>
                        แก้ไขข้อมูล
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceType;

