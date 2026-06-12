import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import { getDistrictsByProvinceCode } from '@/services/api/address/DistrictApi';
import { getAllProvinces } from '@/services/api/address/ProvinceApi';
import { getSubdistrictsByDistrictCode } from '@/services/api/address/SubdistrictApi';
import { createFarmer } from '@/services/api/FarmerApi';
import { createLand } from '@/services/api/LandApi';
import { settingOwnerData } from '@/services/api/qr-code/BookApi';
import {
  getAllFactories,
  getFactoryById,
} from '@/services/api/service-area/FactoryApi';
import { Subdistrict } from '@/types/address';
import { FarmerCreateInput } from '@/types/Farmer';
import { QrCodeInfo } from '@/types/qr-code/QrCode';
import { FactoryInfoInterface } from '@/types/service-area/Factories';
import { ServiceAreaInterface } from '@/types/service-area/ServiceAreas';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';
import { swalSuccessTimer, swalError } from '@/utils/swal';

// Formatting helpers
const formatIDCard = (value: string) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 13);
  let formatted = cleaned;
  if (cleaned.length > 1)
    formatted = cleaned.slice(0, 1) + '-' + cleaned.slice(1);
  if (cleaned.length > 5)
    formatted = formatted.slice(0, 6) + '-' + formatted.slice(6);
  if (cleaned.length > 10)
    formatted = formatted.slice(0, 12) + '-' + formatted.slice(12);
  if (cleaned.length > 12)
    formatted = formatted.slice(0, 15) + '-' + formatted.slice(15);
  return formatted;
};

const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 10);
  let formatted = cleaned;
  if (cleaned.length > 3)
    formatted = cleaned.slice(0, 3) + '-' + cleaned.slice(3);
  if (cleaned.length > 6)
    formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
  return formatted;
};

interface CollectionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  qrCodeData: QrCodeInfo;
  startStep: number;
}

const CollectionWizardModal: React.FC<CollectionWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  qrCodeData,
  startStep,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(startStep);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAddressInitialized, setIsAddressInitialized] =
    useState<boolean>(false);

  // Farmer Form State
  const [farmerForm, setFarmerForm] = useState<FarmerCreateInput>({
    thaiNationalId: qrCodeData.thaiNationalId
      ? formatIDCard(qrCodeData.thaiNationalId)
      : '',
    thaiFarmerId: '',
    phone: qrCodeData.phoneNumber
      ? formatPhoneNumber(qrCodeData.phoneNumber)
      : '',
    firstName: qrCodeData.firstName || '',
    lastName: qrCodeData.lastName || '',
    birthDate:
      (qrCodeData as QrCodeInfo & { birthDate?: string }).birthDate ||
      qrCodeData.book?.farmer?.birthDate ||
      '',
    factoryId:
      qrCodeData.book?.serviceArea?.factoryId ??
      qrCodeData.serviceArea?.factoryId ??
      qrCodeData.book?.farmer?.factoryId ??
      0,
    serviceAreaId:
      qrCodeData.book?.serviceAreaId ??
      qrCodeData.serviceAreaId ??
      qrCodeData.book?.farmer?.serviceAreaId ??
      0,
  });

  const [farmerId, setFarmerId] = useState<number | null>(
    qrCodeData.book?.farmerId || null
  );

  const [factories, setFactories] = useState<FactoryInfoInterface[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaInterface[]>([]);
  const [farmerErrors, setFarmerErrors] = useState<Record<string, string>>({});

  // Land Form State
  const [landForm, setLandForm] = useState({
    name: qrCodeData.landName || '',
    landCode: qrCodeData.landCode || '',
    quotaCode: qrCodeData.book?.land?.quotaCode || '',
    areaSize:
      qrCodeData.book?.areaSize || qrCodeData.book?.land?.areaSize || '',
    provinceId: '',
    districtId: '',
    subdistrictCode: '',
    zipCode: '',
    village: qrCodeData.book?.land?.village || '',
    latitude:
      qrCodeData.book?.land?.latitude || qrCodeData.book?.latitude || '',
    longitude:
      qrCodeData.book?.land?.longitude || qrCodeData.book?.longitude || '',
  });

  const [provinces, setProvinces] = useState<
    { code: number; nameTh: string }[]
  >([]);
  const [districts, setDistricts] = useState<
    { code: number; nameTh: string }[]
  >([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);
  const [landErrors, setLandErrors] = useState<Record<string, string>>({});

  // Map markers state
  const [mapMarkers, setMapMarkers] = useState<MapMarkerData[]>([]);

  // Load Initial Metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const factoryList = await getAllFactories();
        setFactories(factoryList);

        const qrServiceArea =
          qrCodeData.book?.serviceArea ?? qrCodeData.serviceArea;
        const defaultFactoryId =
          qrServiceArea?.factoryId ??
          qrCodeData.book?.farmer?.factoryId ??
          (factoryList.length > 0 ? factoryList[0].factoryId : 0);
        setFarmerForm(prev => ({
          ...prev,
          factoryId: prev.factoryId || defaultFactoryId,
        }));

        const provinceList = await getAllProvinces();
        setProvinces(provinceList);
      } catch (err) {
        console.error('Failed to load factories or provinces:', err);
      }
    };
    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen, qrCodeData]);

  // Load Map Markers
  useEffect(() => {
    const lat = parseFloat(String(landForm.latitude));
    const lng = parseFloat(String(landForm.longitude));
    if (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      setMapMarkers([
        {
          id: 1,
          lat,
          lng,
          title: landForm.name || 'พิกัดแปลงปลูก',
        },
      ]);
    } else {
      setMapMarkers([]);
    }
  }, [landForm.latitude, landForm.longitude, landForm.name]);

  // Auto-fill address dropdowns from QR Code Book details
  useEffect(() => {
    if (!isOpen || !qrCodeData || isAddressInitialized) return;

    const prefillAddress = async () => {
      const book = qrCodeData.book;
      const subdistrict = book?.subdistrict ?? book?.land?.subdistrict;
      const district = subdistrict?.district;
      const province = district?.province;

      const pCode = province?.code || district?.province?.code || '';
      const dCode = district?.code || subdistrict?.district?.code || '';
      const sCode = book?.subdistrictCode || subdistrict?.code || '';
      const zCode =
        book?.zipCode ?? book?.land?.zipCode ?? subdistrict?.zipCode ?? '';

      if (pCode) {
        setLandForm(prev => ({
          ...prev,
          provinceId: String(pCode),
        }));

        try {
          const districtList = await getDistrictsByProvinceCode(Number(pCode));
          setDistricts(districtList);

          if (dCode) {
            setLandForm(prev => ({
              ...prev,
              districtId: String(dCode),
            }));

            const subdistrictList = await getSubdistrictsByDistrictCode(
              Number(dCode)
            );
            setSubdistricts(subdistrictList);

            if (sCode) {
              setLandForm(prev => ({
                ...prev,
                subdistrictCode: String(sCode),
                zipCode: String(zCode),
              }));
            }
          }
        } catch (err) {
          console.error('Failed to prefill address from QR data:', err);
        }
      }
      setIsAddressInitialized(true);
    };

    prefillAddress();
  }, [isOpen, qrCodeData, isAddressInitialized]);

  // Load Service Areas when factory changes
  useEffect(() => {
    const loadServiceAreas = async () => {
      if (farmerForm.factoryId) {
        try {
          const factory = await getFactoryById(Number(farmerForm.factoryId));
          setServiceAreas(factory.serviceAreas || []);
          setFarmerForm(prev => ({
            ...prev,
            serviceAreaId: factory.serviceAreas?.some(
              (area: ServiceAreaInterface) =>
                area.serviceAreaId === prev.serviceAreaId
            )
              ? prev.serviceAreaId
              : factory.serviceAreas?.[0]?.serviceAreaId || 0,
          }));
        } catch (err) {
          console.error('Failed to load service areas:', err);
        }
      } else {
        setServiceAreas([]);
        setFarmerForm(prev => ({ ...prev, serviceAreaId: 0 }));
      }
    };
    loadServiceAreas();
  }, [farmerForm.factoryId]);

  // Load Districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (landForm.provinceId) {
        try {
          const districtList = await getDistrictsByProvinceCode(
            Number(landForm.provinceId)
          );
          setDistricts(districtList);
          if (isAddressInitialized) {
            setLandForm(prev => ({
              ...prev,
              districtId: '',
              subdistrictCode: '',
              zipCode: '',
            }));
          }
        } catch (err) {
          console.error('Failed to load districts:', err);
        }
      } else {
        setDistricts([]);
      }
    };
    loadDistricts();
  }, [landForm.provinceId, isAddressInitialized]);

  // Load Subdistricts when district changes
  useEffect(() => {
    const loadSubdistricts = async () => {
      if (landForm.districtId) {
        try {
          const subdistrictList = await getSubdistrictsByDistrictCode(
            Number(landForm.districtId)
          );
          setSubdistricts(subdistrictList);
          if (isAddressInitialized) {
            setLandForm(prev => ({
              ...prev,
              subdistrictCode: '',
              zipCode: '',
            }));
          }
        } catch (err) {
          console.error('Failed to load subdistricts:', err);
        }
      } else {
        setSubdistricts([]);
      }
    };
    loadSubdistricts();
  }, [landForm.districtId, isAddressInitialized]);

  // Set Zip Code when subdistrict changes
  useEffect(() => {
    if (landForm.subdistrictCode) {
      const sub = subdistricts.find(s => s.code === landForm.subdistrictCode);
      if (sub) {
        setLandForm(prev => ({
          ...prev,
          zipCode: sub.zipCode ? String(sub.zipCode) : '',
        }));
      }
    }
  }, [landForm.subdistrictCode, subdistricts]);

  if (!isOpen) return null;

  const handleFarmerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFarmerForm(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
    } else if (name === 'thaiNationalId') {
      setFarmerForm(prev => ({ ...prev, thaiNationalId: formatIDCard(value) }));
    } else if (name === 'factoryId' || name === 'serviceAreaId') {
      setFarmerForm(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFarmerForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLandChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLandForm(prev => ({ ...prev, [name]: value }));
  };

  const submitFarmer = async () => {
    // Validate
    const errors: Record<string, string> = {};
    if (!(farmerForm.thaiNationalId || '').trim())
      errors.thaiNationalId = 'กรุณาระบุหมายเลขบัตรประชาชน';
    if (!farmerForm.firstName.trim()) errors.firstName = 'กรุณาระบุชื่อ';
    if (!farmerForm.lastName.trim()) errors.lastName = 'กรุณาระบุนามสกุล';
    if (!farmerForm.phone.trim()) errors.phone = 'กรุณาระบุหมายเลขโทรศัพท์';
    if (!farmerForm.factoryId) errors.factoryId = 'กรุณาเลือกโรงงาน';
    if (!farmerForm.serviceAreaId) errors.serviceAreaId = 'กรุณาเลือกพื้นที่';

    if (Object.keys(errors).length > 0) {
      setFarmerErrors(errors);
      return;
    }

    setFarmerErrors({});
    setLoading(true);

    try {
      const cleanedCardId = (farmerForm.thaiNationalId || '').replace(
        /\D/g,
        ''
      );
      const isNationalId = cleanedCardId.length === 13;

      const payload = {
        ...farmerForm,
        thaiNationalId: isNationalId ? cleanedCardId : '',
        thaiFarmerId: !isNationalId ? cleanedCardId : '',
        phone: farmerForm.phone.replace(/-/g, ''),
        birthDate: farmerForm.birthDate || undefined,
      };

      const newFarmer = await createFarmer(payload);
      setFarmerId(newFarmer.farmerId);

      // Link farmer to book
      if (qrCodeData.book?.bookId) {
        await settingOwnerData(Number(qrCodeData.book.bookId), {
          farmerId: newFarmer.farmerId,
        });
      }

      await swalSuccessTimer('สำเร็จ!', 'บันทึกข้อมูลเกษตรกรเรียบร้อยแล้ว');
      setCurrentStep(3);
    } catch (err: unknown) {
      console.error(err);
      const error = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const msg = error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้';
      swalError('เกิดข้อผิดพลาด', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const submitLand = async () => {
    const errors: Record<string, string> = {};
    if (!landForm.name.trim()) errors.name = 'กรุณากรอกชื่อแปลง';
    if (!landForm.areaSize) errors.areaSize = 'กรุณากรอกพื้นที่';
    else if (
      isNaN(Number(landForm.areaSize)) ||
      Number(landForm.areaSize) <= 0
    ) {
      errors.areaSize = 'พื้นที่ต้องเป็นตัวเลขมากกว่า 0';
    }
    if (!landForm.provinceId) errors.provinceId = 'กรุณาเลือกจังหวัด';
    if (!landForm.districtId) errors.districtId = 'กรุณาเลือกอำเภอ';
    if (!landForm.subdistrictCode) errors.subdistrictCode = 'กรุณาเลือกตำบล';
    if (!landForm.zipCode) errors.zipCode = 'กรุณากรอกรหัสไปรษณีย์';

    if (Object.keys(errors).length > 0) {
      setLandErrors(errors);
      return;
    }

    setLandErrors({});
    setLoading(true);

    try {
      const dataToSubmit = {
        landCode: landForm.landCode.trim() ? landForm.landCode : undefined,
        name: landForm.name,
        quotaCode: landForm.quotaCode.trim() ? landForm.quotaCode : undefined,
        areaSize: Number(landForm.areaSize),
        latitude: landForm.latitude ? String(landForm.latitude) : undefined,
        longitude: landForm.longitude ? String(landForm.longitude) : undefined,
        subdistrictCode: landForm.subdistrictCode,
        zipCode: Number(landForm.zipCode),
        village: landForm.village || undefined,
        farmerId: Number(farmerId),
      };

      const createdLand = await createLand(dataToSubmit);

      // Link both land & farmer to the book
      if (qrCodeData.book?.bookId) {
        await settingOwnerData(Number(qrCodeData.book.bookId), {
          farmerId: Number(farmerId),
          landId: Number(createdLand.landId),
          serviceTypeId: qrCodeData.book.serviceTypeId,
          latitude: dataToSubmit.latitude,
          longitude: dataToSubmit.longitude,
        });
      }

      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'บันทึกข้อมูลแปลงปลูกและเชื่อมโยงข้อมูลเสร็จสิ้น',
        timer: 1500,
        showConfirmButton: false,
      });

      setCurrentStep(4);
    } catch (err: unknown) {
      console.error(err);
      const error = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const msg = error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้';
      swalError('เกิดข้อผิดพลาด', Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const getStepClass = (step: number) => {
    if (currentStep === step) return 'stepper-item active';
    if (currentStep > step) return 'stepper-item completed';
    return 'stepper-item';
  };

  const subdistrict = qrCodeData.book?.subdistrict;
  const district = subdistrict?.district;
  const province = district?.province;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
    >
      <style>{`
        .stepper-wrapper {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          border-bottom: 1.5px solid #cbd5e1;
          padding-bottom: 15px;
        }
        .stepper-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        .stepper-item::before {
          position: absolute;
          content: "";
          border-bottom: 2px solid #94a3b8;
          width: 100%;
          top: 18px;
          left: -50%;
          z-index: 1;
        }
        .stepper-item::after {
          position: absolute;
          content: "";
          border-bottom: 2px solid #94a3b8;
          width: 100%;
          top: 18px;
          left: 50%;
          z-index: 1;
        }
        .stepper-item:first-child::before { content: none; }
        .stepper-item:last-child::after { content: none; }
        .stepper-item .step-counter {
          position: relative;
          z-index: 5;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #94a3b8;
          color: #f8fafc;
          font-weight: bold;
          margin-bottom: 6px;
          transition: all 0.3s ease;
        }
        .stepper-item.active .step-counter {
          background-color: var(--mp-fert-green, #18a05c);
          color: white;
          box-shadow: 0 0 0 3px rgba(24, 160, 92, 0.3);
        }
        .stepper-item.completed .step-counter {
          background-color: #10b981;
          color: white;
        }
        .stepper-item.completed::before,
        .stepper-item.completed::after,
        .stepper-item.active::before {
          border-bottom: 2px solid #10b981;
        }
        .stepper-item .step-name {
          font-size: 0.825rem;
          color: #475569;
          font-weight: 600;
        }
        .stepper-item.active .step-name {
          color: #0f172a;
          font-weight: 800;
        }
        .info-panel {
          background-color: #f1f5f9;
          border-right: 2px solid #cbd5e1;
          height: 100%;
        }
        .label-dark {
          color: #1e293b;
          font-weight: 700;
        }
        .value-dark {
          color: #0f172a;
          font-weight: 600;
        }
        .form-control-dark {
          color: #0f172a;
          border-color: #94a3b8;
          font-weight: 500;
        }
        .form-control-dark:focus {
          border-color: var(--mp-fert-green, #18a05c);
          box-shadow: 0 0 0 0.2rem rgba(24, 160, 92, 0.15);
        }
        .form-select-dark {
          color: #0f172a;
          border-color: #94a3b8;
          font-weight: 500;
        }
        .form-select-dark:focus {
          border-color: var(--mp-fert-green, #18a05c);
          box-shadow: 0 0 0 0.2rem rgba(24, 160, 92, 0.15);
        }
      `}</style>

      <div
        className="modal-dialog modal-xl modal-dialog-centered"
        style={{ maxWidth: '85%' }}
      >
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: '12px', overflow: 'hidden' }}
        >
          {/* Header */}
          <div className="modal-header bg-dark text-white py-3">
            <h5 className="modal-title text-white d-flex align-items-center gap-2 fw-bold">
              <i className="fas fa-check-double text-success" />
              ตรวจสอบข้อมูล
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div
            className="modal-body p-0"
            style={{ height: '75vh', minHeight: '520px', display: 'flex' }}
          >
            {/* Left Reference Panel with Map */}
            <div className="col-md-4 info-panel p-4 overflow-auto">
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom border-secondary">
                <i className="fas fa-qrcode me-2 text-primary" />
                ข้อมูลสแกนจาก QR Code
              </h5>

              <div className="d-flex flex-column gap-3 mb-4">
                <div>
                  <label className="text-muted small mb-0 label-dark">
                    รหัสถุงตัวอย่าง (QR Code)
                  </label>
                  <div className="fw-bold text-primary fs-6">
                    {qrCodeData.qrCode || '-'}
                  </div>
                </div>

                <div>
                  <label className="text-muted small mb-0 label-dark">
                    ข้อมูลเกษตรกร (สแกน)
                  </label>
                  <div className="fw-bold text-dark value-dark">
                    {qrCodeData.firstName && qrCodeData.lastName
                      ? `${qrCodeData.firstName} ${qrCodeData.lastName}`
                      : '-'}
                  </div>
                  <div className="small text-muted value-dark">
                    บัตรประชาชน:{' '}
                    {formatThaiNationalId(qrCodeData.thaiNationalId) || '-'}
                  </div>
                  <div className="small text-muted value-dark">
                    เบอร์โทร: {qrCodeData.phoneNumber || '-'}
                  </div>
                </div>

                <div>
                  <label className="text-muted small mb-0 label-dark">
                    ข้อมูลแปลงปลูก (สแกน)
                  </label>
                  <div className="fw-bold text-dark value-dark">
                    {qrCodeData.landName || '-'}
                  </div>
                  <div className="small text-muted value-dark">
                    รหัสแปลง: {qrCodeData.landCode || '-'}
                  </div>
                  <div className="small text-muted value-dark">
                    พื้นที่:{' '}
                    {qrCodeData.book?.areaSize
                      ? `${qrCodeData.book.areaSize} ไร่`
                      : '-'}
                  </div>
                </div>

                <div>
                  <label className="text-muted small mb-0 label-dark">
                    ที่อยู่และพิกัดแปลง
                  </label>
                  <div className="small text-muted value-dark">
                    {subdistrict
                      ? `${qrCodeData.book?.land?.village || ''} ต.${subdistrict.nameTh} อ.${district?.nameTh} จ.${province?.nameTh} ${qrCodeData.book?.zipCode || subdistrict.zipCode}`
                      : 'ไม่ได้ระบุที่อยู่'}
                  </div>
                  <div className="fw-bold text-dark value-dark mt-1">
                    {qrCodeData.book?.latitude && qrCodeData.book?.longitude
                      ? `พิกัด: ${qrCodeData.book.latitude}, ${qrCodeData.book.longitude}`
                      : 'ไม่ระบุพิกัด'}
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="mt-3">
                <h6 className="fw-bold text-dark mb-2 label-dark">
                  <i className="fas fa-map-marked-alt me-1 text-success" />
                  แผนที่ตำแหน่งแปลงปลูก
                </h6>
                {mapMarkers.length > 0 ? (
                  <div
                    style={{
                      height: '220px',
                      width: '100%',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <LeafletMap markers={mapMarkers} />
                  </div>
                ) : (
                  <div
                    className="alert alert-warning border-0 p-3 small mb-0 rounded text-dark bg-warning-subtle"
                    style={{ borderLeft: '4px solid #d97706' }}
                  >
                    <i className="fas fa-exclamation-triangle me-1" />
                    ไม่พบพิกัดตำแหน่งแปลง หรือพิกัดไม่ถูกต้อง
                  </div>
                )}
              </div>
            </div>

            {/* Right Form & Stepper */}
            <div className="col-md-8 p-4 d-flex flex-column justify-content-between overflow-auto">
              <div>
                {/* Stepper progress bar */}
                <div className="stepper-wrapper">
                  <div className={getStepClass(1)}>
                    <div className="step-counter">1</div>
                    <div className="step-name">ตรวจสอบ QR</div>
                  </div>
                  <div className={getStepClass(2)}>
                    <div className="step-counter">2</div>
                    <div className="step-name">เกษตรกร</div>
                  </div>
                  <div className={getStepClass(3)}>
                    <div className="step-counter">3</div>
                    <div className="step-name">แปลงปลูก</div>
                  </div>
                  <div className={getStepClass(4)}>
                    <div className="step-counter">4</div>
                    <div className="step-name">พร้อมรับตัวอย่าง</div>
                  </div>
                </div>

                {/* Step 1: Detailed Scanned QR Data Review */}
                {currentStep === 1 && (
                  <div className="py-2">
                    <h4 className="fw-bold mb-3 text-dark">
                      ขั้นตอนที่ 1: ตรวจสอบข้อมูลสแกน QR Code
                    </h4>
                    <p className="text-muted mb-4 fs-6">
                      กรุณาตรวจสอบข้อมูลที่สแกนได้จากถุงตัวอย่างดิน/แบบฟอร์ม QR
                      ก่อนดำเนินการนำเข้าข้อมูลเข้าระบบ
                    </p>

                    <div className="table-responsive border rounded bg-white">
                      <table className="table table-bordered mb-0 align-middle">
                        <tbody>
                          <tr className="bg-light">
                            <th
                              colSpan={2}
                              className="px-3 py-2 text-primary fw-bold label-dark"
                            >
                              <i className="fas fa-qrcode me-2" />
                              ข้อมูลถุงตัวอย่างดิน
                            </th>
                          </tr>
                          <tr>
                            <td className="w-25 px-3 label-dark">
                              รหัสคิวอาร์ (QR Code)
                            </td>
                            <td className="px-3 value-dark text-primary">
                              {qrCodeData.qrCode || '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 label-dark">ประเภทบริการ</td>
                            <td className="px-3 value-dark text-success">
                              {qrCodeData.book?.serviceType?.name ||
                                qrCodeData.serviceArea?.name ||
                                '-'}
                            </td>
                          </tr>

                          <tr className="bg-light">
                            <th
                              colSpan={2}
                              className="px-3 py-2 text-primary fw-bold label-dark"
                            >
                              <i className="fas fa-user me-2" />
                              ข้อมูลเกษตรกร (Scanned Farmer Info)
                            </th>
                          </tr>
                          <tr>
                            <td className="px-3 label-dark">ชื่อ-นามสกุล</td>
                            <td className="px-3 value-dark">
                              {qrCodeData.firstName || qrCodeData.lastName
                                ? `${qrCodeData.firstName || ''} ${qrCodeData.lastName || ''}`
                                : '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 label-dark">
                              หมายเลขบัตรประชาชน
                            </td>
                            <td className="px-3 value-dark">
                              {formatThaiNationalId(
                                qrCodeData.thaiNationalId
                              ) || '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 label-dark">เบอร์โทรศัพท์</td>
                            <td className="px-3 value-dark">
                              {qrCodeData.phoneNumber || '-'}
                            </td>
                          </tr>

                          <tr className="bg-light">
                            <th
                              colSpan={2}
                              className="px-3 py-2 text-primary fw-bold label-dark"
                            >
                              <i className="fas fa-map-pin me-2" />
                              ข้อมูลแปลงปลูก (Scanned Land Info)
                            </th>
                          </tr>
                          <tr>
                            <td className="px-3 label-dark">
                              ชื่อแปลง / รหัสแปลง
                            </td>
                            <td className="px-3 value-dark">
                              {qrCodeData.landName || '-'}{' '}
                              {qrCodeData.landCode
                                ? `(รหัส: ${qrCodeData.landCode})`
                                : ''}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 label-dark">
                              ขนาดพื้นที่ (ไร่)
                            </td>
                            <td className="px-3 value-dark">
                              {qrCodeData.book?.areaSize
                                ? `${qrCodeData.book.areaSize} ไร่`
                                : '-'}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 label-dark">ที่อยู่แปลง</td>
                            <td className="px-3 value-dark">
                              {subdistrict
                                ? `ต.${subdistrict.nameTh} อ.${district?.nameTh} จ.${province?.nameTh} ${qrCodeData.book?.zipCode || subdistrict.zipCode}`
                                : 'ไม่ได้ระบุ'}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 label-dark">
                              พิกัดทางภูมิศาสตร์
                            </td>
                            <td className="px-3 value-dark">
                              {qrCodeData.book?.latitude &&
                              qrCodeData.book?.longitude
                                ? `${qrCodeData.book.latitude}, ${qrCodeData.book.longitude}`
                                : 'ไม่ได้ระบุ'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Step 2: Farmer Form */}
                {currentStep === 2 && (
                  <div>
                    <h4 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                      <i className="fas fa-user text-primary" />
                      ขั้นตอนที่ 2: บันทึกข้อมูลเกษตรกร
                    </h4>

                    {qrCodeData.book?.farmerId ? (
                      <div className="alert alert-success border-0 py-3 mb-4 d-flex align-items-center gap-3 bg-success-subtle text-dark">
                        <i className="fas fa-check-circle fs-3 text-success" />
                        <div>
                          <strong>มีข้อมูลเกษตรกรในระบบเรียบร้อยแล้ว:</strong>
                          <br />
                          {qrCodeData.book.farmer?.firstName}{' '}
                          {qrCodeData.book.farmer?.lastName}(
                          {qrCodeData.book.farmer?.phone
                            ? formatPhoneNumber(qrCodeData.book.farmer.phone)
                            : '-'}
                          )
                        </div>
                      </div>
                    ) : (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label label-dark">
                            เลขบัตรประชาชน/ผู้ใช้{' '}
                            <span className="text-danger fw-bold">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control form-control-dark ${farmerErrors.thaiNationalId ? 'is-invalid' : ''}`}
                            name="thaiNationalId"
                            value={farmerForm.thaiNationalId}
                            onChange={handleFarmerChange}
                            placeholder="x-xxxx-xxxxx-xx-x"
                          />
                          {farmerErrors.thaiNationalId && (
                            <div className="invalid-feedback">
                              {farmerErrors.thaiNationalId}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label label-dark">
                            เบอร์โทรศัพท์{' '}
                            <span className="text-danger fw-bold">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control form-control-dark ${farmerErrors.phone ? 'is-invalid' : ''}`}
                            name="phone"
                            value={farmerForm.phone}
                            onChange={handleFarmerChange}
                            placeholder="0xx-xxx-xxxx"
                          />
                          {farmerErrors.phone && (
                            <div className="invalid-feedback">
                              {farmerErrors.phone}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label label-dark">
                            ชื่อ <span className="text-danger fw-bold">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control form-control-dark ${farmerErrors.firstName ? 'is-invalid' : ''}`}
                            name="firstName"
                            value={farmerForm.firstName}
                            onChange={handleFarmerChange}
                            placeholder="ชื่อเกษตรกร"
                          />
                          {farmerErrors.firstName && (
                            <div className="invalid-feedback">
                              {farmerErrors.firstName}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label label-dark">
                            นามสกุล{' '}
                            <span className="text-danger fw-bold">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control form-control-dark ${farmerErrors.lastName ? 'is-invalid' : ''}`}
                            name="lastName"
                            value={farmerForm.lastName}
                            onChange={handleFarmerChange}
                            placeholder="นามสกุล"
                          />
                          {farmerErrors.lastName && (
                            <div className="invalid-feedback">
                              {farmerErrors.lastName}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label label-dark">
                            วันเดือนปีเกิด (วดป. เกิด)
                          </label>
                          <input
                            type="date"
                            className="form-control form-control-dark"
                            name="birthDate"
                            value={farmerForm.birthDate || ''}
                            onChange={handleFarmerChange}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label label-dark">
                            โรงงาน{' '}
                            <span className="text-danger fw-bold">*</span>
                          </label>
                          <select
                            className={`form-select form-select-dark ${farmerErrors.factoryId ? 'is-invalid' : ''}`}
                            name="factoryId"
                            value={farmerForm.factoryId ?? 0}
                            onChange={handleFarmerChange}
                          >
                            <option value={0}>-- เลือกโรงงาน --</option>
                            {factories.map(f => (
                              <option key={f.factoryId} value={f.factoryId}>
                                {f.name} ({f.initial})
                              </option>
                            ))}
                          </select>
                          {farmerErrors.factoryId && (
                            <div className="invalid-feedback">
                              {farmerErrors.factoryId}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label label-dark">
                            พื้นที่ส่งเสริม{' '}
                            <span className="text-danger fw-bold">*</span>
                          </label>
                          <select
                            className={`form-select form-select-dark ${farmerErrors.serviceAreaId ? 'is-invalid' : ''}`}
                            name="serviceAreaId"
                            value={farmerForm.serviceAreaId ?? 0}
                            onChange={handleFarmerChange}
                          >
                            <option value={0}>-- เลือกพื้นที่ --</option>
                            {serviceAreas.map(a => (
                              <option
                                key={a.serviceAreaId}
                                value={a.serviceAreaId}
                              >
                                เขต {a.code} {a.name}
                              </option>
                            ))}
                          </select>
                          {farmerErrors.serviceAreaId && (
                            <div className="invalid-feedback">
                              {farmerErrors.serviceAreaId}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <h4 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                      <i className="fas fa-map-marked-alt text-success" />
                      ขั้นตอนที่ 3: บันทึกข้อมูลแปลงปลูก
                    </h4>

                    {qrCodeData.book?.landId ? (
                      <div className="alert alert-success border-0 py-3 mb-4 d-flex align-items-center gap-3 bg-success-subtle text-dark">
                        <i className="fas fa-check-circle fs-3 text-success" />
                        <div>
                          <strong>มีข้อมูลแปลงปลูกในระบบเรียบร้อยแล้ว:</strong>
                          <br />
                          {qrCodeData.book.land?.name} (รหัสแปลง:{' '}
                          {qrCodeData.book.land?.landCode || '-'})
                        </div>
                      </div>
                    ) : (
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label label-dark">
                            ชื่อแปลง{' '}
                            <span className="text-danger fw-bold">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control form-control-dark ${landErrors.name ? 'is-invalid' : ''}`}
                            name="name"
                            value={landForm.name}
                            onChange={handleLandChange}
                            placeholder="เช่น แปลงทิศเหนือ"
                          />
                          {landErrors.name && (
                            <div className="invalid-feedback">
                              {landErrors.name}
                            </div>
                          )}
                        </div>

                        <div className="col-md-4">
                          <label className="form-label label-dark">
                            หมายเลขแปลง (Land Code)
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-dark"
                            name="landCode"
                            value={landForm.landCode}
                            onChange={handleLandChange}
                            placeholder="ระบุหมายเลขแปลง"
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label label-dark">
                            รหัสโควต้าอ้อย (Quota Code)
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-dark"
                            name="quotaCode"
                            value={landForm.quotaCode}
                            onChange={handleLandChange}
                            placeholder="ระบุรหัสโควต้าอ้อย"
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label label-dark">
                            พื้นที่ (ไร่){' '}
                            <span className="text-danger fw-bold">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control form-control-dark ${landErrors.areaSize ? 'is-invalid' : ''}`}
                            name="areaSize"
                            value={landForm.areaSize}
                            onChange={handleLandChange}
                            placeholder="ระบุจำนวนไร่"
                          />
                          {landErrors.areaSize && (
                            <div className="invalid-feedback">
                              {landErrors.areaSize}
                            </div>
                          )}
                        </div>

                        <div className="col-md-4">
                          <label className="form-label label-dark">
                            Latitude (พิกัด)
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-dark"
                            name="latitude"
                            value={landForm.latitude}
                            onChange={handleLandChange}
                            placeholder="13.xxxxxx"
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label label-dark">
                            Longitude (พิกัด)
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-dark"
                            name="longitude"
                            value={landForm.longitude}
                            onChange={handleLandChange}
                            placeholder="100.xxxxxx"
                          />
                        </div>

                        {/* Address Fields */}
                        <div className="col-md-3">
                          <label className="form-label label-dark">
                            จังหวัด{' '}
                            <span className="text-danger fw-bold">*</span>
                          </label>
                          <select
                            className={`form-select form-select-dark ${landErrors.provinceId ? 'is-invalid' : ''}`}
                            name="provinceId"
                            value={landForm.provinceId}
                            onChange={handleLandChange}
                          >
                            <option value="">-- เลือกจังหวัด --</option>
                            {provinces.map(p => (
                              <option key={p.code} value={p.code}>
                                {p.nameTh}
                              </option>
                            ))}
                          </select>
                          {landErrors.provinceId && (
                            <div className="invalid-feedback">
                              {landErrors.provinceId}
                            </div>
                          )}
                        </div>

                        <div className="col-md-3">
                          <label className="form-label label-dark">
                            อำเภอ <span className="text-danger fw-bold">*</span>
                          </label>
                          <select
                            className={`form-select form-select-dark ${landErrors.districtId ? 'is-invalid' : ''}`}
                            name="districtId"
                            value={landForm.districtId}
                            onChange={handleLandChange}
                            disabled={!landForm.provinceId}
                          >
                            <option value="">-- เลือกอำเภอ --</option>
                            {districts.map(d => (
                              <option key={d.code} value={d.code}>
                                {d.nameTh}
                              </option>
                            ))}
                          </select>
                          {landErrors.districtId && (
                            <div className="invalid-feedback">
                              {landErrors.districtId}
                            </div>
                          )}
                        </div>

                        <div className="col-md-3">
                          <label className="form-label label-dark">
                            ตำบล <span className="text-danger fw-bold">*</span>
                          </label>
                          <select
                            className={`form-select form-select-dark ${landErrors.subdistrictCode ? 'is-invalid' : ''}`}
                            name="subdistrictCode"
                            value={landForm.subdistrictCode}
                            onChange={handleLandChange}
                            disabled={!landForm.districtId}
                          >
                            <option value="">-- เลือกตำบล --</option>
                            {subdistricts.map(s => (
                              <option key={s.code} value={s.code}>
                                {s.nameTh}
                              </option>
                            ))}
                          </select>
                          {landErrors.subdistrictCode && (
                            <div className="invalid-feedback">
                              {landErrors.subdistrictCode}
                            </div>
                          )}
                        </div>

                        <div className="col-md-3">
                          <label className="form-label label-dark">
                            รหัสไปรษณีย์{' '}
                            <span className="text-danger fw-bold">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control form-control-dark ${landErrors.zipCode ? 'is-invalid' : ''}`}
                            name="zipCode"
                            value={landForm.zipCode}
                            onChange={handleLandChange}
                            placeholder="รหัสไปรษณีย์"
                          />
                          {landErrors.zipCode && (
                            <div className="invalid-feedback">
                              {landErrors.zipCode}
                            </div>
                          )}
                        </div>

                        <div className="col-12">
                          <label className="form-label label-dark">
                            หมู่บ้าน/ซอย/ถนน
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-dark"
                            name="village"
                            value={landForm.village}
                            onChange={handleLandChange}
                            placeholder="ระบุข้อมูลที่อยู่แปลงเพิ่มเติม"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Ready to Receive */}
                {currentStep === 4 && (
                  <div className="py-5 text-center">
                    <div className="mb-4">
                      <i
                        className="fas fa-check-circle text-success"
                        style={{ fontSize: '4.5rem' }}
                      />
                    </div>
                    <h3 className="fw-bold text-dark mb-2">
                      ข้อมูลครบถ้วนและเชื่อมโยงสำเร็จ
                    </h3>
                    <p className="text-muted fs-5 mb-4">
                      ระบบได้บันทึกข้อมูลเกษตรกรและแปลงปลูก
                      พร้อมสำหรับขั้นตอนการรับตัวอย่างดินเข้าห้องแล็บแล้ว
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <button
                        type="button"
                        className="btn btn-success btn-lg px-5 py-3 fw-bold shadow"
                        onClick={() => {
                          onSuccess();
                          onClose();
                        }}
                      >
                        <i className="fas fa-arrow-right me-2" />
                        ไปที่ขั้นตอนรับตัวอย่างดิน
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              {currentStep < 4 && (
                <div className="d-flex justify-content-between border-top pt-3 mt-4">
                  <div className="d-flex gap-2">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4 py-2"
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        disabled={loading}
                      >
                        <i className="fas fa-arrow-left me-2" />
                        ย้อนกลับ
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline-danger px-4 py-2"
                      onClick={onClose}
                    >
                      ยกเลิก
                    </button>
                  </div>

                  <div>
                    {currentStep === 1 && (
                      <button
                        type="button"
                        className="btn btn-primary px-5 py-2 fw-bold"
                        onClick={() => {
                          const step = qrCodeData.book?.farmerId ? 3 : 2;
                          setCurrentStep(step);
                        }}
                      >
                        ดำเนินการต่อ
                        <i className="fas fa-arrow-right ms-2" />
                      </button>
                    )}

                    {currentStep === 2 && (
                      <>
                        {qrCodeData.book?.farmerId ? (
                          <button
                            type="button"
                            className="btn btn-primary px-5 py-2 fw-bold"
                            onClick={() => setCurrentStep(3)}
                          >
                            ถัดไป (แปลงปลูก)
                            <i className="fas fa-arrow-right ms-2" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-success px-5 py-2 fw-bold"
                            onClick={submitFarmer}
                            disabled={loading}
                          >
                            {loading
                              ? 'กำลังบันทึก...'
                              : 'บันทึกเกษตรกร & ถัดไป'}
                            <i className="fas fa-chevron-right ms-2" />
                          </button>
                        )}
                      </>
                    )}

                    {currentStep === 3 && (
                      <>
                        {qrCodeData.book?.landId ? (
                          <button
                            type="button"
                            className="btn btn-success px-5 py-2 fw-bold"
                            onClick={() => {
                              setCurrentStep(4);
                            }}
                          >
                            เสร็จสิ้นข้อมูล
                            <i className="fas fa-check-double ms-2" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-success px-5 py-2 fw-bold"
                            onClick={submitLand}
                            disabled={loading}
                          >
                            {loading
                              ? 'กำลังบันทึก...'
                              : 'บันทึกแปลง & ยืนยันข้อมูล'}
                            <i className="fas fa-check-circle ms-2" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionWizardModal;
