import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { GenFormText1, GenFormText2 } from '../../../components/gui/GuiForm';
import { getAllLaboratories } from '../../../services/api/laboratory/LaboratoryApi';
import { deletServiceCategory } from '../../../services/api/service-type/ServiceCategoriesApi';
import {
  updateServiceType,
  getServiceTypeById,
} from '../../../services/api/service-type/ServiceTypeApi';
import {
  ServiceTypeColor,
  ServiceTypeInfo,
  ServiceTypeInput,
} from '../../../types/service-type/ServiceTypes';

import ServiceTypeCard from '@/components/pages/service-type/ServiceTypeCard';
import { LaboratoryInfoInterface } from '@/types/Laboratory';
import { ServiceCategory } from '@/types/service-type/ServiceCategories';
import { ServiceLaboratory } from '@/types/service-type/ServiceLaboratories';

const toBoolean = (value: unknown) =>
  value === true || value === 1 || value === '1' || value === 'true';

const ServiceTypeEdit = () => {
  const { id } = useParams();
  const serviceTypeId = Number(id);
  const [laboratoryTest, setLaboratoryTest] = useState<
    LaboratoryInfoInterface[]
  >([]);
  const [serviceTypeInput, setServiceTypeInput] = useState<ServiceTypeInput>({
    name: '',
    price: 0,
    unitDetail: '',
    isDisplay: true,
    color: ServiceTypeColor.Success,
    serviceCategories: [],
    serviceLaboratories: [],
  });
  const [serviceTypeInfo, setServiceTypeInfo] = useState<ServiceTypeInfo>(
    {} as ServiceTypeInfo
  );
  const [deleteCategories, setDeleteCatagories] = useState<number[]>([]);

  useEffect(() => {
    const fetchServiceType = async () => {
      const lab = await getAllLaboratories();

      setLaboratoryTest(lab);

      const data = await getServiceTypeById(serviceTypeId);
      setServiceTypeInfo(data);
      const formattedExistingLabs = (data.serviceLaboratories || []).map(
        (lab: ServiceLaboratory) => ({
          serviceTypeId: serviceTypeId,
          laboratoryId: Number(lab.laboratoryId),
          isDisplay: toBoolean(lab.isDisplay), // ใช้ค่าจากเดิม หรือกำหนด default เป็น false
        })
      );

      if (formattedExistingLabs) {
        const newLabs = lab.filter(
          (lab: LaboratoryInfoInterface) =>
            !formattedExistingLabs.some(
              (existing: ServiceLaboratory) =>
                Number(existing.laboratoryId) === Number(lab.laboratoryId)
            )
        );
        console.log(newLabs);

        const newServiceLabs = newLabs.map(
          (newlab: LaboratoryInfoInterface) => ({
            serviceTypeId: serviceTypeId,
            laboratoryId: newlab.laboratoryId,
            isDisplay: false,
          })
        );

        const updatedServiceLaboratories = [
          ...formattedExistingLabs,
          ...newServiceLabs,
        ];

        console.log('updatedServiceLaboratories', updatedServiceLaboratories);

        setServiceTypeInput({
          name: data.name,
          price: data.price ?? 0,
          unitDetail: data.unitDetail,
          isDisplay: data.isDisplay,
          color: data.color,
          serviceCategories: data.serviceCategories.map(
            (cat: ServiceCategory) => ({
              serviceCategoryId: cat.serviceCategoryId,
              name: cat.name,
              serviceTypeId: cat.serviceTypeId,
              isDisplay: cat.isDisplay,
            })
          ),
          serviceLaboratories: updatedServiceLaboratories,
        });
      }
    };

    fetchServiceType();
  }, [serviceTypeId]);

  console.log(serviceTypeInput);

  const [assessError, setAssessError] = useState('');

  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState<null | {
    type: 'delete' | 'cancel';
    itemId?: number | null;
    index?: number;
  }>(null);

  const handleChange =
    (field: keyof ServiceTypeInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      if (field === 'price') {
        // อนุญาตเฉพาะตัวเลขและจุดทศนิยม
        if (/^\d*\.?\d*$/.test(inputValue)) {
          setServiceTypeInput(prev => ({
            ...prev,
            [field]: inputValue === '' ? 0 : Number(inputValue),
          }));
        }
      } else {
        setServiceTypeInput(prev => ({ ...prev, [field]: inputValue.trim() }));
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
    setServiceTypeInput(prev => ({
      ...prev,
      serviceCategories: [
        ...prev.serviceCategories,
        { name: '', isDisplay: true },
      ],
    }));
  };

  const handleRemoveAssessment = (index: number) => {
    const removedItem = serviceTypeInput.serviceCategories[index];

    // ถ้ามี id (หมายถึงข้อมูลนี้มาจาก backend) ให้เก็บไว้สำหรับลบทีหลัง
    if (removedItem.serviceCategoryId) {
      setDeleteCatagories(prev => [
        ...prev,
        removedItem.serviceCategoryId as number,
      ]);
    }

    // ลบออกจาก UI
    const updated = [...serviceTypeInput.serviceCategories];
    updated.splice(index, 1);
    setServiceTypeInput(prev => ({
      ...prev,
      serviceCategories: updated,
    }));
  };

  console.log(deleteCategories);

  const handleUpdateAssessment = (index: number, value: string) => {
    const updated = [...serviceTypeInput.serviceCategories];
    updated[index].name = value;
    setServiceTypeInput(prev => ({
      ...prev,
      serviceCategories: updated,
    }));
  };

  const handleToggleAssessmentVisible = (index: number) => {
    setServiceTypeInput(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.map((cat, i) =>
        i === index ? { ...cat, isDisplay: !cat.isDisplay } : cat
      ),
    }));
  };

  const handleSetTestVisible = (id: number, checked: boolean) => {
    const laboratoryId = Number(id);
    setServiceTypeInput(prev => ({
      ...prev,
      serviceLaboratories: prev.serviceLaboratories.map(lab =>
        Number(lab.laboratoryId) === laboratoryId
          ? { ...lab, laboratoryId, isDisplay: checked }
          : lab
      ),
    }));
  };

  const handleSubmit = async () => {
    // let hasError = false;

    const newErrors: typeof errors = {};

    if (!serviceTypeInput.name)
      newErrors.name = 'กรุณาระบุชื่อประเภทการให้บริการ';
    if (!serviceTypeInput.price && serviceTypeInput.price != 0)
      newErrors.price = 'กรุณาระบุราคา';
    if (!serviceTypeInput.unitDetail) newErrors.unitDetail = 'กรุณาระบุหน่วย';
    if (serviceTypeInput.serviceCategories.length === 0)
      setAssessError('กรุณาระบุประเภทการประเมินอย่างน้อย 1 รายการ');

    setErrors(newErrors);
    if (
      Object.keys(newErrors).length > 0 ||
      serviceTypeInput.serviceCategories.length === 0
    )
      return;

    serviceTypeInput.price = Number(serviceTypeInput.price);
    console.log('serviceTypeInput', serviceTypeInput);

    try {
      await Promise.all(
        deleteCategories.map(delId => deletServiceCategory(delId))
      );
      const res = await updateServiceType(serviceTypeId, serviceTypeInput);
      console.log(res);

      Swal.fire({
        title: 'สำเร็จ!',
        text: 'แก้ไขข้อมูลการให้บริการสำเร็จ',
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
        text: 'แก้ไขข้อมูลการให้บริการล้มเหลว กรุณาตรวจสอบ',
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
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div className="col-md-8 col-sm-8 col-8 text-start">
                  <h4 className="private-card-title">
                    แก้ไขข้อมูลการให้บริการ ({serviceTypeInfo?.name})
                  </h4>
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

            <div className="private-card-body">
              <div className="col-md-8 ms-auto me-auto">
                <div className="row mb-3">
                  <div className="col-md-12 px-1">
                    <GenFormText1
                      isRequired
                      id="name"
                      name="name"
                      label="ประเภทการให้บริการ"
                      placeholder="ระบุประเภทการให้บริการ"
                      value={serviceTypeInput.name}
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
                        serviceTypeInput.price != null
                          ? serviceTypeInput.price.toString()
                          : ''
                      }
                      onChange={handleChange('price')}
                      errorMessage={errors.price}
                      desc="ไม่มีค่าใช้จ่ายกรอก 'ฟรี'"
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
                      value={serviceTypeInput.unitDetail}
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
                  {serviceTypeInput.serviceCategories?.map((item, index) => (
                    <div
                      className="input-group mt-2 mb-3"
                      key={item.serviceCategoryId}
                    >
                      <input
                        className="form-control"
                        type="text"
                        value={item.name}
                        onChange={e => {
                          setServiceTypeInput(prev => ({
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
                            setShowConfirm({
                              type: 'delete',
                              itemId: item.serviceCategoryId ?? null, // ใช้ id จริง ถ้ามี
                              index, // ใช้ index สำหรับลบจาก UI
                            })
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

                {serviceTypeInput.serviceLaboratories?.map(lab => {
                  const labInfo = laboratoryTest.find(
                    item => item.laboratoryId === lab.laboratoryId
                  );

                  return (
                    <div key={lab.laboratoryId} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`test-${lab.laboratoryId}`}
                        checked={toBoolean(lab.isDisplay)}
                        onChange={e =>
                          handleSetTestVisible(
                            lab.laboratoryId,
                            e.currentTarget.checked
                          )
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`test-${lab.laboratoryId}`}
                        style={{ cursor: 'pointer' }}
                      >
                        {labInfo?.name ?? 'ไม่พบชื่อแลป'}
                      </label>
                    </div>
                  );
                })}

                <div className="private-action-footer d-flex justify-content-between mt-4">
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{ width: '150px' }}
                    onClick={handleSubmit}
                  >
                    แก้ไขบริการ
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
          <div
            className={`private-pricing-card private-pricing-card-${serviceTypeInput.color}`}
          >
            <div className="pricing-header position-relative">
              <h3 className="fw-bold mb-3 d-flex align-items-center">
                <span style={{ flex: 1 }}>
                  {serviceTypeInput.name ? (
                    <span>
                      {serviceTypeInput.name}
                      <i
                        role="button"
                        className={`fas ms-2 ${
                          serviceTypeInput.isDisplay
                            ? 'fa-eye text-mute'
                            : 'fa-eye-slash text-white'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          setServiceTypeInput(prev => ({
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
                              setServiceTypeInput(prev => ({
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
                  {(serviceTypeInput.serviceCategories ?? []).length > 0
                    ? serviceTypeInput.serviceCategories.map((cat, index) => (
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
                              setServiceTypeInput(prev => ({
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
                          {index < serviceTypeInput.serviceCategories.length - 1
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
                  {serviceTypeInput.price === 0
                    ? 'ฟรี'
                    : (serviceTypeInput.price ?? '-')}
                </span>
                <span className="month">
                  {serviceTypeInput.unitDetail || '-'}
                </span>
              </div>
            </div>
            <ul className="pricing-content">
              {serviceTypeInput.serviceLaboratories?.map(t => {
                const labInfo = laboratoryTest.find(
                  item => item.laboratoryId === t.laboratoryId
                );

                return (
                  <li
                    key={t.laboratoryId}
                    className={toBoolean(t.isDisplay) ? '' : 'disable'}
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
              : 'คุณต้องการยกเลิกการแก้ไขหรือไม่?'
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

export default ServiceTypeEdit;
