import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import { GenFormSelect, GenFormText1 } from '../../components/gui/GuiForm';
import { getDistrictsByProvinceCode } from '../../services/api/address/DistrictApi';
import { getAllProvinces } from '../../services/api/address/ProvinceApi';
import { getSubdistrictsByDistrictCode } from '../../services/api/address/SubdistrictApi';
import { publicLookupFarmerByNamePhone } from '../../services/api/FarmerApi';
import { createPublicLandByFarmer } from '../../services/api/LandApi';
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
import { District, Province, Subdistrict } from '../../types/address';
import { FarmerPublicLand, FarmerPublicProfile } from '../../types/Farmer';
import { CollectSampleInput } from '../../types/qr-code/CollectSample';
import { QrCode, SampleStatusEnum } from '../../types/qr-code/QrCode';
import { FactoryInfoInterface } from '../../types/service-area/Factories';
import { ServiceAreaInterface } from '../../types/service-area/ServiceAreas';
import { ServiceType } from '../../types/service-type/ServiceTypes';
import { formatThaiNationalId } from '../../utils/IdentificationNumberFormat';
import { formatPhoneNumber } from '../../utils/PhoneNumberFormat';

import LeafletMapPicker from '@/components/map/LeafletMapMarker';

type LatLng = { lat: number; lng: number };
type CollectSampleMode = 'choice' | 'first_time' | 'returning';

const normalizeDigits = (value: string) => value.replace(/\D/g, '');

const parseCoordinate = (
  value: unknown,
  min: number,
  max: number
): number | null => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const numericValue = Number(value);
  if (
    !Number.isFinite(numericValue) ||
    numericValue < min ||
    numericValue > max
  ) {
    return null;
  }

  return numericValue;
};

const getBookLocation = (qrCode: QrCode): LatLng | null => {
  const lat = parseCoordinate(qrCode?.book?.latitude, -90, 90);
  const lng = parseCoordinate(qrCode?.book?.longitude, -180, 180);

  if (lat === null || lng === null) {
    return null;
  }

  return { lat, lng };
};

const findSubdistrictByCode = (
  subdistricts: Subdistrict[],
  code: string | number | null | undefined
) => {
  const normalizedCode = String(code ?? '').trim();
  if (!normalizedCode) return undefined;

  return subdistricts.find(
    subdistrict => String(subdistrict.code).trim() === normalizedCode
  );
};

const CollectSample = () => {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [factories, setFactories] = useState<FactoryInfoInterface[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaInterface[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<number>();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [qrCodeValid, setQrCodeValid] = useState<boolean | null>(null);
  const [collectMode, setCollectMode] = useState<CollectSampleMode>('choice');
  const [collectExamForm, setCollectExamForm] = useState<CollectSampleInput>({
    farmerId: null,
    landId: null,
    firstName: '',
    lastName: '',
    birthDate: '',
    landCode: '',
    landName: '',
    areaSize: '',
    provinceCode: '',
    districtCode: '',
    subdistrictCode: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    phoneNumber: '',
    serviceAreaId: 0,
    serviceTypeId: 0,
    thaiNationalId: '',
  });
  const [isCollected, setIsCollected] = useState<QrCode>();
  const [existingFarmer, setExistingFarmer] =
    useState<FarmerPublicProfile | null>(null);
  const [existingLands, setExistingLands] = useState<FarmerPublicLand[]>([]);
  const [selectedExistingLandId, setSelectedExistingLandId] = useState<
    number | ''
  >('');
  const [isAddingNewLand, setIsAddingNewLand] = useState(false);
  const [isLoadingExistingFarmer, setIsLoadingExistingFarmer] = useState(false);
  const { code } = useParams();
  const existingServiceAreaId = isCollected?.book?.serviceAreaId;
  const isFormLocked = Boolean(
    isCollected?.status !== SampleStatusEnum.DISTRIBUTED && isCollected
  );

  const setValueCollected = (qrCode: QrCode) => {
    const savedLocation = getBookLocation(qrCode);
    const subdistrict = qrCode?.book?.subdistrict;
    const district = subdistrict?.district;
    const province = district?.province;
    const savedServiceArea = qrCode?.book?.serviceArea ?? qrCode?.serviceArea;

    if (savedLocation) {
      setLocation(savedLocation);
    }

    setSelectedFactory(savedServiceArea?.factoryId);
    setCollectExamForm({
      firstName: qrCode?.firstName ?? '',
      lastName: qrCode?.lastName ?? '',
      birthDate: qrCode?.birthDate ?? qrCode?.book?.farmer?.birthDate ?? '',
      landCode: qrCode?.landCode ?? '',
      landName: qrCode?.landName ?? '',
      areaSize: qrCode?.book?.areaSize ?? '',
      provinceCode: province?.code ?? '',
      districtCode: district?.code ?? '',
      subdistrictCode: subdistrict?.code ?? qrCode?.book?.subdistrictCode ?? '',
      zipCode:
        qrCode?.book?.zipCode ??
        (subdistrict?.zipCode ? Number(subdistrict.zipCode) : ''),
      latitude: savedLocation ? savedLocation.lat.toFixed(6) : '',
      longitude: savedLocation ? savedLocation.lng.toFixed(6) : '',
      phoneNumber: qrCode?.phoneNumber ?? '',
      serviceAreaId: Number(
        qrCode?.book?.serviceAreaId ??
          qrCode?.serviceAreaId ??
          savedServiceArea?.serviceAreaId ??
          0
      ),
      serviceTypeId: Number(qrCode?.book?.serviceTypeId ?? 0),
      thaiNationalId: '',
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
        const provinceList = await getAllProvinces();
        setFactories(factoriesList);
        setServiceTypes(serviceTypeList);
        setProvinces(provinceList);

        const savedLocation = getBookLocation(qrCode);
        if (savedLocation) {
          setLocation(savedLocation);
          setCollectExamForm(prev => ({
            ...prev,
            latitude: savedLocation.lat.toFixed(6),
            longitude: savedLocation.lng.toFixed(6),
          }));
        }

        if (qrCode?.status !== SampleStatusEnum.DISTRIBUTED) {
          setValueCollected(qrCode);
        }

        if (qrCode?.status === SampleStatusEnum.DISTRIBUTED) {
          const qrServiceArea =
            qrCode?.serviceArea ?? qrCode?.book?.serviceArea;
          const factoryId =
            qrServiceArea?.factoryId ??
            qrServiceArea?.factory?.factoryId ??
            factoriesList[0]?.factoryId;

          if (factoryId) {
            setSelectedFactory(factoryId);
          }

          if (serviceTypeList.length) {
            setCollectExamForm(prev => ({
              ...prev,
              serviceAreaId: Number(
                qrCode?.serviceAreaId ??
                  qrCode?.book?.serviceAreaId ??
                  qrServiceArea?.serviceAreaId ??
                  prev.serviceAreaId
              ),
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
      setCollectExamForm(prev => {
        const currentServiceAreaId = Number(
          prev.serviceAreaId || existingServiceAreaId || 0
        );
        const hasCurrentServiceArea = data.serviceAreas.some(
          (serviceArea: ServiceAreaInterface) =>
            serviceArea.serviceAreaId === currentServiceAreaId
        );

        return {
          ...prev,
          serviceAreaId: hasCurrentServiceArea
            ? currentServiceAreaId
            : Number(data.serviceAreas[0]?.serviceAreaId ?? 0),
        };
      });
    };

    fetchServiceAreaByFactory();
  }, [existingServiceAreaId, selectedFactory]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!collectExamForm.provinceCode) {
        setDistricts([]);
        setSubdistricts([]);
        setCollectExamForm(prev => ({
          ...prev,
          districtCode: '',
          subdistrictCode: '',
          zipCode: '',
        }));
        return;
      }

      const districtList = await getDistrictsByProvinceCode(
        Number(collectExamForm.provinceCode)
      );
      setDistricts(districtList);
      setCollectExamForm(prev => {
        if (
          prev.districtCode &&
          districtList.some(
            (district: District) =>
              Number(district.code) === Number(prev.districtCode)
          )
        ) {
          return prev;
        }

        return {
          ...prev,
          districtCode: '',
          subdistrictCode: '',
          zipCode: '',
        };
      });
    };

    fetchDistricts().catch(error =>
      console.error('Failed to load districts', error)
    );
  }, [collectExamForm.provinceCode]);

  useEffect(() => {
    const fetchSubdistricts = async () => {
      if (!collectExamForm.districtCode) {
        setSubdistricts([]);
        setCollectExamForm(prev => ({
          ...prev,
          subdistrictCode: '',
          zipCode: '',
        }));
        return;
      }

      const subdistrictList = await getSubdistrictsByDistrictCode(
        Number(collectExamForm.districtCode)
      );
      setSubdistricts(subdistrictList);
      setCollectExamForm(prev => {
        const matchedSubdistrict = findSubdistrictByCode(
          subdistrictList,
          prev.subdistrictCode
        );

        if (matchedSubdistrict) {
          return {
            ...prev,
            zipCode: Number(matchedSubdistrict.zipCode),
          };
        }

        return {
          ...prev,
          subdistrictCode: '',
          zipCode: '',
        };
      });
    };

    fetchSubdistricts().catch(error =>
      console.error('Failed to load subdistricts', error)
    );
  }, [collectExamForm.districtCode]);

  useEffect(() => {
    if (!collectExamForm.subdistrictCode) return;

    const matchedSubdistrict = findSubdistrictByCode(
      subdistricts,
      collectExamForm.subdistrictCode
    );
    if (!matchedSubdistrict) return;

    setCollectExamForm(prev => ({
      ...prev,
      zipCode: Number(matchedSubdistrict.zipCode),
    }));

    const lat = parseCoordinate(matchedSubdistrict.latitude, -90, 90);
    const lng = parseCoordinate(matchedSubdistrict.longitude, -180, 180);

    if (lat !== null && lng !== null) {
      setLocation({
        lat,
        lng,
      });
    }
  }, [collectExamForm.subdistrictCode, subdistricts]);

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
    const numberFields = [
      'serviceTypeId',
      'serviceAreaId',
      'areaSize',
      'provinceCode',
      'districtCode',
      'zipCode',
    ];

    if (
      collectMode === 'returning' &&
      existingFarmer &&
      (name === 'firstName' || name === 'phoneNumber')
    ) {
      setExistingFarmer(null);
      setExistingLands([]);
      clearExistingLand();
      setIsAddingNewLand(false);
    }

    if (name === 'thaiNationalId') {
      const formatted = formatThaiNationalId(value);
      setCollectExamForm(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'phoneNumber') {
      const formatted = formatPhoneNumber(value);
      setCollectExamForm(prev => ({ ...prev, [name]: formatted }));
    } else {
      setCollectExamForm(prev => ({
        ...prev,
        [name]:
          numberFields.includes(name) && value !== '' ? Number(value) : value,
      }));
    }
  };

  const clearExistingLand = () => {
    setSelectedExistingLandId('');
    setLocation(null);
    setCollectExamForm(prev => ({
      ...prev,
      landId: null,
      landCode: '',
      landName: '',
      areaSize: '',
      provinceCode: '',
      districtCode: '',
      subdistrictCode: '',
      zipCode: '',
      latitude: '',
      longitude: '',
    }));
  };

  const applyExistingLand = (land: FarmerPublicLand) => {
    const subdistrict = land.subdistrict;
    const district = subdistrict?.district;
    const province = district?.province;
    const latitude = parseCoordinate(land.latitude, -90, 90);
    const longitude = parseCoordinate(land.longitude, -180, 180);

    setSelectedExistingLandId(land.landId);
    setIsAddingNewLand(false);
    setCollectExamForm(prev => ({
      ...prev,
      landId: land.landId,
      landCode: land.landCode ?? '',
      landName: land.name ?? '',
      areaSize: land.areaSize ?? '',
      provinceCode: province?.code ?? '',
      districtCode: district?.code ?? '',
      subdistrictCode: String(subdistrict?.code ?? land.subdistrictCode ?? ''),
      zipCode: Number(land.zipCode ?? subdistrict?.zipCode ?? '') || '',
      latitude: latitude === null ? '' : latitude.toFixed(6),
      longitude: longitude === null ? '' : longitude.toFixed(6),
    }));

    setLocation(
      latitude === null || longitude === null
        ? null
        : { lat: latitude, lng: longitude }
    );
  };

  const startNewLand = () => {
    clearExistingLand();
    setIsAddingNewLand(true);
  };

  const handleModeChoice = (mode: CollectSampleMode) => {
    setCollectMode(mode);
    setExistingFarmer(null);
    setExistingLands([]);
    setSelectedExistingLandId('');
    setIsAddingNewLand(false);
    if (mode === 'returning') {
      setCollectExamForm(prev => ({
        ...prev,
        farmerId: null,
        landId: null,
        firstName: '',
        lastName: '',
        birthDate: '',
        phoneNumber: '',
        thaiNationalId: '',
        landCode: '',
        landName: '',
        areaSize: '',
        provinceCode: '',
        districtCode: '',
        subdistrictCode: '',
        zipCode: '',
        latitude: '',
        longitude: '',
      }));
      setLocation(null);
    }
  };

  const handleExistingFarmerLookup = async () => {
    const firstName = collectExamForm.firstName.trim();
    const phoneNumber = normalizeDigits(collectExamForm.phoneNumber);

    if (!firstName || phoneNumber.length < 9) {
      await Swal.fire({
        title: 'ข้อมูลสำหรับค้นหาไม่ครบ',
        text: 'กรุณากรอกชื่อจริงและเบอร์โทรศัพท์ให้ครบถ้วน',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    setIsLoadingExistingFarmer(true);
    try {
      const farmer = await publicLookupFarmerByNamePhone({
        firstName,
        phone: phoneNumber,
      });
      const lands = farmer.lands ?? [];
      setExistingFarmer(farmer);
      setExistingLands(lands);
      clearExistingLand();
      setIsAddingNewLand(lands.length === 0);
      setSelectedFactory(farmer.factory?.factoryId);
      setCollectExamForm(prev => ({
        ...prev,
        farmerId: farmer.farmerId,
        landId: null,
        firstName: farmer.firstName,
        lastName: farmer.lastName,
        birthDate: farmer.birthDate ?? '',
        phoneNumber: formatPhoneNumber(farmer.phone),
        thaiNationalId: '',
        serviceAreaId: Number(
          farmer.serviceArea?.serviceAreaId ?? prev.serviceAreaId
        ),
      }));
    } catch (error) {
      console.error('Failed to load existing farmer data', error);
      setExistingFarmer(null);
      setExistingLands([]);
      setSelectedExistingLandId('');
      await Swal.fire({
        title: 'ไม่พบข้อมูลเดิม',
        text: 'ไม่สามารถยืนยันข้อมูลจากชื่อและเบอร์โทรนี้ได้ กรุณาตรวจสอบข้อมูล หรือลองกรอกข้อมูลครั้งแรก',
        icon: 'info',
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setIsLoadingExistingFarmer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const latitude = parseCoordinate(collectExamForm.latitude, -90, 90);
    const longitude = parseCoordinate(collectExamForm.longitude, -180, 180);
    const thaiNationalIdDigits = collectExamForm.thaiNationalId.replace(
      /\D/g,
      ''
    );

    if (latitude === null || longitude === null) {
      Swal.fire({
        title: 'ไม่พบข้อมูลพิกัด',
        text: 'กรุณาเปิด GPS หรือเลือกตำแหน่งบนแผนที่ก่อนบันทึกข้อมูล',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    if (collectMode === 'returning' && !existingFarmer) {
      Swal.fire({
        title: 'ยังไม่ได้ยืนยันข้อมูลเดิม',
        text: 'กรุณากรอกชื่อและเบอร์โทร แล้วกดค้นหาข้อมูลเดิมก่อนบันทึก',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    if (
      collectMode === 'returning' &&
      !selectedExistingLandId &&
      !isAddingNewLand
    ) {
      Swal.fire({
        title: 'ยังไม่ได้เลือกแปลง',
        text: 'กรุณาเลือกแปลงเดิม หรือกดเพิ่มแปลงใหม่ก่อนบันทึก',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    if (collectMode === 'first_time' && thaiNationalIdDigits.length !== 13) {
      Swal.fire({
        title: 'เลขบัตรประชาชนไม่ถูกต้อง',
        text: 'กรุณากรอกเลขบัตรประชาชน 13 หลักให้ครบถ้วน',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    if (collectMode === 'first_time' && !collectExamForm.birthDate) {
      Swal.fire({
        title: 'ยังไม่ได้กรอกวันเกิด',
        text: 'กรุณากรอกวันเกิดให้ครบถ้วน',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    if (
      !collectExamForm.areaSize ||
      Number(collectExamForm.areaSize) <= 0 ||
      !collectExamForm.provinceCode ||
      !collectExamForm.districtCode ||
      !collectExamForm.subdistrictCode ||
      !collectExamForm.zipCode
    ) {
      Swal.fire({
        title: 'ข้อมูลแปลงไม่ครบ',
        text: 'กรุณากรอกพื้นที่ จังหวัด อำเภอ ตำบล และรหัสไปรษณีย์ให้ครบถ้วน',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    try {
      let submittedLandId =
        collectMode === 'returning' ? collectExamForm.landId : null;
      let submittedLandCode = collectExamForm.landCode;

      if (collectMode === 'returning' && existingFarmer && isAddingNewLand) {
        const createdLand = await createPublicLandByFarmer({
          farmerId: existingFarmer.farmerId,
          firstName: existingFarmer.firstName,
          phone: normalizeDigits(existingFarmer.phone),
          landCode: collectExamForm.landCode.trim() || undefined,
          name: collectExamForm.landName.trim(),
          areaSize: Number(collectExamForm.areaSize),
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          subdistrictCode: collectExamForm.subdistrictCode,
          zipCode: Number(collectExamForm.zipCode),
        });

        submittedLandId = createdLand.landId;
        submittedLandCode = createdLand.landCode ?? collectExamForm.landCode;
        setExistingLands(prev => [...prev, createdLand]);
        setSelectedExistingLandId(createdLand.landId);
        setIsAddingNewLand(false);
      }

      const payload = {
        ...collectExamForm,
        farmerId:
          collectMode === 'returning'
            ? (existingFarmer?.farmerId ?? null)
            : null,
        landId: submittedLandId,
        landCode: submittedLandCode,
        areaSize: Number(collectExamForm.areaSize),
        zipCode: Number(collectExamForm.zipCode),
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        phoneNumber: collectExamForm.phoneNumber.replace(/\D/g, ''),
        thaiNationalId:
          collectMode === 'first_time' ? thaiNationalIdDigits : '',
      };

      await updateDataByFarmer(code!, payload);
      setIsCollected(prev =>
        ({
          ...(prev ?? {}),
          ...payload,
          status: SampleStatusEnum.COLLECTED,
        }) as QrCode
      );
      setCollectMode('choice');
      await Swal.fire({
        title: 'เพิ่มข้อมูลตัวอย่างดินสำเร็จ',
        text: 'คุณได้เพิ่มข้อมูลตัวอย่างดินเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง',
      });
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
      <div className="collect-sample-private-shell d-flex justify-content-center align-items-center">
        <div className="alert alert-danger text-center shadow">
          <h4>QR Code ไม่ถูกต้อง</h4>
          <p>กรุณาติดต่อเจ้าหน้าที่เพื่อขอความช่วยเหลือ</p>
        </div>
      </div>
    );
  }

  if (qrCodeValid === null) {
    return (
      <div className="collect-sample-private-shell d-flex justify-content-center align-items-center flex-column">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">กำลังตรวจสอบ QR Code...</p>
      </div>
    );
  }

  if (isFormLocked) {
    return (
      <div className="collect-sample-private-shell d-flex justify-content-center align-items-center">
        <div className="alert alert-success text-center shadow">
          <h4>บันทึกข้อมูลตัวอย่างดินเรียบร้อยแล้ว</h4>
          <p>สถานะปัจจุบัน: {isCollected?.status}</p>
        </div>
      </div>
    );
  }

  if (collectMode === 'choice') {
    return (
      <div className="collect-sample-private-shell">
        <div className="collect-sample-private-container">
          <div className="private-card collect-sample-card">
            <div className="private-card-header">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-seedling me-2" />
                แบบฟอร์มเก็บตัวอย่างดิน
              </h4>
            </div>
            <div className="private-card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 py-4 fw-semibold"
                    onClick={() => handleModeChoice('first_time')}
                  >
                    กรอกข้อมูลครั้งแรก
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    type="button"
                    className="btn btn-primary w-100 py-4 fw-semibold"
                    onClick={() => handleModeChoice('returning')}
                  >
                    เคยใส่ข้อมูลแล้ว
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="collect-sample-private-shell">
      <div className="collect-sample-private-container">
        <div className="private-card collect-sample-card">
          <div className="private-card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
            <h4 className="private-card-title mb-0">
              <i className="fas fa-seedling me-2" />
              แบบฟอร์มเก็บตัวอย่างดิน
            </h4>
            <span
              className={`badge ${isFormLocked ? 'bg-success' : 'bg-primary'}`}
            >
              {isFormLocked ? 'บันทึกข้อมูลแล้ว' : 'รอกรอกข้อมูล'}
            </span>
          </div>
          <div className="private-card-body">
            <form onSubmit={handleSubmit}>
              <div className="collect-sample-section-title">
                <i className="fas fa-user" />
                ข้อมูลเกษตรกร
              </div>
              {collectMode === 'returning' && (
                <div className="private-card private-card-soft-primary mb-3">
                  <div className="private-card-body">
                    <div className="row g-3 align-items-end">
                      <div className="col-md-5">
                        <GenFormText1
                          id="firstName"
                          isRequired={true}
                          name="firstName"
                          label="ชื่อจริง"
                          placeholder=""
                          value={collectExamForm.firstName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-5">
                        <GenFormText1
                          id="phoneNumber"
                          isRequired={true}
                          name="phoneNumber"
                          label="เบอร์โทรศัพท์"
                          placeholder="เช่น 080xxxxxxx"
                          value={collectExamForm.phoneNumber}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary w-100"
                          onClick={handleExistingFarmerLookup}
                          disabled={isLoadingExistingFarmer}
                        >
                          {isLoadingExistingFarmer ? 'ค้นหา...' : 'ค้นหา'}
                        </button>
                      </div>
                    </div>
                    {existingFarmer && (
                      <div className="alert alert-success mt-3 mb-0">
                        พบข้อมูลเดิมของ {existingFarmer.firstName}{' '}
                        {existingFarmer.lastName}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {collectMode === 'first_time' && (
                <>
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
                          isCollected?.status !==
                            SampleStatusEnum.DISTRIBUTED && isCollected
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
                          isCollected?.status !==
                            SampleStatusEnum.DISTRIBUTED && isCollected
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
                          isCollected?.status !==
                            SampleStatusEnum.DISTRIBUTED && isCollected
                            ? true
                            : false
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <GenFormText1
                        id="birthDate"
                        isRequired={true}
                        name="birthDate"
                        label="วันเกิด"
                        placeholder=""
                        type="date"
                        value={collectExamForm.birthDate}
                        onChange={handleChange}
                        readOnly={
                          isCollected?.status !==
                            SampleStatusEnum.DISTRIBUTED && isCollected
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
                          isCollected?.status !==
                            SampleStatusEnum.DISTRIBUTED && isCollected
                            ? true
                            : false
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {collectMode === 'returning' && existingFarmer && (
                <div className="alert alert-primary">
                  <label htmlFor="existingLandId" className="form-label">
                    เลือกแปลงเดิม
                  </label>
                  <select
                    id="existingLandId"
                    className="form-select"
                    value={selectedExistingLandId}
                    onChange={e => {
                      if (!e.target.value) {
                        clearExistingLand();
                        setIsAddingNewLand(false);
                        return;
                      }
                      const landId = Number(e.target.value);
                      const land = existingLands.find(
                        item => item.landId === landId
                      );
                      if (land) applyExistingLand(land);
                    }}
                  >
                    <option value="">-- เลือกแปลงเดิม --</option>
                    {existingLands.map(land => (
                      <option key={land.landId} value={land.landId}>
                        {land.name} ({land.landCode || 'ไม่มีรหัสแปลง'})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary mt-3"
                    onClick={startNewLand}
                  >
                    เพิ่มแปลงใหม่
                  </button>
                  {existingLands.length === 0 && (
                    <div className="small text-muted mt-2">
                      ยังไม่มีข้อมูลแปลงเดิม กรุณาเพิ่มแปลงใหม่
                    </div>
                  )}
                </div>
              )}

              {(collectMode === 'first_time' || existingFarmer) && (
                <>
                  <div className="collect-sample-section-title">
                    <i className="fas fa-map-marked-alt" />
                    ข้อมูลแปลง
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <GenFormText1
                        id="areaSize"
                        isRequired={true}
                        name="areaSize"
                        label="พื้นที่ (ไร่)"
                        placeholder="ระบุขนาดแปลง (ไร่)"
                        type="number"
                        step="0.01"
                        value={collectExamForm.areaSize}
                        onChange={handleChange}
                        readOnly={isFormLocked}
                      />
                    </div>
                    <div className="col-md-6">
                      <GenFormSelect
                        isRequired={true}
                        id="provinceCode"
                        name="provinceCode"
                        label="จังหวัด"
                        onChange={handleChange}
                        options={[
                          { value: '', name: '-- กรุณาเลือกจังหวัด --' },
                          ...provinces.map(province => ({
                            value: province.code,
                            name: province.nameTh,
                          })),
                        ]}
                        value={collectExamForm.provinceCode}
                        disabled={isFormLocked}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <GenFormSelect
                        isRequired={true}
                        id="districtCode"
                        name="districtCode"
                        label="เขต/อำเภอ"
                        onChange={handleChange}
                        options={[
                          { value: '', name: '-- กรุณาเลือกอำเภอ --' },
                          ...districts.map(district => ({
                            value: district.code,
                            name: district.nameTh,
                          })),
                        ]}
                        value={collectExamForm.districtCode}
                        emptyMessage="-- กรุณาเลือกจังหวัดก่อนเลือกอำเภอ --"
                        disabled={isFormLocked}
                      />
                    </div>
                    <div className="col-md-6">
                      <GenFormSelect
                        isRequired={true}
                        id="subdistrictCode"
                        name="subdistrictCode"
                        label="แขวง/ตำบล"
                        onChange={handleChange}
                        options={[
                          { value: '', name: '-- กรุณาเลือกตำบล --' },
                          ...subdistricts.map(subdistrict => ({
                            value: subdistrict.code,
                            name: subdistrict.nameTh,
                          })),
                        ]}
                        value={collectExamForm.subdistrictCode}
                        emptyMessage="-- กรุณาเลือกอำเภอก่อนเลือกตำบล --"
                        disabled={isFormLocked}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <GenFormText1
                        id="zipCode"
                        isRequired={true}
                        name="zipCode"
                        label="รหัสไปรษณีย์"
                        placeholder="กรอกอัตโนมัติเมื่อเลือกตำบล"
                        value={collectExamForm.zipCode}
                        onChange={handleChange}
                        readOnly={true}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
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
                          isCollected?.status !==
                            SampleStatusEnum.DISTRIBUTED && isCollected
                            ? true
                            : false
                        }
                      />
                    </div>
                  </div>

                  <div className="collect-sample-section-title">
                    <i className="fas fa-building" />
                    ข้อมูลบริการ
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <GenFormSelect
                        isRequired={true}
                        id="factory"
                        name="factory"
                        onChange={e =>
                          setSelectedFactory(Number(e.target.value))
                        }
                        options={factories.map(factory => {
                          return {
                            value: factory.factoryId,
                            name: `${factory.name} (${factory.initial})`,
                          };
                        })}
                        label="โรงงาน"
                        value={selectedFactory}
                        disabled={
                          isCollected?.status !==
                            SampleStatusEnum.DISTRIBUTED && isCollected
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
                          isCollected?.status !==
                            SampleStatusEnum.DISTRIBUTED && isCollected
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
                          isCollected?.status !==
                            SampleStatusEnum.DISTRIBUTED && isCollected
                            ? true
                            : false
                        }
                      />
                    </div>
                  </div>

                  <div className="collect-sample-section-title">
                    <i className="fas fa-location-dot" />
                    พิกัดแปลง
                  </div>

                  <div className="collect-sample-map-panel">
                    <LeafletMapPicker
                      center={location}
                      onChange={setLocation}
                      height="460px"
                    />
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary px-4 fw-semibold"
                    >
                      บันทึกข้อมูล
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectSample;
