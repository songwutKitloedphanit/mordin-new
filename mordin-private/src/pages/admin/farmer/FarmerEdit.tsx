// D:\mitrpol\mordin-private\src\pages\admin\farmer\FarmerAdd.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import {
  GenFormText1,
  GenFormText2,
  GenFormSelect,
  GenFormDate1,
} from '../../../components/gui/GuiForm';
import {
  getFarmerById,
  updateFarmerById,
} from '../../../services/api/FarmerApi';
import {
  getAllFactories,
  getFactoryById,
} from '../../../services/api/service-area/FactoryApi';
import { getAllServiceAreas } from '../../../services/api/service-area/ServiceAreaApi';
import {
  FarmerFormState,
  FarmerCreateInput,
  Farmer,
} from '../../../types/Farmer';
import { FactoryInfoInterface } from '../../../types/service-area/Factories';
import { ServiceAreaInterface } from '../../../types/service-area/ServiceAreas';

import FarmerCard from '@/components/pages/farmer/farmerCard';
const FarmerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 1. State เก็บ list จาก DB (หรือ mock)
  const [factoryList, setFactoryList] = useState<FactoryInfoInterface[]>([]);
  const [serviceAreaList, setServiceAreaList] = useState<
    ServiceAreaInterface[]
  >([]);
  const [farmer, setFarmer] = useState<Farmer>({} as Farmer);
  const [cardType, setCardtype] = useState('');

  const [formData, setFormData] = useState<FarmerCreateInput>({
    thaiNationalId: '',
    thaiFarmerId: '',
    phone: '',
    firstName: '',
    lastName: '',
    factoryId: null,
    serviceAreaId: null,
    birthDate: '',
  });

  useEffect(() => {
    // จำลองดึงข้อมูลจาก backend
    const fetchFarmer = async () => {
      const farmerData = await getFarmerById(Number(id));

      setFormData(farmerData);
      setCardtype(farmerData.thaiNationalId ? '2' : '1');
      setFarmer(farmerData);
    };
    fetchFarmer();
  }, [id]);

  useEffect(() => {
    const fetchMockData = async () => {
      const factoryData = await getAllFactories();
      const serviceAreaData = await getAllServiceAreas();
      setFactoryList(factoryData);
      // setServiceAreaList(serviceAreaData.map((p)=>({
      //   name: `เขต ${p.code} ${p.name}`,
      //   value: p.serviceAreaId
      // })));
      setServiceAreaList(serviceAreaData);
    };
    fetchMockData();
  }, []);

  const [errors, setErrors] = useState<
    Partial<Record<keyof FarmerFormState, string>>
  >({});

  useEffect(() => {
    const loadServiceAreas = async () => {
      if (formData.factoryId) {
        const factory = await getFactoryById(Number(formData.factoryId));
        // const areas = factory.serviceAreas.map((p) => ({
        //   name: `เขต ${p.code} ${p.name}`,
        //   value: p.serviceAreaId
        // }));
        // setServiceAreaList(areas);
        setServiceAreaList(factory.serviceAreas);

        // กำหนดค่าเริ่มต้น serviceAreaId ใหม่เมื่อเปลี่ยน factory
        setFormData(prev => ({
          ...prev,
          // serviceAreaId: areas.length > 0 ? areas[0].value.toString() : "",
          serviceAreaId: factory.serviceAreas.some(
            (area: ServiceAreaInterface) =>
              area.serviceAreaId === prev.serviceAreaId
          )
            ? prev.serviceAreaId
            : factory.serviceAreas[0]?.serviceAreaId ?? null,
        }));
      } else {
        setServiceAreaList([]);
        setFormData(prev => ({
          ...prev,
          serviceAreaId: null,
        }));
      }
    };
    loadServiceAreas();
  }, [formData.factoryId]);

  const formatIDCard = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 13);
    // Format: x-xxxx-xxxxx-xx-x
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
    // Format: xxx-xxx-xxxx
    let formatted = limited;
    if (limited.length > 3)
      formatted = limited.slice(0, 3) + '-' + limited.slice(3);
    if (limited.length > 6)
      formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
    return formatted;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'cardType') {
      setCardtype(value);
    } else if (name === 'cardId') {
      const formatted = formatIDCard(value);
      if (cardType === '1') {
        setFormData(prev => ({ ...prev, thaiFarmerId: formatted }));
      } else {
        setFormData(prev => ({ ...prev, thaiNationalId: formatted }));
      }
    } else if (name === 'name') {
      setFormData(prev => ({ ...prev, firstName: value }));
    } else if (name === 'lastname') {
      setFormData(prev => ({ ...prev, lastName: value }));
    } else if (name === 'factoryId' || name === 'serviceAreaId') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, phone: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};

    // ตรวจเช็คความถูกต้อง
    if (!formData.thaiFarmerId && !formData.thaiNationalId)
      newErrors.cardId = 'กรุณาระบุหมายเลขบัตร';
    if (!formData.firstName.trim()) newErrors.name = 'กรุณาระบุชื่อ';
    if (!formData.lastName.trim()) newErrors.lastname = 'กรุณาระบุนามสกุล';
    if (!formData.phone.trim()) newErrors.phone = 'กรุณาระบุหมายเลขโทรศัพท์';
    if (!formData.factoryId) newErrors.factoryId = 'กรุณาเลือกโรงงาน';
    if (!formData.serviceAreaId) newErrors.serviceAreaId = 'กรุณาเลือกพื้นที่';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      // Clean data before sending
      const payload = {
        ...formData,
        thaiNationalId: formData.thaiNationalId
          ? formData.thaiNationalId.replace(/-/g, '')
          : '',
        thaiFarmerId: formData.thaiFarmerId
          ? formData.thaiFarmerId.replace(/-/g, '')
          : '',
        phone: formData.phone ? formData.phone.replace(/-/g, '') : '',
      };

      await updateFarmerById(Number(id), payload);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มข้อมูลเกษตรกรเรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate('/admin/farmer');
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล กรุณาลองใหม่',
        icon: 'error',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
    }
  };

  return (
    <div className="row">
      {/* Statistics Cards */}
      <FarmerCard />
      {/* Edit Form */}
      <div className="col-md-12">
        <div className="private-card">
          <div className="private-card-header">
            <div className="row row-demo-grid">
              <div
                className="col-md-4 col-sm-6 col-6"
                style={{ textAlign: 'left' }}
              >
                <h4 className="private-card-title">แก้ไขเกษตรกร ({farmer.phone})</h4>
              </div>
              <div
                className="col-md-4 col-sm-6 col-6 ms-auto"
                style={{ textAlign: 'right' }}
              >
                <GenButtonCircle
                  color={B_LIST.list.color}
                  icon={B_LIST.list.icon}
                  link="/admin/farmer"
                  className="mx-1"
                />
                <GenButtonCircle
                  color={B_LIST.land.color}
                  icon={B_LIST.land.icon}
                  link="/admin/land/add"
                />
              </div>
            </div>
          </div>
          <div className="private-card-body">
            <div className="col-md-6 ms-auto me-auto">
              <div className="row">
                <div className="col-md-3 col-lg-3">
                  <div className="form-group">
                    <label>ประเภทบัตร</label>
                  </div>
                </div>
                <div className="col-md-3 col-lg-3">
                  <div className="form-group">
                    <input
                      type="radio"
                      id="card-type-1"
                      name="cardType"
                      value="1"
                      checked={cardType === '1'}
                      onChange={handleChange}
                    />
                    <label htmlFor="card-type-1">บัตรเกษตรกร</label>
                  </div>
                </div>
                <div className="col-md-3 col-lg-3">
                  <div className="form-group">
                    <input
                      type="radio"
                      id="card-type-2"
                      name="cardType"
                      value="2"
                      checked={cardType === '2'}
                      onChange={handleChange}
                    />
                    <label htmlFor="card-type-2">บัตรประชาชน</label>
                  </div>
                </div>
              </div>

              <GenFormText2
                isRequired={true}
                id="card-id"
                name="cardId"
                label="บัตรเกษตรกร/ประชาชน"
                placeholder="ระบุหมายเลขบัตรเกษตรกร/บัตรประชาชน"
                desc="ใช้เพื่อยืนยันตัวตน"
                value={
                  cardType === '1'
                    ? formData.thaiFarmerId
                    : formData.thaiNationalId
                }
                onChange={handleChange}
                errorMessage={errors.cardId}
              />
              <GenFormText1
                isRequired={true}
                id="name"
                name="name"
                label="ชื่อ"
                placeholder="ระบุชื่อ"
                value={formData.firstName}
                onChange={handleChange}
                errorMessage={errors.name}
              />
              <GenFormText1
                isRequired={true}
                id="lastname"
                name="lastname"
                label="นามสกุล"
                placeholder="ระบุนามสกุล"
                value={formData.lastName}
                onChange={handleChange}
                errorMessage={errors.lastname}
              />
              <GenFormText1
                isRequired={true}
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
                name="factoryId" // โ เปลี่ยนตรงนี้
                label="โรงงาน"
                options={factoryList.map(f => ({
                  value: f.factoryId.toString(),
                  name: `${f.name} (${f.initial})`,
                }))}
                value={formData.factoryId} // โ เปลี่ยนตรงนี้
                onChange={handleChange}
              />
              {/* แสดง error เอง */}
              {errors.factoryId && (
                <div className="text-danger">{errors.factoryId}</div>
              )}

              <GenFormSelect
                isRequired
                id="serviceArea"
                name="serviceAreaId" // โ เปลี่ยนตรงนี้
                label="พื้นที่ให้บริการ"
                options={serviceAreaList.map(p => ({
                  value: p.serviceAreaId.toString(),
                  name: `เขต ${p.code} ${p.name}`,
                }))}
                value={formData.serviceAreaId} // โ เปลี่ยนตรงนี้
                onChange={handleChange}
              />
              {errors.serviceAreaId && (
                <div className="text-danger">{errors.serviceAreaId}</div>
              )}

              <div className="private-action-footer mt-4 d-flex justify-content-between">
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ width: '150px' }}
                  onClick={handleSubmit}
                >
                  แก้ไขเกษตรกร
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: '150px' }}
                  onClick={() => navigate('/admin/farmer')}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FarmerEdit;

