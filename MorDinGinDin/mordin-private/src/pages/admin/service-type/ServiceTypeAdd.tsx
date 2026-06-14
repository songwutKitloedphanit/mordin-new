import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { GenFormText1, GenFormText2 } from '../../../components/gui/GuiForm';
import { getAllLaboratories } from '../../../services/api/laboratory/LaboratoryApi';
import { createServiceType } from '../../../services/api/service-type/ServiceTypeApi';
import { LaboratoryInfoInterface } from '../../../types/Laboratory';
import { ServiceLaboratoryInput } from '../../../types/service-type/ServiceLaboratories';
import {
  ServiceTypeColor,
  ServiceTypeInput,
} from '../../../types/service-type/ServiceTypes';

import ServiceTypeCard from '@/components/pages/service-type/ServiceTypeCard';

const ServiceTypeAdd = () => {
  const [laboratoryTest, setLaboratoryTest] = useState<
    LaboratoryInfoInterface[]
  >([]);
  const [serviceType, setServiceType] = useState<ServiceTypeInput>(
    {} as ServiceTypeInput
  );

  useEffect(() => {
    const fetchLaboratory = async () => {
      const data = await getAllLaboratories();
      setLaboratoryTest(data);

      const mappedData: ServiceLaboratoryInput[] = data.map(
        (lab: LaboratoryInfoInterface) => ({
          laboratoryId: lab.laboratoryId,
          name: lab.name,
          isDisplay: false,
        })
      );
      setServiceType(prev => ({
        ...prev,
        isDisplay: true,
        color: ServiceTypeColor.Success,
        serviceLaboratories: mappedData,
      }));
    };

    fetchLaboratory();
  }, []);

  console.log(serviceType);

  const [assessError, setAssessError] = useState('');

  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState<null | {
    type: 'delete' | 'cancel';
    index?: number;
  }>(null);

  const handleChange =
    (field: keyof ServiceTypeInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      if (field === 'price') {
        // อนุญาตเฉพาะตัวเลขและจุดทศนิยม
        if (/^\d*\.?\d*$/.test(inputValue)) {
          setServiceType(prev => ({
            ...prev,
            [field]: Number(inputValue), // เก็บเป็น string ไปก่อน
          }));
        }
      } else {
        setServiceType(prev => ({ ...prev, [field]: inputValue }));
      }

      setErrors(prev => ({ ...prev, [field]: '' }));
    };

  const [errors, setErrors] = useState<{
    name?: string;
    category?: string;
    price?: string;
    unitDetail?: string;
  }>({});

  const handleAddAssessment = () => {
    setServiceType(prev => ({
      ...prev,
      serviceCategories: [
        ...(prev.serviceCategories || []),
        { name: '', isDisplay: true },
      ],
    }));
  };

  const handleRemoveAssessment = (index: number) => {
    const updated = [...serviceType.serviceCategories];
    updated.splice(index, 1);
    setServiceType(prev => ({
      ...prev,
      serviceCategories: updated,
    }));
  };

  const handleUpdateAssessment = (index: number, value: string) => {
    const updated = [...serviceType.serviceCategories];
    updated[index].name = value;
    setServiceType(prev => ({
      ...prev,
      serviceCategories: updated,
    }));
  };

  const handleToggleAssessmentVisible = (index: number) => {
    setServiceType(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.map((cat, i) =>
        i === index ? { ...cat, isDisplay: !cat.isDisplay } : cat
      ),
    }));
  };

  const handleToggleTest = (id: number) => {
    setServiceType(prev => ({
      ...prev,
      serviceLaboratories: prev.serviceLaboratories.map(lab =>
        lab.laboratoryId === id ? { ...lab, isDisplay: !lab.isDisplay } : lab
      ),
    }));
  };

  const handleSubmit = async () => {
    // let hasError = false;

    const newErrors: typeof errors = {};

    if (!serviceType.name) newErrors.name = 'กรุณาระบุชื่อประเภทการให้บริการ';
    if (!serviceType.price && serviceType.price != 0)
      newErrors.price = 'กรุณาระบุราคา';
    if (!serviceType.unitDetail) newErrors.unitDetail = 'กรุณาระบุหน่วย';
    if ((serviceType.serviceCategories || []).length === 0)
      setAssessError('กรุณาระบุประเภทการประเมินอย่างน้อย 1 รายการ');

    setErrors(newErrors);
    if (
      Object.keys(newErrors).length > 0 ||
      serviceType.serviceCategories.length === 0
    )
      return;

    console.log('submitted', serviceType);

    try {
      const res = await createServiceType(serviceType);
      console.log(res);

      Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มข้อมูลการให้บริการสำเร็จ',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate('/admin/service-type');
      });
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'เพิ่มข้อมูลการให้บริการล้มเหลว กรุณาตรวจสอบ',
        icon: 'error',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
    }
  };

  return (
    <>
      <div className="row">
        <ServiceTypeCard />
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div className="col-md-8 col-sm-8 col-8 text-start">
                  <h4 className="card-title">เพิ่มประเภทการให้บริการ</h4>
                </div>
                <div className="col-md-4 col-sm-4 col-4 text-end">
                  <GenButtonCircle
                    color={B_LIST.list.color}
                    icon={B_LIST.list.icon}
                    link="/admin/service-type"
                  />
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="col-md-8 ms-auto me-auto">
                <div className="row mb-3">
                  <div className="col-md-12 px-1">
                    <GenFormText1
                      isRequired
                      id="name"
                      name="name"
                      label="ประเภทการให้บริการ"
                      placeholder="ระบุประเภทการให้บริการ"
                      value={serviceType.name}
                      onChange={handleChange('name')}
                      errorMessage={errors.name}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-12 px-1">
                    <GenFormText2
                      isRequired
                      id="price"
                      name="price"
                      label="ราคา"
                      placeholder="ระบุราคา"
                      value={
                        serviceType.price != null
                          ? serviceType.price.toString()
                          : ''
                      }
                      onChange={handleChange('price')}
                      errorMessage={errors.price}
                      desc="ไม่มีค่าใช้จ่ายกรอก '0'"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12 px-1">
                    <GenFormText2
                      isRequired
                      id="unitDetail"
                      name="unitDetail"
                      label="หน่วย"
                      placeholder="ระบุหน่วยราคา"
                      value={serviceType.unitDetail}
                      onChange={handleChange('unitDetail')}
                      errorMessage={errors.unitDetail}
                      desc="บาท/ปี บาท/เดือน ฯลฯ"
                    />
                  </div>
                </div>

                <hr />

                <div className="mb-3">
                  <label>
                    ประเภทการประเมิน
                    <GenButtonCircle
                      color={B_LIST.add.color}
                      icon={B_LIST.add.icon}
                      onClick={handleAddAssessment}
                      className="ms-2 btn-sm"
                    />
                  </label>
                  {serviceType.serviceCategories?.map((item, index) => (
                    <div
                      className="input-group mt-2 mb-3"
                      key={item.serviceCategoryId}
                    >
                      <input
                        className="form-control"
                        type="text"
                        value={item.name}
                        onChange={e => {
                          setServiceType(prev => ({
                            ...prev,
                            serviceCategories: prev.serviceCategories.map(
                              (cat, i) =>
                                i === index
                                  ? { ...cat, name: e.target.value }
                                  : cat
                            ),
                          }));
                          handleUpdateAssessment(index, e.target.value);
                          setAssessError('');
                        }}
                        placeholder="ระบุประเภทการประเมิน"
                      />
                      <div className="input-group-text">
                        <GenButtonCircle
                          icon={
                            item.isDisplay
                              ? B_LIST.eye.icon
                              : B_LIST.eyeClose.icon
                          }
                          color={
                            item.isDisplay
                              ? B_LIST.eye.color
                              : B_LIST.eyeClose.color
                          }
                          onClick={() => handleToggleAssessmentVisible(index)}
                        />
                        <GenButtonCircle
                          icon={B_LIST.del.icon}
                          color={B_LIST.del.color}
                          onClick={() =>
                            setShowConfirm({ type: 'delete', index })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {assessError && (
                  <div className="text-danger text-sm">{assessError}</div>
                )}
                <hr />

                {serviceType.serviceLaboratories?.map(lab => {
                  const labInfo = laboratoryTest.find(
                    item => item.laboratoryId === lab.laboratoryId
                  );

                  return (
                    <div key={lab.laboratoryId} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`test-${lab.laboratoryId}`}
                        onChange={() => handleToggleTest(lab.laboratoryId)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`test-${lab.laboratoryId}`}
                      >
                        {labInfo?.name ?? 'ไม่พบชื่อแลป'}
                      </label>
                    </div>
                  );
                })}

                <div className="card-action d-flex justify-content-between mt-4">
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{ width: '150px' }}
                    onClick={handleSubmit}
                  >
                    เพิ่มบริการ
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ width: '150px' }}
                    onClick={() => setShowConfirm({ type: 'cancel' })}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 ps-md-0">
          <div className={`card-pricing2 card-${serviceType.color}`}>
            <div className="pricing-header position-relative">
              <h3 className="fw-bold mb-3 d-flex align-items-center">
                <span style={{ flex: 1 }}>
                  {serviceType.name ? (
                    <span>
                      {serviceType.name}
                      <i
                        role="button"
                        className={`fas ms-2 ${
                          serviceType.isDisplay
                            ? 'fa-eye text-mute'
                            : 'fa-eye-slash text-white'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          setServiceType(prev => ({
                            ...prev,
                            isDisplay: !prev.isDisplay,
                          }))
                        }
                      ></i>
                    </span>
                  ) : (
                    '-'
                  )}
                </span>

                {/* ปุ่มวงกลมมุมขวาบน */}
                <div className="position-absolute top-0 end-0 p-2">
                  <div className="dropdown">
                    <button
                      className="btn btn-light rounded-circle p-1"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{ width: '28px', height: '28px' }}
                    >
                      {/* <i className={`fas fa-palette text-${serviceType.color}`}></i> */}
                      <i className={'fas fa-palette'}></i>
                    </button>
                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      style={{
                        width: 'auto',
                        minWidth: 'unset',
                        padding: '4px',
                      }} // ✅ กำหนดความกว้าง
                    >
                      {(
                        Object.entries(ServiceTypeColor) as [string, string][]
                      ).map(([key, value]) => (
                        <li key={key}>
                          <button
                            type="button"
                            className="dropdown-item d-flex justify-content-center"
                            onClick={() =>
                              setServiceType(prev => ({
                                ...prev,
                                color: value as ServiceTypeColor,
                              }))
                            }
                            style={{
                              padding: '6px',
                              width: '100%',
                            }}
                          >
                            <span
                              className={`bg-${value} rounded-circle d-inline-block`}
                              style={{ width: '16px', height: '16px' }}
                            ></span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </h3>

              <span className="sub-title">
                <span style={{ display: 'flex', flex: 1, flexWrap: 'wrap' }}>
                  {(serviceType.serviceCategories ?? []).length > 0
                    ? serviceType.serviceCategories.map((cat, index) => (
                        <span
                          key={cat.serviceCategoryId}
                          style={{ marginRight: 8 }}
                        >
                          {cat.name}
                          <i
                            role="button"
                            className={`fas ms-2 ${
                              cat.isDisplay
                                ? 'fa-eye text-white'
                                : 'fa-eye-slash text-white'
                            }`}
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              setServiceType(prev => ({
                                ...prev,
                                serviceCategories: prev.serviceCategories?.map(
                                  (c, i) =>
                                    i === index
                                      ? { ...c, isDisplay: !c.isDisplay }
                                      : c
                                ),
                              }))
                            }
                          ></i>
                          {index < serviceType.serviceCategories.length - 1
                            ? '/'
                            : ''}
                        </span>
                      ))
                    : '-'}
                </span>
              </span>
            </div>
            <div className="price-value">
              <div className="value">
                <span className="amount">
                  {serviceType.price === 0 ? 'ฟรี' : (serviceType.price ?? '-')}
                </span>
                <span className="month">{serviceType.unitDetail || '-'}</span>
              </div>
            </div>
            <ul className="pricing-content">
              {serviceType.serviceLaboratories?.map(t => {
                const labInfo = laboratoryTest.find(
                  item => item.laboratoryId === t.laboratoryId
                );

                return (
                  <li
                    key={t.laboratoryId}
                    className={t.isDisplay ? '' : 'disable'}
                  >
                    {labInfo ? labInfo.name : 'ไม่พบชื่อแล็บ'}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title={
            showConfirm.type === 'delete' ? 'ยืนยันการลบ' : 'ยืนยันการยกเลิก'
          }
          text={
            showConfirm.type === 'delete'
              ? 'คุณต้องการลบประเภทการประเมินนี้หรือไม่?'
              : 'คุณต้องการยกเลิกการเพิ่มประเภทการให้บริการหรือไม่?'
          }
          action={showConfirm.type}
          onConfirm={() => {
            if (
              showConfirm.type === 'delete' &&
              typeof showConfirm.index === 'number'
            ) {
              handleRemoveAssessment(showConfirm.index);
            } else if (showConfirm.type === 'cancel') {
              navigate(-1);
            }
            setShowConfirm(null);
          }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};

export default ServiceTypeAdd;
