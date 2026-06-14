import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import { GenFormSelect, GenFormText1 } from '../../components/gui/GuiForm';
import {
  checkEncryptQrCode,
  getQrCodeByEncryptCode,
  updateDataByFarmer,
} from '../../services/api/qr-code/QrCodeApi';
import {
  getAllFactories,
  getFactoryById,
} from '../../services/api/service-area/FactoryApi';
import { getAllServiceTypes } from '../../services/api/service-type/ServiceTypeApi';
import { CollectSampleInput } from '../../types/qr-code/CollectSample';
import { QrCode, SampleStatusEnum } from '../../types/qr-code/QrCode';
import { FactoryInfoInterface } from '../../types/service-area/Factories';
import { ServiceAreaInterface } from '../../types/service-area/ServiceAreas';
import { ServiceType } from '../../types/service-type/ServiceTypes';

import LeafletMapPicker from '@/components/map/LeafletMapMarker';
import { formatThaiNationalId } from '../../utils/IdentificationNumberFormat';
import { formatPhoneNumber } from '../../utils/PhoneNumberFormat';

const CollectSample = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [factories, setFactories] = useState<FactoryInfoInterface[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaInterface[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<number>();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [qrCodeValid, setQrCodeValid] = useState<boolean | null>(null);
  const [collectExamForm, setCollectExamForm] = useState<CollectSampleInput>({
    firstName: '',
    lastName: '',
    landCode: '',
    landName: '',
    latitude: '',
    longitude: '',
    phoneNumber: '',
    serviceAreaId: 0,
    serviceTypeId: 0,
    thaiNationalId: '',
  });
  const [isCollected, setIsCollected] = useState<QrCode>();
  const { code } = useParams();

  const setValueCollected = (qrCode: QrCode) => {
    setSelectedFactory(qrCode?.book?.serviceArea?.factoryId);
    setCollectExamForm({
      firstName: qrCode?.firstName,
      lastName: qrCode?.lastName,
      landCode: qrCode?.landCode,
      landName: qrCode?.landName,
      latitude: qrCode?.book?.latitude,
      longitude: qrCode?.book?.longitude,
      phoneNumber: qrCode?.phoneNumber,
      serviceAreaId: Number(qrCode?.book?.serviceAreaId),
      serviceTypeId: qrCode?.book?.serviceTypeId,
      thaiNationalId: qrCode?.thaiNationalId,
    });
    setIsCollected(qrCode);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isValidCode = await checkEncryptQrCode(code!);
        setQrCodeValid(isValidCode);
        if (!isValidCode) return;

        const qrCode: QrCode = await getQrCodeByEncryptCode(code!);

        const factoriesList = await getAllFactories();
        const serviceTypeList = await getAllServiceTypes();
        setFactories(factoriesList);
        setServiceTypes(serviceTypeList);

        if (qrCode?.status !== SampleStatusEnum.DISTRIBUTED) {
          setValueCollected(qrCode);
        }

        console.log(qrCode);

        if (qrCode?.status === SampleStatusEnum.DISTRIBUTED) {
          if (factoriesList.length) {
            const defaultFactory = factoriesList[0];
            setSelectedFactory(defaultFactory.factoryId);
          }
          if (serviceTypeList.length) {
            setCollectExamForm(prev => ({
              ...prev,
              serviceTypeId: Number(serviceTypeList[0].serviceTypeId),
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };
    fetchData();
  }, [code]);

  useEffect(() => {
    const fetchServiceAreaByFactory = async () => {
      if (selectedFactory === undefined) return;
      const data = await getFactoryById(selectedFactory);
      setServiceAreas(data.serviceAreas);
      if (isCollected?.status === SampleStatusEnum.DISTRIBUTED) {
        setCollectExamForm(prev => ({
          ...prev,
          serviceAreaId: Number(data.serviceAreas[0].serviceAreaId),
        }));
      } else {
        setCollectExamForm(prev => ({
          ...prev,
          serviceAreaId: Number(isCollected?.book?.serviceAreaId),
        }));
      }
    };

    fetchServiceAreaByFactory();
  }, [selectedFactory]);

  useEffect(() => {
    if (location) {
      setCollectExamForm(prev => ({
        ...prev,
        latitude: location.lat.toFixed(6),
        longitude: location.lng.toFixed(6),
      }));
    }
  }, [location]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numberFields = ['serviceTypeId', 'serviceAreaId'];

    if (name === 'thaiNationalId') {
      const formatted = formatThaiNationalId(value);
      setCollectExamForm(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'phoneNumber') {
      const formatted = formatPhoneNumber(value);
      setCollectExamForm(prev => ({ ...prev, [name]: formatted }));
    } else {
      setCollectExamForm(prev => ({
        ...prev,
        [name]: numberFields.includes(name) ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      ...collectExamForm,
      latitude: '100.101101',
      longitude: '14.123456',
      phoneNumber: collectExamForm.phoneNumber.replace(/-/g, ''),
      thaiNationalId: collectExamForm.thaiNationalId.replace(/-/g, ''),
    };

    console.log('collectExamForm', payload);
    try {
      const response = await updateDataByFarmer(code!, payload);
      console.log('response', response);
      await Swal.fire({
        title: 'เพิ่มข้อมูลตัวอย่างดินสำเร็จ',
        text: 'คุณได้เพิ่มข้อมูลตัวอย่างดินเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง',
      });
      // โหลดหน้าเดิมใหม่ 1 ครั้ง
      window.location.reload();
    } catch (error) {
      console.error('Error updating data:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเพิ่มข้อมูลตัวอย่างดินได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  if (qrCodeValid === false) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <div className="alert alert-danger text-center shadow">
          <h4>QR Code ไม่ถูกต้อง</h4>
          <p>กรุณาติดต่อเจ้าหน้าที่เพื่อขอความช่วยเหลือ</p>
        </div>
      </div>
    );
  }

  if (qrCodeValid === null) {
    return (
      <div
        className="d-flex justify-content-center align-items-center flex-column"
        style={{ minHeight: '100vh' }}
      >
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">กำลังตรวจสอบ QR Code...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white text-center">
          <h4 className="mb-0">แบบฟอร์มเก็บตัวอย่างดิน</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <GenFormText1
                  id="firstName"
                  isRequired={true}
                  name="firstName"
                  label="ชื่อ"
                  placeholder=""
                  value={collectExamForm.firstName}
                  onChange={handleChange}
                  remark="* ไม่ต้องใส่คำนำหน้า"
                  readOnly={
                    isCollected?.status !== SampleStatusEnum.DISTRIBUTED &&
                      isCollected
                      ? true
                      : false
                  }
                />
              </div>
              <div className="col-md-6">
                <GenFormText1
                  id="lastName"
                  isRequired={true}
                  name="lastName"
                  label="นามสกุล"
                  value={collectExamForm.lastName}
                  onChange={handleChange}
                  placeholder=""
                  readOnly={
                    isCollected?.status !== SampleStatusEnum.DISTRIBUTED &&
                      isCollected
                      ? true
                      : false
                  }
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <GenFormText1
                  id="phoneNumber"
                  isRequired={true}
                  name="phoneNumber"
                  label="หมายเลขโทรศัพท์"
                  placeholder="เช่น 080xxxxxxx"
                  value={collectExamForm.phoneNumber}
                  onChange={handleChange}
                  readOnly={
                    isCollected?.status !== SampleStatusEnum.DISTRIBUTED &&
                      isCollected
                      ? true
                      : false
                  }
                />
              </div>
              <div className="col-md-6">
                <GenFormText1
                  id="thaiNationalId"
                  isRequired={true}
                  name="thaiNationalId"
                  label="รหัสบัตรประชาชน"
                  placeholder="เช่น 1 2345 67890 12 3"
                  value={collectExamForm.thaiNationalId}
                  onChange={handleChange}
                  readOnly={
                    isCollected?.status !== SampleStatusEnum.DISTRIBUTED &&
                      isCollected
                      ? true
                      : false
                  }
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <GenFormSelect
                  isRequired={true}
                  id="factory"
                  name="factory"
                  onChange={e => setSelectedFactory(Number(e.target.value))}
                  options={factories.map(factory => {
                    return {
                      value: factory.factoryId,
                      name: `${factory.name} (${factory.initial})`,
                    };
                  })}
                  label="โรงงาน"
                  value={selectedFactory}
                  disabled={
                    isCollected?.status !== SampleStatusEnum.DISTRIBUTED &&
                      isCollected
                      ? true
                      : false
                  }
                />
              </div>
              <div className="col-md-6">
                <GenFormSelect
                  isRequired={true}
                  id="serviceAreaId"
                  name="serviceAreaId"
                  onChange={handleChange}
                  options={serviceAreas.map(serviceArea => {
                    return {
                      value: serviceArea.serviceAreaId,
                      name: `เขต ${serviceArea.code} ${serviceArea.name}`,
                    };
                  })}
                  label="เขตส่งเสริม"
                  value={collectExamForm.serviceAreaId}
                  disabled={
                    isCollected?.status !== SampleStatusEnum.DISTRIBUTED &&
                      isCollected
                      ? true
                      : false
                  }
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <GenFormText1
                  id="landCode"
                  isRequired={false}
                  name="landCode"
                  label="หมายเลขแปลง"
                  placeholder=""
                  value={collectExamForm.landCode}
                  onChange={handleChange}
                  readOnly={
                    isCollected?.status !== SampleStatusEnum.DISTRIBUTED &&
                      isCollected
                      ? true
                      : false
                  }
                />
              </div>
              <div className="col-md-6">
                <GenFormText1
                  id="landName"
                  isRequired={false}
                  name="landName"
                  label="ชื่อแปลง"
                  placeholder=""
                  value={collectExamForm.landName}
                  onChange={handleChange}
                  readOnly={
                    isCollected?.status !== SampleStatusEnum.DISTRIBUTED &&
                      isCollected
                      ? true
                      : false
                  }
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <GenFormSelect
                  isRequired={true}
                  id="serviceTypeId"
                  name="serviceTypeId"
                  onChange={handleChange}
                  options={serviceTypes.map(serviceType => {
                    return {
                      value: Number(serviceType.serviceTypeId),
                      name: serviceType.name,
                    };
                  })}
                  label="ประเภทการให้บริการ"
                  value={Number(collectExamForm.serviceTypeId)}
                  disabled={
                    isCollected?.status !== SampleStatusEnum.DISTRIBUTED &&
                      isCollected
                      ? true
                      : false
                  }
                />
              </div>
            </div>

            <div className="col-md">
              <LeafletMapPicker center={location} onChange={setLocation} />
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
              <button type="submit" className="btn btn-primary">
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CollectSample;
