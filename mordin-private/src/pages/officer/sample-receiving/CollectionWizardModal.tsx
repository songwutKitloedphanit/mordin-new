import React, { useEffect, useMemo, useState } from 'react';

import { getDistrictsByProvinceCode } from '@/services/api/address/DistrictApi';
import { getAllProvinces } from '@/services/api/address/ProvinceApi';
import { getSubdistrictsByDistrictCode } from '@/services/api/address/SubdistrictApi';
import {
  createFarmer,
  getFarmerById,
  searchFarmers,
} from '@/services/api/FarmerApi';
import { createLand } from '@/services/api/LandApi';
import { settingOwnerData } from '@/services/api/qr-code/BookApi';
import {
  getAllFactories,
  getFactoryById,
} from '@/services/api/service-area/FactoryApi';
import { getServiceAreaById } from '@/services/api/service-area/ServiceAreaApi';
import { District, Province, Subdistrict } from '@/types/address';
import { FarmerCreateInput, FarmerInfo } from '@/types/Farmer';
import { LandInfoInterface } from '@/types/Land';
import { QrCodeInfo } from '@/types/qr-code/QrCode';
import { FactoryInfoInterface } from '@/types/service-area/Factories';
import { ServiceAreaInterface } from '@/types/service-area/ServiceAreas';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';
import { swalError, swalSuccessTimer } from '@/utils/swal';
import LeafletMapPicker from '@/components/map/LeafletMapMarker';

interface CollectionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  qrCodeData: QrCodeInfo;
  startStep: number;
}

type LandFormState = {
  name: string;
  landCode: string;
  quotaCode: string;
  areaSize: string;
  provinceId: string;
  districtId: string;
  subdistrictCode: string;
  zipCode: string;
  village: string;
  latitude: string;
  longitude: string;
};
const normalizeDigits = (value?: string | null) =>
  String(value ?? '').replace(/\D/g, '');

const normalizeLandCode = (value?: string | null) =>
  String(value ?? '').trim();


const formatIDCard = (value: string) => {
  const cleaned = normalizeDigits(value).slice(0, 13);
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
  const cleaned = normalizeDigits(value).slice(0, 10);
  let formatted = cleaned;
  if (cleaned.length > 3)
    formatted = cleaned.slice(0, 3) + '-' + cleaned.slice(3);
  if (cleaned.length > 6)
    formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
  return formatted;
};

const uniqueFarmers = (farmers: FarmerInfo[]) =>
  farmers.filter(
    (farmer, index, list) =>
      list.findIndex(item => item.farmerId === farmer.farmerId) === index
  );

const getInitialStep = (qrCodeData: QrCodeInfo, startStep: number) => {
  if (startStep >= 1 && startStep <= 4) return startStep;
  if (!qrCodeData.book?.farmerId) return 2;
  if (!qrCodeData.book?.landId) return 3;
  return 1;
};

const getQrBirthDate = (qrCodeData: QrCodeInfo) => {
  const data = qrCodeData as QrCodeInfo & {
    birthDate?: string;
    dateOfBirth?: string;
    dob?: string;
  };

  return (
    data.birthDate ||
    data.dateOfBirth ||
    data.dob ||
    qrCodeData.book?.farmer?.birthDate ||
    ''
  );
};

const getQrFactoryId = (qrCodeData: QrCodeInfo) =>
  qrCodeData.book?.serviceArea?.factoryId ??
  qrCodeData.serviceArea?.factoryId ??
  qrCodeData.book?.farmer?.factoryId ??
  null;

const getQrServiceAreaId = (qrCodeData: QrCodeInfo) =>
  qrCodeData.book?.serviceAreaId ??
  qrCodeData.serviceAreaId ??
  qrCodeData.book?.farmer?.serviceAreaId ??
  null;

const getQrAreaSize = (qrCodeData: QrCodeInfo) => {
  const data = qrCodeData as QrCodeInfo & {
    areaSize?: number | string | null;
  };

  return data.areaSize ?? qrCodeData.book?.areaSize ?? qrCodeData.book?.land?.areaSize ?? '';
};

const buildFarmerForm = (
  qrCodeData: QrCodeInfo,
  defaultFactoryId: number | null = null
): FarmerCreateInput => ({
  thaiNationalId: qrCodeData.thaiNationalId
    ? formatIDCard(qrCodeData.thaiNationalId)
    : '',
  thaiFarmerId: qrCodeData.book?.farmer?.thaiFarmerId ?? '',
  phone: qrCodeData.phoneNumber
    ? formatPhoneNumber(qrCodeData.phoneNumber)
    : qrCodeData.book?.farmer?.phone
      ? formatPhoneNumber(qrCodeData.book.farmer.phone)
      : '',
  firstName: qrCodeData.firstName || qrCodeData.book?.farmer?.firstName || '',
  lastName: qrCodeData.lastName || qrCodeData.book?.farmer?.lastName || '',
  birthDate: getQrBirthDate(qrCodeData),
  factoryId: getQrFactoryId(qrCodeData) ?? defaultFactoryId,
  serviceAreaId: getQrServiceAreaId(qrCodeData),
});

const buildLandForm = (qrCodeData: QrCodeInfo): LandFormState => {
  const book = qrCodeData.book;
  const land = book?.land;
  const subdistrict = book?.subdistrict ?? land?.subdistrict;
  const district = subdistrict?.district;
  const province = district?.province;

  const dataExt = qrCodeData as QrCodeInfo & {
    subdistrictCode?: string | number;
    zipCode?: string | number;
    districtId?: string | number;
    provinceId?: string | number;
    quotaCode?: string;
  };

  const resolvedSubdistrictCode = String(dataExt.subdistrictCode ?? book?.subdistrictCode ?? subdistrict?.code ?? '');
  let derivedProvinceId = String(dataExt.provinceId ?? province?.code ?? '');
  let derivedDistrictId = String(dataExt.districtId ?? district?.code ?? '');

  if (resolvedSubdistrictCode.length === 6) {
    if (!derivedProvinceId) derivedProvinceId = resolvedSubdistrictCode.substring(0, 2);
    if (!derivedDistrictId) derivedDistrictId = resolvedSubdistrictCode.substring(0, 4);
  }

  const qrAreaSize = getQrAreaSize(qrCodeData);
  const areaSizeStr = qrAreaSize !== null && qrAreaSize !== undefined && String(qrAreaSize).trim() !== '' ? String(qrAreaSize) : '';

  return {
    name: qrCodeData.landName || land?.name || '',
    landCode: qrCodeData.landCode || land?.landCode || '',
    quotaCode: dataExt.quotaCode || land?.quotaCode || book?.farmer?.thaiFarmerId || '',
    areaSize: areaSizeStr,
    provinceId: derivedProvinceId,
    districtId: derivedDistrictId,
    subdistrictCode: resolvedSubdistrictCode,
    zipCode: String(dataExt.zipCode ?? book?.zipCode ?? land?.zipCode ?? subdistrict?.zipCode ?? ''),
    village: land?.village || '',
    latitude: String(land?.latitude ?? book?.latitude ?? ''),
    longitude: String(land?.longitude ?? book?.longitude ?? ''),
  };
};

const CollectionWizardModal: React.FC<CollectionWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  qrCodeData,
  startStep,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [factories, setFactories] = useState<FactoryInfoInterface[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaInterface[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);
  const [farmerForm, setFarmerForm] = useState<FarmerCreateInput>(
    buildFarmerForm(qrCodeData)
  );
  const [landForm, setLandForm] = useState<LandFormState>(
    buildLandForm(qrCodeData)
  );
  const [farmerId, setFarmerId] = useState<number | null>(
    qrCodeData.book?.farmerId ?? null
  );
  const [farmerErrors, setFarmerErrors] = useState<Record<string, string>>({});
  const [landErrors, setLandErrors] = useState<Record<string, string>>({});
  const [farmerCandidates, setFarmerCandidates] = useState<FarmerInfo[]>([]);
  const [farmerSearchDone, setFarmerSearchDone] = useState(false);
  const [landCandidates, setLandCandidates] = useState<LandInfoInterface[]>([]);
  const [landSearchDone, setLandSearchDone] = useState(false);

  const setMapLocation = (val: React.SetStateAction<{ lat: number; lng: number } | null>) => {
    if (typeof val === 'function') {
      const currentLoc = landForm.latitude && landForm.longitude
        ? { lat: Number(landForm.latitude), lng: Number(landForm.longitude) }
        : null;
      const newLoc = val(currentLoc);
      setLandForm(prev => ({
        ...prev,
        latitude: newLoc ? String(newLoc.lat) : '',
        longitude: newLoc ? String(newLoc.lng) : '',
      }));
    } else {
      setLandForm(prev => ({
        ...prev,
        latitude: val ? String(val.lat) : '',
        longitude: val ? String(val.lng) : '',
      }));
    }
  };

  const bookId = qrCodeData.book?.bookId;
  const serviceTypeId =
    qrCodeData.book?.serviceTypeId ?? qrCodeData.serviceTypeId ?? null;

  const steps = useMemo(
    () => [
      { id: 1, label: 'ตรวจ QR', icon: 'fas fa-qrcode' },
      { id: 2, label: 'เกษตรกร', icon: 'fas fa-user' },
      { id: 3, label: 'แปลง', icon: 'fas fa-map-pin' },
      { id: 4, label: 'พร้อมรับ', icon: 'fas fa-check' },
    ],
    []
  );

  useEffect(() => {
    if (!isOpen) return;

    setCurrentStep(getInitialStep(qrCodeData, startStep));
    setFarmerForm(buildFarmerForm(qrCodeData));
    setLandForm(buildLandForm(qrCodeData));
    setFarmerId(qrCodeData.book?.farmerId ?? null);
    setFarmerErrors({});
    setLandErrors({});
    setFarmerCandidates([]);
    setFarmerSearchDone(false);
    setLandCandidates([]);
    setLandSearchDone(false);
  }, [isOpen, qrCodeData, startStep]);

  useEffect(() => {
    if (!isOpen) return;

    const loadMetadata = async () => {
      try {
        const [factoryList, provinceList] = await Promise.all([
          getAllFactories(),
          getAllProvinces(),
        ]);
        const qrServiceAreaId = getQrServiceAreaId(qrCodeData);
        let resolvedFactoryId = getQrFactoryId(qrCodeData);

        if (qrServiceAreaId && !resolvedFactoryId) {
          try {
            const serviceArea = await getServiceAreaById(qrServiceAreaId);
            resolvedFactoryId = serviceArea?.factoryId ?? null;
          } catch (error) {
            console.error('Cannot resolve service area factory:', error);
          }
        }

        setFactories(factoryList);
        setProvinces(provinceList);
        setFarmerForm(prev => ({
          ...prev,
          birthDate: prev.birthDate || getQrBirthDate(qrCodeData),
          factoryId:
            prev.factoryId ||
            resolvedFactoryId ||
            factoryList[0]?.factoryId ||
            null,
          serviceAreaId: prev.serviceAreaId || qrServiceAreaId || null,
        }));
      } catch (error) {
        console.error('Cannot load wizard metadata:', error);
        swalError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลตั้งต้นได้');
      }
    };

    loadMetadata();
  }, [isOpen, qrCodeData]);

  useEffect(() => {
    const loadServiceAreas = async () => {
      if (!farmerForm.factoryId) {
        setServiceAreas([]);
        return;
      }

      try {
        const factory = await getFactoryById(Number(farmerForm.factoryId));
        const areas = factory.serviceAreas ?? [];
        setServiceAreas(areas);
        setFarmerForm(prev => ({
          ...prev,
          serviceAreaId: areas.some(
            (area: ServiceAreaInterface) =>
              area.serviceAreaId === prev.serviceAreaId
          )
            ? prev.serviceAreaId
            : (areas[0]?.serviceAreaId ?? null),
        }));
      } catch (error) {
        console.error('Cannot load service areas:', error);
      }
    };

    loadServiceAreas();
  }, [farmerForm.factoryId]);

  useEffect(() => {
    const loadDistricts = async () => {
      if (!landForm.provinceId) {
        setDistricts([]);
        return;
      }

      try {
        const districtList = await getDistrictsByProvinceCode(
          Number(landForm.provinceId)
        );
        setDistricts(districtList);
      } catch (error) {
        console.error('Cannot load districts:', error);
      }
    };

    loadDistricts();
  }, [landForm.provinceId]);

  useEffect(() => {
    const loadSubdistricts = async () => {
      if (!landForm.districtId) {
        setSubdistricts([]);
        return;
      }

      try {
        const subdistrictList = await getSubdistrictsByDistrictCode(
          Number(landForm.districtId)
        );
        setSubdistricts(subdistrictList);
      } catch (error) {
        console.error('Cannot load subdistricts:', error);
      }
    };

    loadSubdistricts();
  }, [landForm.districtId]);

  useEffect(() => {
    if (!landForm.subdistrictCode) return;
    const matched = subdistricts.find(
      item => String(item.code) === String(landForm.subdistrictCode)
    );
    if (!matched?.zipCode) return;

    setLandForm(prev => ({ ...prev, zipCode: String(matched.zipCode) }));
  }, [landForm.subdistrictCode, subdistricts]);

  useEffect(() => {
    if (
      !isOpen ||
      currentStep !== 2 ||
      qrCodeData.book?.farmerId ||
      farmerSearchDone
    ) {
      return;
    }

    const searchExistingFarmer = async () => {
      const terms = Array.from(
        new Set(
          [
            normalizeDigits(qrCodeData.thaiNationalId),
            normalizeDigits(qrCodeData.phoneNumber),
            `${qrCodeData.firstName ?? ''} ${qrCodeData.lastName ?? ''}`.trim(),
          ].filter(Boolean)
        )
      );

      if (!terms.length) {
        setFarmerSearchDone(true);
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(
          terms.map(term => searchFarmers({ search: term, all: true }))
        );
        const farmers = uniqueFarmers(
          results.flatMap(result =>
            Array.isArray(result?.data) ? result.data : []
          )
        );
        setFarmerCandidates(farmers);
      } catch (error) {
        console.error('Cannot search existing farmers:', error);
      } finally {
        setFarmerSearchDone(true);
        setLoading(false);
      }
    };

    searchExistingFarmer();
  }, [currentStep, farmerSearchDone, isOpen, qrCodeData]);

  useEffect(() => {
    if (!isOpen || currentStep !== 3 || !farmerId || landSearchDone) return;

    const searchExistingLand = async () => {
      setLoading(true);
      try {
        const farmer = await getFarmerById(farmerId);
        const lands: LandInfoInterface[] = Array.isArray(farmer?.lands)
          ? farmer.lands
          : [];
        const qrLandCode = normalizeLandCode(qrCodeData.landCode);
        const exactMatches = qrLandCode
          ? lands.filter(
              (land: LandInfoInterface) =>
                normalizeLandCode(land.landCode) === qrLandCode
            )
          : [];
        const otherLands = lands.filter(
          (land: LandInfoInterface) =>
            !exactMatches.some(match => match.landId === land.landId)
        );
        setLandCandidates([...exactMatches, ...otherLands]);
      } catch (error) {
        console.error('Cannot search existing lands:', error);
      } finally {
        setLandSearchDone(true);
        setLoading(false);
      }
    };

    searchExistingLand();
  }, [currentStep, farmerId, landSearchDone, isOpen, qrCodeData.landCode]);

  if (!isOpen) return null;

  const handleFarmerChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === 'thaiNationalId') {
      setFarmerForm(prev => ({ ...prev, thaiNationalId: formatIDCard(value) }));
      return;
    }
    if (name === 'phone') {
      setFarmerForm(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
      return;
    }
    if (name === 'factoryId' || name === 'serviceAreaId') {
      setFarmerForm(prev => ({ ...prev, [name]: Number(value) || null }));
      return;
    }
    setFarmerForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLandChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setLandForm(prev => {
      if (name === 'provinceId') {
        return {
          ...prev,
          provinceId: value,
          districtId: '',
          subdistrictCode: '',
          zipCode: '',
        };
      }
      if (name === 'districtId') {
        return { ...prev, districtId: value, subdistrictCode: '', zipCode: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const linkFarmer = async (selectedFarmerId: number) => {
    if (!bookId) {
      swalError('เกิดข้อผิดพลาด', 'ไม่พบรหัสการจองสำหรับผูกเกษตรกร');
      return;
    }

    setLoading(true);
    try {
      await settingOwnerData(bookId, { farmerId: selectedFarmerId });
      setFarmerId(selectedFarmerId);
      setLandSearchDone(false);
      setCurrentStep(3);
      await swalSuccessTimer('สำเร็จ', 'ผูกข้อมูลเกษตรกรเรียบร้อยแล้ว');
    } catch (error) {
      console.error(error);
      swalError('เกิดข้อผิดพลาด', 'ไม่สามารถผูกข้อมูลเกษตรกรได้');
    } finally {
      setLoading(false);
    }
  };

  const submitFarmer = async () => {
    const errors: Record<string, string> = {};
    const cardDigits = normalizeDigits(farmerForm.thaiNationalId);
    const phoneDigits = normalizeDigits(farmerForm.phone);

    if (!cardDigits) errors.thaiNationalId = 'กรุณาระบุเลขบัตร';
    if (!farmerForm.firstName?.trim()) errors.firstName = 'กรุณาระบุชื่อ';
    if (!farmerForm.lastName?.trim()) errors.lastName = 'กรุณาระบุนามสกุล';
    if (!phoneDigits) errors.phone = 'กรุณาระบุเบอร์โทรศัพท์';
    if (!farmerForm.factoryId) errors.factoryId = 'กรุณาเลือกโรงงาน';
    if (!farmerForm.serviceAreaId) errors.serviceAreaId = 'กรุณาเลือกพื้นที่';

    if (Object.keys(errors).length) {
      setFarmerErrors(errors);
      return;
    }

    setFarmerErrors({});
    setLoading(true);
    try {
      const isNationalId = cardDigits.length === 13;
      const createdFarmer = await createFarmer({
        ...farmerForm,
        thaiNationalId: isNationalId ? cardDigits : '',
        thaiFarmerId: isNationalId ? '' : cardDigits,
        phone: phoneDigits,
        birthDate: farmerForm.birthDate || undefined,
      });

      await linkFarmer(createdFarmer.farmerId);
    } catch (error: unknown) {
      console.error(error);
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message =
        err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลเกษตรกรได้';
      swalError(
        'เกิดข้อผิดพลาด',
        Array.isArray(message) ? message.join(', ') : message
      );
    } finally {
      setLoading(false);
    }
  };

  const linkLand = async (land: LandInfoInterface) => {
    if (!bookId || !farmerId) {
      swalError('เกิดข้อผิดพลาด', 'ข้อมูลสำหรับผูกแปลงไม่ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      await settingOwnerData(bookId, {
        farmerId,
        landId: land.landId,
        serviceTypeId,
        latitude:
          land.latitude !== undefined && land.latitude !== null
            ? String(land.latitude)
            : landForm.latitude || null,
        longitude:
          land.longitude !== undefined && land.longitude !== null
            ? String(land.longitude)
            : landForm.longitude || null,
      });
      setCurrentStep(4);
      await swalSuccessTimer('สำเร็จ', 'ผูกข้อมูลแปลงเรียบร้อยแล้ว');
    } catch (error) {
      console.error(error);
      swalError('เกิดข้อผิดพลาด', 'ไม่สามารถผูกข้อมูลแปลงได้');
    } finally {
      setLoading(false);
    }
  };

  const submitLand = async () => {
    const errors: Record<string, string> = {};

    if (!farmerId) errors.farmerId = 'กรุณายืนยันเกษตรกรก่อน';
    if (!landForm.name.trim()) errors.name = 'กรุณากรอกชื่อแปลง';
    if (!landForm.areaSize) errors.areaSize = 'กรุณากรอกพื้นที่';
    if (Number(landForm.areaSize) <= 0 || Number.isNaN(Number(landForm.areaSize))) {
      errors.areaSize = 'พื้นที่ต้องเป็นตัวเลขมากกว่า 0';
    }
    if (!landForm.provinceId) errors.provinceId = 'กรุณาเลือกจังหวัด';
    if (!landForm.districtId) errors.districtId = 'กรุณาเลือกอำเภอ';
    if (!landForm.subdistrictCode) errors.subdistrictCode = 'กรุณาเลือกตำบล';
    if (!landForm.zipCode) errors.zipCode = 'กรุณากรอกรหัสไปรษณีย์';

    if (Object.keys(errors).length) {
      setLandErrors(errors);
      return;
    }

    setLandErrors({});
    setLoading(true);
    try {
      const createdLand = await createLand({
        landCode: landForm.landCode.trim() || undefined,
        name: landForm.name.trim(),
        quotaCode: landForm.quotaCode.trim() || undefined,
        areaSize: Number(landForm.areaSize),
        latitude: landForm.latitude.trim() || undefined,
        longitude: landForm.longitude.trim() || undefined,
        subdistrictCode: landForm.subdistrictCode,
        zipCode: Number(landForm.zipCode),
        village: landForm.village.trim() || undefined,
        farmerId: Number(farmerId),
      });

      if (bookId) {
        await settingOwnerData(bookId, {
          farmerId: Number(farmerId),
          landId: Number(createdLand.landId),
          serviceTypeId,
          latitude: landForm.latitude.trim() || null,
          longitude: landForm.longitude.trim() || null,
        });
      }

      setCurrentStep(4);
      await swalSuccessTimer('สำเร็จ', 'บันทึกและผูกข้อมูลแปลงเรียบร้อยแล้ว');
    } catch (error: unknown) {
      console.error(error);
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message =
        err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลแปลงได้';
      swalError(
        'เกิดข้อผิดพลาด',
        Array.isArray(message) ? message.join(', ') : message
      );
    } finally {
      setLoading(false);
    }
  };

  const stepClass = (stepId: number) => {
    if (currentStep > stepId) return 'flow-step done';
    if (currentStep === stepId) return 'flow-step now';
    return 'flow-step';
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.62)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header">
            <div>
              <h5 className="modal-title fw-bold">
                ตรวจและเพิ่มข้อมูลจาก QR
              </h5>
              <div className="text-muted small">
                เจ้าหน้าที่ตรวจข้อมูล แก้ไขได้ แล้วกดยืนยันทีละขั้น
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          <div className="modal-body">
            <div className="flow mb-4">
              {steps.map(step => (
                <div key={step.id} className={stepClass(step.id)}>
                  <div className="flow-dot">
                    {currentStep > step.id ? (
                      <i className="fas fa-check" />
                    ) : (
                      <i className={step.icon} />
                    )}
                  </div>
                  <span className="flow-label">{step.label}</span>
                </div>
              ))}
            </div>

            {currentStep === 1 && (
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="border rounded p-3 h-100">
                    <h6 className="fw-bold mb-3">ข้อมูลเกษตรกรจาก QR</h6>
                    <InfoRow label="เลขบัตร" value={qrCodeData.thaiNationalId} />
                    <InfoRow
                      label="ชื่อ"
                      value={`${qrCodeData.firstName ?? ''} ${qrCodeData.lastName ?? ''}`}
                    />
                    <InfoRow label="เบอร์โทร" value={qrCodeData.phoneNumber} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3 h-100">
                    <h6 className="fw-bold mb-3">ข้อมูลแปลงจาก QR</h6>
                    <InfoRow label="รหัสแปลง" value={qrCodeData.landCode} />
                    <InfoRow label="ชื่อแปลง" value={qrCodeData.landName} />
                    <InfoRow
                      label="พื้นที่"
                      value={
                        qrCodeData.book?.areaSize
                          ? `${qrCodeData.book.areaSize} ไร่`
                          : ''
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="row g-4">
                <div className="col-lg-5">
                  <h6 className="fw-bold mb-2">ค้นหาข้อมูลเดิมก่อนสร้างใหม่</h6>
                  {loading && !farmerSearchDone ? (
                    <div className="text-muted small">กำลังค้นหา...</div>
                  ) : farmerCandidates.length ? (
                    <div className="d-flex flex-column gap-2">
                      {farmerCandidates.map(farmer => (
                        <div
                          key={farmer.farmerId}
                          className="border rounded p-3 d-flex justify-content-between gap-3"
                        >
                          <div>
                            <div className="fw-bold">
                              {farmer.firstName} {farmer.lastName}
                            </div>
                            <div className="small text-muted">
                              {formatThaiNationalId(
                                farmer.thaiNationalId ?? ''
                              ) || '-'}{' '}
                              | {farmer.phone || '-'}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => linkFarmer(farmer.farmerId)}
                            disabled={loading}
                          >
                            ใช้ข้อมูลนี้
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info py-2 small mb-0">
                      ไม่พบเกษตรกรเดิมจากข้อมูล QR สามารถสร้างใหม่ได้
                    </div>
                  )}
                </div>

                <div className="col-lg-7">
                  <h6 className="fw-bold mb-2">ฟอร์มเกษตรกร</h6>
                  <div className="row g-3">
                    <TextField
                      label="เลขบัตร"
                      name="thaiNationalId"
                      value={farmerForm.thaiNationalId ?? ''}
                      onChange={handleFarmerChange}
                      error={farmerErrors.thaiNationalId}
                      required
                    />
                    <TextField
                      label="ชื่อ"
                      name="firstName"
                      value={farmerForm.firstName ?? ''}
                      onChange={handleFarmerChange}
                      error={farmerErrors.firstName}
                      required
                    />
                    <TextField
                      label="นามสกุล"
                      name="lastName"
                      value={farmerForm.lastName ?? ''}
                      onChange={handleFarmerChange}
                      error={farmerErrors.lastName}
                      required
                    />
                    <TextField
                      label="เบอร์โทร"
                      name="phone"
                      value={farmerForm.phone ?? ''}
                      onChange={handleFarmerChange}
                      error={farmerErrors.phone}
                      required
                    />
                    <TextField
                      label="วันเกิด"
                      name="birthDate"
                      type="date"
                      value={farmerForm.birthDate ?? ''}
                      onChange={handleFarmerChange}
                    />
                    <div className="col-md-6">
                      <label className="form-label">
                        โรงงาน <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${
                          farmerErrors.factoryId ? 'is-invalid' : ''
                        }`}
                        name="factoryId"
                        value={farmerForm.factoryId ?? ''}
                        onChange={handleFarmerChange}
                      >
                        <option value="">-- เลือกโรงงาน --</option>
                        {factories.map(factory => (
                          <option
                            key={factory.factoryId}
                            value={factory.factoryId}
                          >
                            {factory.name} ({factory.initial})
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
                      <label className="form-label">
                        พื้นที่ <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${
                          farmerErrors.serviceAreaId ? 'is-invalid' : ''
                        }`}
                        name="serviceAreaId"
                        value={farmerForm.serviceAreaId ?? ''}
                        onChange={handleFarmerChange}
                      >
                        <option value="">-- เลือกพื้นที่ --</option>
                        {serviceAreas.map(area => (
                          <option
                            key={area.serviceAreaId}
                            value={area.serviceAreaId}
                          >
                            เขต {area.code} {area.name}
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
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="row g-4">
                <div className="col-lg-5">
                  <h6 className="fw-bold mb-2">ตรวจแปลงเดิมของเกษตรกร</h6>
                  {landErrors.farmerId && (
                    <div className="alert alert-warning py-2">
                      {landErrors.farmerId}
                    </div>
                  )}
                  {loading && !landSearchDone ? (
                    <div className="text-muted small">กำลังค้นหา...</div>
                  ) : landCandidates.length ? (
                    <div className="d-flex flex-column gap-2">
                      {landCandidates.map(land => {
                        const isExact =
                          normalizeLandCode(land.landCode) ===
                          normalizeLandCode(qrCodeData.landCode);
                        return (
                          <div
                            key={land.landId}
                            className="border rounded p-3 d-flex justify-content-between gap-3"
                          >
                            <div>
                              <div className="fw-bold">
                                {land.name}{' '}
                                {isExact && (
                                  <span className="badge bg-success ms-1">
                                    ตรงกับ QR
                                  </span>
                                )}
                              </div>
                              <div className="small text-muted">
                                {land.landCode || '-'} | {land.areaSize} ไร่
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => linkLand(land)}
                              disabled={loading}
                            >
                              ใช้แปลงนี้
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="alert alert-info py-2 small mb-0">
                      ไม่พบแปลงเดิมที่ตรงกับ QR สามารถสร้างแปลงใหม่ได้
                    </div>
                  )}

                  <div className="mt-4">
                    <h6 className="fw-bold mb-2">แผนที่พิกัดแปลง</h6>
                    <LeafletMapPicker
                      center={landForm.latitude && landForm.longitude ? { lat: Number(landForm.latitude), lng: Number(landForm.longitude) } : null}
                      onChange={(pos) => setMapLocation({ lat: pos.lat, lng: pos.lng })}
                    />
                  </div>
                </div>

                <div className="col-lg-7">
                  <h6 className="fw-bold mb-2">ฟอร์มแปลง</h6>
                  <div className="row g-3">
                    <TextField
                      label="ชื่อแปลง"
                      name="name"
                      value={landForm.name}
                      onChange={handleLandChange}
                      error={landErrors.name}
                      required
                    />
                    <TextField
                      label="รหัสแปลง"
                      name="landCode"
                      value={landForm.landCode}
                      onChange={handleLandChange}
                    />
                    <TextField
                      label="รหัสโควต้า"
                      name="quotaCode"
                      value={landForm.quotaCode}
                      onChange={handleLandChange}
                    />
                    <TextField
                      label="พื้นที่ (ไร่)"
                      name="areaSize"
                      value={landForm.areaSize}
                      onChange={handleLandChange}
                      error={landErrors.areaSize}
                      required
                    />
                    <SelectField
                      label="จังหวัด"
                      name="provinceId"
                      value={landForm.provinceId}
                      options={provinces.map(province => ({
                        value: province.code,
                        label: province.nameTh,
                      }))}
                      onChange={handleLandChange}
                      error={landErrors.provinceId}
                      required
                    />
                    <SelectField
                      label="อำเภอ"
                      name="districtId"
                      value={landForm.districtId}
                      options={districts.map(district => ({
                        value: district.code,
                        label: district.nameTh,
                      }))}
                      onChange={handleLandChange}
                      error={landErrors.districtId}
                      required
                      disabled={!landForm.provinceId}
                    />
                    <SelectField
                      label="ตำบล"
                      name="subdistrictCode"
                      value={landForm.subdistrictCode}
                      options={subdistricts.map(subdistrict => ({
                        value: subdistrict.code,
                        label: subdistrict.nameTh,
                      }))}
                      onChange={handleLandChange}
                      error={landErrors.subdistrictCode}
                      required
                      disabled={!landForm.districtId}
                    />
                    <TextField
                      label="รหัสไปรษณีย์"
                      name="zipCode"
                      value={landForm.zipCode}
                      onChange={handleLandChange}
                      error={landErrors.zipCode}
                      required
                    />
                    <div className="col-12">
                      <label className="form-label">หมู่บ้าน/ที่อยู่เพิ่มเติม</label>
                      <input
                        className="form-control"
                        name="village"
                        value={landForm.village}
                        onChange={handleLandChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center py-5">
                <i
                  className="fas fa-check-circle text-success mb-3"
                  style={{ fontSize: '4rem' }}
                />
                <h4 className="fw-bold">ข้อมูลครบถ้วนแล้ว</h4>
                <p className="text-muted mb-0">
                  ระบบผูกเกษตรกรและแปลงกับ QR นี้แล้ว กลับไปตรวจอีกครั้งก่อนกดยืนยันรับตัวอย่าง
                </p>
              </div>
            )}
          </div>

          <div className="modal-footer d-flex justify-content-between">
            <div className="d-flex gap-2">
              {currentStep > 1 && currentStep < 4 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={loading}
                >
                  ย้อนกลับ
                </button>
              )}
            </div>

            {currentStep === 1 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(qrCodeData.book?.farmerId ? 3 : 2)}
              >
                ดำเนินการต่อ
              </button>
            )}
            {currentStep === 2 && (
              <button
                type="button"
                className="btn btn-success"
                onClick={submitFarmer}
                disabled={loading}
              >
                {loading ? 'กำลังบันทึก...' : 'สร้างเกษตรกรใหม่'}
              </button>
            )}
            {currentStep === 3 && (
              <button
                type="button"
                className="btn btn-success"
                onClick={submitLand}
                disabled={loading || !farmerId}
              >
                {loading ? 'กำลังบันทึก...' : 'สร้างแปลงใหม่'}
              </button>
            )}
            {currentStep === 4 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onSuccess}
              >
                กลับไปหน้ารับตัวอย่าง
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div className="d-flex justify-content-between gap-3 py-1 border-bottom">
    <span className="text-muted">{label}</span>
    <span className="fw-semibold text-end">{value || '-'}</span>
  </div>
);

const TextField = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  type = 'text',
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
  required?: boolean;
  type?: string;
}) => (
  <div className="col-md-6">
    <label className="form-label">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <input
      type={type}
      className={`form-control ${error ? 'is-invalid' : ''}`}
      name={name}
      value={value}
      onChange={onChange}
    />
    {error && <div className="invalid-feedback">{error}</div>}
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  options,
  onChange,
  error,
  required = false,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  options: { value: string | number; label: string }[];
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}) => (
  <div className="col-md-6">
    <label className="form-label">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <select
      className={`form-select ${error ? 'is-invalid' : ''}`}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <option value="">-- เลือก{label} --</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <div className="invalid-feedback">{error}</div>}
  </div>
);

export default CollectionWizardModal;
