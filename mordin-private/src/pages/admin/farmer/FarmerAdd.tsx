import { ChangeEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { swalSuccessTimer, swalError } from '@/utils/swal';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import {
  GenFormDate1,
  GenFormSelect,
  GenFormText1,
  GenFormText2,
} from '@/components/gui/GuiForm';
import { createFarmer, getFarmerSummary } from '@/services/api/FarmerApi';
import { settingOwnerData } from '@/services/api/qr-code/BookApi';
import {
  getAllFactories,
  getFactoryById,
} from '@/services/api/service-area/FactoryApi';
import { getServiceAreaById } from '@/services/api/service-area/ServiceAreaApi';
import {
  FarmerCreateInput,
  FarmerFormState,
  FarmerSummary,
} from '@/types/Farmer';
import { FactoryInfoInterface } from '@/types/service-area/Factories';
import { ServiceAreaInterface } from '@/types/service-area/ServiceAreas';

const KPI_CONFIG = [
  {
    key: 'totalFarmers' as keyof FarmerSummary,
    label: 'เกษตรกรทั้งหมด',
    icon: 'fas fa-seedling',
    accent: '#3b9bd9',
    unit: 'คน',
  },
  {
    key: 'totalLands' as keyof FarmerSummary,
    label: 'จำนวนแปลง',
    icon: 'fas fa-map',
    accent: '#4caf7d',
    unit: 'แปลง',
  },
  {
    key: 'totalSpaces' as keyof FarmerSummary,
    label: 'พื้นที่ทั้งหมด',
    icon: 'fas fa-ruler-combined',
    accent: '#17a2b8',
    unit: 'ไร่',
  },
];

const FarmerAdd = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const state = locationState.state;

  const [summary, setSummary] = useState<FarmerSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [factoryList, setFactoryList] = useState<FactoryInfoInterface[]>([]);
  const [serviceAreaList, setServiceAreaList] = useState<
    ServiceAreaInterface[]
  >([]);
  const [inputCardId, setInputCardId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FarmerCreateInput>(
    {} as FarmerCreateInput
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof FarmerFormState, string>>
  >({});

  useEffect(() => {
    getFarmerSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const factoryData = await getAllFactories();
      setFactoryList(factoryData);

      const defaultFactoryId =
          factoryData.length > 0 ? factoryData[0].factoryId : null;

      if (state) {
        setFormData({
          thaiNationalId: state.thaiNationalId,
          thaiFarmerId: '',
          phone: state.phoneNumber,
          firstName: state.firstName,
          lastName: state.lastName,
          factoryId: defaultFactoryId,
          serviceAreaId: null,
          birthDate: '',
        });
        setInputCardId(formatIDCard(state.thaiNationalId || ''));

        if (state.serviceAreaId) {
          const servArea = await getServiceAreaById(state.serviceAreaId);
          setFormData(prev => ({
            ...prev,
            factoryId: servArea.factoryId,
            serviceAreaId: state.serviceAreaId,
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          factoryId: defaultFactoryId,
          birthDate: '',
        }));
      }
    };
    fetchData();
  }, [state]);

  useEffect(() => {
    const loadServiceAreas = async () => {
      if (formData.factoryId) {
        const factory = await getFactoryById(Number(formData.factoryId));
        setServiceAreaList(factory.serviceAreas);
        setFormData(prev => ({
          ...prev,
          serviceAreaId: factory.serviceAreas.some(
            (area: ServiceAreaInterface) =>
              area.serviceAreaId === prev.serviceAreaId
          )
            ? prev.serviceAreaId
            : (factory.serviceAreas[0]?.serviceAreaId ?? null),
        }));
      } else {
        setServiceAreaList([]);
        setFormData(prev => ({ ...prev, serviceAreaId: null }));
      }
    };
    loadServiceAreas();
  }, [formData.factoryId]);

  const formatIDCard = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 13);
    let formatted = limited;
    if (limited.length > 1)
      formatted = limited.slice(0, 1) + '-' + limited.slice(1);
    if (limited.length > 5)
      formatted = formatted.slice(0, 6) + '-' + formatted.slice(6);
    if (limited.length > 10)
      formatted = formatted.slice(0, 12) + '-' + formatted.slice(12);
    if (limited.length > 12)
      formatted = formatted.slice(0, 15) + '-' + formatted.slice(15);
    return formatted;
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    let formatted = limited;
    if (limited.length > 3)
      formatted = limited.slice(0, 3) + '-' + limited.slice(3);
    if (limited.length > 6)
      formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
    return formatted;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'cardId') {
      const formatted = formatIDCard(value);
      setInputCardId(formatted);
    } else if (name === 'name') {
      setFormData(prev => ({ ...prev, firstName: value }));
    } else if (name === 'factoryId' || name === 'serviceAreaId') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else if (name === 'lastname') {
      setFormData(prev => ({ ...prev, lastName: value }));
    } else if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, phone: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!inputCardId.trim())
      newErrors.cardId = 'กรุณาระบุหมายเลขบัตร';
    if (!formData.firstName?.trim()) newErrors.name = 'กรุณาระบุชื่อ';
    if (!formData.lastName?.trim()) newErrors.lastname = 'กรุณาระบุนามสกุล';
    if (!formData.phone?.trim()) newErrors.phone = 'กรุณาระบุหมายเลขโทรศัพท์';
    if (!formData.factoryId) newErrors.factoryId = 'กรุณาเลือกโรงงาน';
    if (!formData.serviceAreaId) newErrors.serviceAreaId = 'กรุณาเลือกพื้นที่';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const cleanedCardId = inputCardId.replace(/\D/g, '');
      const isNationalId = cleanedCardId.length === 13;

      const payload = {
        ...formData,
        thaiNationalId: isNationalId ? cleanedCardId : '',
        thaiFarmerId: !isNationalId ? cleanedCardId : '',
        phone: formData.phone ? formData.phone.replace(/-/g, '') : '',
      };
      const newFarmer = await createFarmer(payload);
      if (state?.bookId && newFarmer?.farmerId) {
        await settingOwnerData(Number(state.bookId), {
          farmerId: newFarmer.farmerId,
        });
      }
      await swalSuccessTimer('สำเร็จ!', 'เพิ่มข้อมูลเกษตรกรเรียบร้อยแล้ว');
      navigate(-1);
    } catch (error: unknown) {
      console.error(error);
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message =
        err?.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await swalError('เกิดข้อผิดพลาด', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {KPI_CONFIG.map(cfg => {
          const value = summary?.[cfg.key] ?? 0;
          return (
            <div key={cfg.key} className="col-sm-6 col-lg-4">
              {summaryLoading ? (
                <div
                  className="private-metric-card h-100"
                  style={{ borderLeft: '4px solid rgba(128,128,128,0.2)' }}
                >
                  <div className="private-card-body py-3 px-4">
                    <div className="placeholder-glow mb-2">
                      <span
                        className="placeholder d-block rounded"
                        style={{ height: 11, width: '60%' }}
                      />
                    </div>
                    <div className="placeholder-glow">
                      <span
                        className="placeholder d-block rounded"
                        style={{ height: 32, width: '40%' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="private-metric-card h-100"
                  style={{ borderLeft: `4px solid ${cfg.accent}` }}
                >
                  <div className="private-card-body py-3 px-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span
                        className="text-muted fw-semibold text-uppercase"
                        style={{ fontSize: '0.7rem', letterSpacing: '0.6px' }}
                      >
                        {cfg.label}
                      </span>
                      <i
                        className={cfg.icon}
                        style={{
                          color: cfg.accent,
                          fontSize: '1.1rem',
                          opacity: 0.75,
                        }}
                      />
                    </div>
                    <div className="d-flex align-items-baseline gap-2">
                      <span
                        className="fw-bold"
                        style={{ fontSize: '2rem', lineHeight: 1.1 }}
                      >
                        {value}
                      </span>
                      <span
                        className="text-muted"
                        style={{ fontSize: '0.78rem' }}
                      >
                        {cfg.unit}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-seedling me-2" />
                เพิ่มเกษตรกร
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle
                  color={B_LIST.list.color}
                  icon={B_LIST.list.icon}
                  link="/admin/farmer"
                />
                <GenButtonCircle
                  color={B_LIST.land.color}
                  icon={B_LIST.land.icon}
                  link="/admin/land/add"
                />
              </div>
            </div>
            <div className="private-card-body">
              <div className="col-md-6 ms-auto me-auto">
                <GenFormText2
                  isRequired
                  id="card-id"
                  name="cardId"
                  label="บัตรเกษตรกร/ประชาชน"
                  placeholder="ระบุหมายเลขบัตรเกษตรกร/บัตรประชาชน"
                  desc="ใช้เพื่อยืนยันตัวตน"
                  value={inputCardId}
                  onChange={handleChange}
                  errorMessage={errors.cardId}
                />
                <GenFormText1
                  isRequired
                  id="name"
                  name="name"
                  label="ชื่อ"
                  placeholder="ระบุชื่อ"
                  value={formData.firstName}
                  onChange={handleChange}
                  errorMessage={errors.name}
                />
                <GenFormText1
                  isRequired
                  id="lastname"
                  name="lastname"
                  label="นามสกุล"
                  placeholder="ระบุนามสกุล"
                  value={formData.lastName}
                  onChange={handleChange}
                  errorMessage={errors.lastname}
                />
                <GenFormText1
                  isRequired
                  id="phone"
                  name="phone"
                  label="โทรศัพท์"
                  placeholder="ระบุหมายเลขโทรศัพท์"
                  value={formData.phone}
                  onChange={handleChange}
                  errorMessage={errors.phone}
                />
                <GenFormDate1
                  isRequired={false}
                  id="birthDate"
                  name="birthDate"
                  label="วันเดือนปีเกิด"
                  value={formData.birthDate || ''}
                  onChange={handleChange}
                />
                <GenFormSelect
                  isRequired
                  id="factory"
                  name="factoryId"
                  label="โรงงาน"
                  options={factoryList.map(f => ({
                    value: f.factoryId.toString(),
                    name: `${f.name} (${f.initial})`,
                  }))}
                  value={formData.factoryId}
                  onChange={handleChange}
                />
                {errors.factoryId && (
                  <div className="text-danger small mb-2">
                    {errors.factoryId}
                  </div>
                )}
                <GenFormSelect
                  isRequired
                  id="serviceArea"
                  name="serviceAreaId"
                  label="พื้นที่ให้บริการ"
                  options={serviceAreaList.map(p => ({
                    value: p.serviceAreaId.toString(),
                    name: `เขต ${p.code} ${p.name}`,
                  }))}
                  value={formData.serviceAreaId}
                  onChange={handleChange}
                />
                {errors.serviceAreaId && (
                  <div className="text-danger small mb-2">
                    {errors.serviceAreaId}
                  </div>
                )}

                <div className="private-action-footer mt-4 d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: '150px' }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'กำลังบันทึก...' : 'เพิ่มเกษตรกร'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ width: '150px' }}
                    onClick={() => setShowConfirm(true)}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ยืนยันการยกเลิก"
          text="คุณต้องการยกเลิกการเพิ่มเกษตรกรหรือไม่?"
          action="cancel"
          onConfirm={() => {
            navigate(-1);
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default FarmerAdd;
