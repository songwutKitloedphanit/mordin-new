import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActionMeta, SingleValue } from 'react-select';
import { swalSuccessTimer, swalError } from '@/utils/swal';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import GenFormSearchSelect, {
  GenFormSelect,
  GenFormText1,
} from '@/components/gui/GuiForm';
import LeafletMapMarker from '@/components/map/LeafletMapMarker';
import { getDistrictsByProvinceCode } from '@/services/api/address/DistrictApi';
import { getAllProvinces } from '@/services/api/address/ProvinceApi';
import { getSubdistrictsByDistrictCode } from '@/services/api/address/SubdistrictApi';
import { getFarmerById, searchFarmers } from '@/services/api/FarmerApi';
import { createLand, getLandSummary } from '@/services/api/LandApi';
import { settingOwnerData } from '@/services/api/qr-code/BookApi';
import { Subdistrict } from '@/types/address';
import { FarmerInfo } from '@/types/Farmer';
import {
  LandFormInterface,
  LandInputInterface,
  LandSummary,
  LatLng,
} from '@/types/Land';

interface FarmerOption {
  value: string;
  label: string;
}

interface DistrictAddress {
  code: string | number;
  nameTh: string;
  nameEn?: string;
  provinceCode?: string | number;
}

interface ProvinceAddress {
  code: number;
  nameTh: string;
  nameEn?: string;
}

interface GadmFeatureProperties {
  NAME_1: string;
  NL_NAME_1: string;
  NAME_2: string;
  NL_NAME_2: string;
  NAME_3: string;
  NL_NAME_3: string;
}

type Coordinate = [number, number];
type PolygonCoordinates = Coordinate[][];
type MultiPolygonCoordinates = PolygonCoordinates[];

interface GadmFeature {
  properties: GadmFeatureProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: PolygonCoordinates | MultiPolygonCoordinates;
  };
}

interface GadmFeatureCollection {
  features: GadmFeature[];
}

const stripPrefix = (s: string) =>
  s.replace(/^(จังหวัด|อำเภอ|เขต|ตำบล|แขวง)\s*/u, '').trim();

const normalizeAddressName = (value: string) =>
  stripPrefix(value)
    .replace(/^NA$/i, '')
    .replace(/\s+/g, '')
    .replace(/[.'-]/g, '')
    .replace(/muang/gi, 'mueang')
    .toLowerCase();

const nameMatch = (a: string, b: string) => {
  if (!a || !b) return false;
  const na = stripPrefix(a);
  const nb = stripPrefix(b);
  const normalizedA = normalizeAddressName(a);
  const normalizedB = normalizeAddressName(b);
  return (
    na === nb ||
    na.includes(nb) ||
    nb.includes(na) ||
    (!!normalizedA &&
      !!normalizedB &&
      (normalizedA === normalizedB ||
        normalizedA.includes(normalizedB) ||
        normalizedB.includes(normalizedA)))
  );
};

const isDistrictInProvince = (
  district: DistrictAddress,
  provinceCode: string | number
) =>
  district.provinceCode === undefined ||
  Number(district.provinceCode) === Number(provinceCode);

let gadmFeaturesPromise: Promise<GadmFeature[]> | null = null;

const loadGadmFeatures = async () => {
  if (!gadmFeaturesPromise) {
    gadmFeaturesPromise = fetch(
      new URL('../../../assets/geojson/gadm41_THA_3.json', import.meta.url)
    )
      .then(response => response.json())
      .then((data: GadmFeatureCollection) => data.features);
  }
  return gadmFeaturesPromise;
};

const isPointInRing = ([lng, lat]: Coordinate, ring: Coordinate[]) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [lngI, latI] = ring[i];
    const [lngJ, latJ] = ring[j];
    const intersects =
      latI > lat !== latJ > lat &&
      lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI;
    if (intersects) inside = !inside;
  }
  return inside;
};

const isPointInPolygon = (point: Coordinate, polygon: PolygonCoordinates) =>
  isPointInRing(point, polygon[0]) &&
  !polygon.slice(1).some(ring => isPointInRing(point, ring));

const isPointInGeometry = (point: Coordinate, feature: GadmFeature) => {
  const polygons =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates as PolygonCoordinates]
      : (feature.geometry.coordinates as MultiPolygonCoordinates);

  return polygons.some(polygon => isPointInPolygon(point, polygon));
};

const findGadmFeatureAtLatLng = async (lat: number, lng: number) => {
  const features = await loadGadmFeatures();
  const point: Coordinate = [lng, lat];
  return features.find(feature => isPointInGeometry(point, feature));
};

const KPI_CONFIG = [
  {
    key: 'totalLands' as keyof LandSummary,
    label: 'แปลงทั้งหมด',
    icon: 'fas fa-map-marked',
    accent: '#18a05c',
    unit: 'แปลง',
  },
  {
    key: 'needsImprovementCount' as keyof LandSummary,
    label: 'ดินต้องปรับปรุง',
    icon: 'fas fa-exclamation-triangle',
    accent: '#E7505A',
    unit: 'แปลง',
  },
  {
    key: 'normalSoilCount' as keyof LandSummary,
    label: 'ดินปกติ',
    icon: 'fas fa-check-circle',
    accent: '#3b9bd9',
    unit: 'แปลง',
  },
  {
    key: 'fertileSoilCount' as keyof LandSummary,
    label: 'ดินสมบูรณ์',
    icon: 'fas fa-leaf',
    accent: '#2fb380',
    unit: 'แปลง',
  },
];

const LandAdd: React.FC = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<LandSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const [defaultCenter, setDefaultCenter] = useState<LatLng>({
    lat: 13.7563,
    lng: 100.5018,
  });
  const [location, setLocation] = useState<LatLng>();

  const locationState = useLocation();
  const state = locationState.state;

  const [land, setLand] = useState<LandFormInterface>({} as LandFormInterface);
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);
  const [provinceOptions, setProvincesOptions] = useState<
    { value: string | number; name: string }[]
  >([]);
  const [districtsOptions, setDistrictsOptions] = useState<
    { value: string | number; name: string }[]
  >([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<
    { value: string | number; name: string }[]
  >([]);
  const [allowLocation, setAllowLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerOption | null>(
    null
  );

  const geocodingRef = useRef(false);
  const stateHydratingRef = useRef(false);

  const populateAddressFromBoundary = async (lat: number, lng: number) => {
    const feature = await findGadmFeatureAtLatLng(lat, lng);
    if (!feature) return false;

    const props = feature.properties;
    const allProvinces = await getAllProvinces();
    const matchedProv = allProvinces.find(
      (p: ProvinceAddress) =>
        nameMatch(p.nameTh, props.NL_NAME_1) ||
        nameMatch(p.nameEn ?? '', props.NAME_1)
    );
    if (!matchedProv) return false;

    const districts = await getDistrictsByProvinceCode(
      Number(matchedProv.code)
    );
    const provinceDistricts = districts.filter((d: DistrictAddress) =>
      isDistrictInProvince(d, matchedProv.code)
    );
    const matchedDist = provinceDistricts.find(
      (d: DistrictAddress) =>
        nameMatch(d.nameTh, props.NL_NAME_2) ||
        nameMatch(d.nameEn ?? '', props.NAME_2)
    );

    let subs: Subdistrict[] = [];
    let matchedSub: Subdistrict | undefined;
    if (matchedDist) {
      subs = await getSubdistrictsByDistrictCode(Number(matchedDist.code));
      matchedSub = subs.find(
        s =>
          nameMatch(s.nameTh, props.NL_NAME_3) ||
          nameMatch(s.nameEn ?? '', props.NAME_3)
      );
    }

    setDistrictsOptions([
      { value: '', name: '-- กรุณาเลือกอำเภอ --' },
      ...provinceDistricts.map((d: DistrictAddress) => ({
        value: d.code,
        name: d.nameTh,
      })),
    ]);

    setSubdistricts(subs);
    setSubdistrictOptions(
      matchedDist
        ? [
            { value: '', name: '-- กรุณาเลือกตำบล --' },
            ...subs.map(s => ({ value: s.code, name: s.nameTh })),
          ]
        : []
    );

    setLand(prev => ({
      ...prev,
      provinceId: matchedProv.code,
      districtId: matchedDist?.code,
      subdistrictCode: matchedSub?.code ?? '',
      zipCode: matchedSub?.zipCode ? Number(matchedSub.zipCode) : undefined,
    }));

    return true;
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    geocodingRef.current = true;
    try {
      const matchedLocalBoundary = await populateAddressFromBoundary(lat, lng);
      if (matchedLocalBoundary) return;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'th' } }
      );
      const geo = await res.json();
      const addr = geo.address ?? {};
      const rawState = addr.state ?? addr.state_district ?? '';
      const rawCounty = addr.county ?? addr.city ?? '';
      const rawSub =
        addr.suburb ?? addr.quarter ?? addr.village ?? addr.city_district ?? '';

      const allProvinces = await getAllProvinces();
      const matchedProv = allProvinces.find(
        (p: { code: number; nameTh: string }) => nameMatch(p.nameTh, rawState)
      );
      if (!matchedProv) return;

      const districts = await getDistrictsByProvinceCode(
        Number(matchedProv.code)
      );
      const provinceDistricts = districts.filter((d: DistrictAddress) =>
        isDistrictInProvince(d, matchedProv.code)
      );
      const matchedDist = provinceDistricts.find((d: DistrictAddress) =>
        nameMatch(d.nameTh, rawCounty)
      );

      let subs: Subdistrict[] = [];
      let matchedSub: Subdistrict | undefined;
      if (matchedDist) {
        subs = await getSubdistrictsByDistrictCode(Number(matchedDist.code));
        matchedSub = subs.find(s => nameMatch(s.nameTh, rawSub));
      }

      setDistrictsOptions([
        { value: '', name: '-- กรุณาเลือกอำเภอ --' },
        ...provinceDistricts.map((d: DistrictAddress) => ({
          value: d.code,
          name: d.nameTh,
        })),
      ]);
      if (matchedDist) {
        setSubdistricts(subs);
        setSubdistrictOptions([
          { value: '', name: '-- กรุณาเลือกตำบล --' },
          ...subs.map(s => ({ value: s.code, name: s.nameTh })),
        ]);
      }

      setLand(prev => ({
        ...prev,
        provinceId: matchedProv.code,
        districtId: matchedDist?.code,
        subdistrictCode: matchedSub?.code ?? '',
        zipCode: matchedSub?.zipCode
          ? Number(matchedSub.zipCode)
          : prev.zipCode,
      }));
    } catch (err) {
      console.error('Reverse geocode failed:', err);
    } finally {
      setTimeout(() => {
        geocodingRef.current = false;
      }, 300);
    }
  };

  useEffect(() => {
    getLandSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    async function fetchData() {
      const provinceData = await getAllProvinces();

      if (state) {
        const stateLatitude = Number(state.latitude);
        const stateLongitude = Number(state.longitude);
        const hasStateLocation =
          Number.isFinite(stateLatitude) && Number.isFinite(stateLongitude);
        stateHydratingRef.current = true;
        geocodingRef.current = true;
        setLand(prev => ({
          ...prev,
          farmerId: state.farmerId,
          latitude: hasStateLocation ? stateLatitude : undefined,
          longitude: hasStateLocation ? stateLongitude : undefined,
          landCode: state.landCode,
          name: state.landName,
          areaSize: state.areaSize ?? prev.areaSize,
          provinceId: state.provinceCode ?? prev.provinceId,
          districtId: state.districtCode ?? prev.districtId,
          subdistrictCode: state.subdistrictCode ?? prev.subdistrictCode,
          zipCode: state.zipCode ?? prev.zipCode,
        }));

        if (hasStateLocation) {
          setAllowLocation(true);
          setDefaultCenter({
            lat: stateLatitude,
            lng: stateLongitude,
          });
        }

        setTimeout(() => {
          geocodingRef.current = false;
        }, 1000);
        setTimeout(() => {
          stateHydratingRef.current = false;  // longer guard covers district/subdistrict API calls
        }, 3000);

        if (state.farmerId) {
          try {
            const matchedFarmer = await getFarmerById(Number(state.farmerId));
            setSelectedFarmer({
              label: `${matchedFarmer.firstName} ${matchedFarmer.lastName} (${matchedFarmer.phone})`,
              value: String(matchedFarmer.farmerId),
            });
          } catch (err) {
            console.error('Cannot load default farmer:', err);
          }
        }
      }

      setProvincesOptions([
        { value: '', name: '-- กรุณาเลือกจังหวัด --' },
        ...provinceData.map((p: { code: number; nameTh: string }) => ({
          value: p.code,
          name: p.nameTh,
        })),
      ]);
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location) {
      setLand(prev => ({
        ...prev,
        latitude: allowLocation ? Number(location.lat.toFixed(6)) : undefined,
        longitude: allowLocation ? Number(location.lng.toFixed(6)) : undefined,
      }));
      if (!stateHydratingRef.current) {
        reverseGeocode(location.lat, location.lng);
      }
    } else if (!allowLocation) {
      setLand(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, allowLocation]);

  useEffect(() => {
    const loadDistricts = async () => {
      if (land.provinceId) {
        const districts = await getDistrictsByProvinceCode(
          Number(land.provinceId)
        );
        const provinceDistricts = districts.filter((d: DistrictAddress) =>
          isDistrictInProvince(d, land.provinceId!)
        );
        setDistrictsOptions([
          { value: '', name: '-- กรุณาเลือกอำเภอ --' },
          ...provinceDistricts.map((d: DistrictAddress) => ({
            value: d.code,
            name: d.nameTh,
          })),
        ]);
        if (!geocodingRef.current && !stateHydratingRef.current) {
          const firstDistrict = provinceDistricts[0];
          setLand(prev => ({
            ...prev,
            districtId: firstDistrict?.code,
            subdistrictCode: '',
            zipCode: undefined,
          }));
        }
      }
    };
    loadDistricts();
  }, [land.provinceId]);

  useEffect(() => {
    const loadSubdistricts = async () => {
      if (land.districtId) {
        const subs = await getSubdistrictsByDistrictCode(
          Number(land.districtId)
        );
        setSubdistricts(subs);
        setSubdistrictOptions([
          { value: '', name: '-- กรุณาเลือกตำบล --' },
          ...subs.map((s: { code: string; nameTh: string }) => ({
            value: s.code,
            name: s.nameTh,
          })),
        ]);
        if (!geocodingRef.current && !stateHydratingRef.current && subs.length > 0) {
          setLand(prev => ({ ...prev, subdistrictCode: subs[0].code }));
        }
      } else if (!geocodingRef.current && !stateHydratingRef.current) {
        setSubdistrictOptions([]);
        setLand(prev => ({
          ...prev,
          subdistrictCode: '',
          zipCode: undefined,
        }));
      }
    };
    loadSubdistricts();
  }, [land.districtId]);

  useEffect(() => {
    if (land.subdistrictCode) {
      const sub = subdistricts.find(s => s.code === land.subdistrictCode);
      if (sub) {
        setLand(prev => ({ ...prev, zipCode: Number(sub.zipCode) }));
        if (sub.latitude && sub.longitude && !geocodingRef.current) {
          const center = {
            lat: Number(sub.latitude),
            lng: Number(sub.longitude),
          };
          setLocation(center);
          setDefaultCenter(center);
        }
      }
    } else {
      setLand(prev => ({ ...prev, zipCode: undefined }));
    }
  }, [land.subdistrictCode, subdistrictOptions, subdistricts]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLand(prev => ({ ...prev, [name]: value }));
  };

  const loadFarmerOptions = async (
    inputValue: string
  ): Promise<FarmerOption[]> => {
    try {
      const response = await searchFarmers({ search: inputValue });
      return response.data.map((farmer: FarmerInfo) => ({
        label: `${farmer.firstName} ${farmer.lastName} (${farmer.phone})`,
        value: farmer.farmerId,
      }));
    } catch (err) {
      console.error('Cannot search farmers:', err);
      return [];
    }
  };

  const handleFarmerChange = (
    newValue: SingleValue<FarmerOption>,
    actionMeta: ActionMeta<FarmerOption>
  ) => {
    if (actionMeta.action === 'clear') {
      setSelectedFarmer(null);
      setLand(prev => ({ ...prev, farmerId: null }));
    } else if (actionMeta.action === 'select-option') {
      setSelectedFarmer(newValue);
      setLand(prev => ({ ...prev, farmerId: Number(newValue?.value) }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors: { [key: string]: string } = {};

    if (!land.name) validationErrors.name = 'กรุณากรอกชื่อแปลง';
    if (!land.farmerId) validationErrors.farmerId = 'กรุณาเลือกเจ้าของแปลง';
    if (!land.provinceId) validationErrors.province = 'กรุณาเลือกจังหวัด';
    if (!land.districtId) validationErrors.district = 'กรุณาเลือกอำเภอ';
    if (!land.subdistrictCode) validationErrors.subdistrict = 'กรุณาเลือกตำบล';
    if (!land.areaSize) validationErrors.areaSize = 'กรุณากรอกพื้นที่';
    else if (
      !Number.isFinite(Number(land.areaSize)) ||
      Number(land.areaSize) <= 0
    )
      validationErrors.areaSize = 'พื้นที่ต้องเป็นตัวเลขที่มากกว่า 0';
    if (!land.zipCode) validationErrors.zipCode = 'กรุณากรอกรหัสไปรษณีย์';
    if (land.landCode && !/^\d+$/.test(land.landCode))
      validationErrors.landCode = 'หมายเลขแปลงต้องเป็นตัวเลข';
    if (land.quotaCode && !/^\d+$/.test(land.quotaCode))
      validationErrors.quotaCode = 'รหัสโคต้าอ้อยต้องเป็นตัวเลข';

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const dataToSubmit: LandInputInterface = {
      landCode: land.landCode?.trim() ? land.landCode : undefined,
      name: land.name,
      quotaCode: land.quotaCode?.trim() ? land.quotaCode : undefined,
      areaSize: Number(land.areaSize),
      latitude:
        allowLocation && land.latitude !== undefined
          ? land.latitude.toFixed(6)
          : undefined,
      longitude:
        allowLocation && land.longitude !== undefined
          ? land.longitude.toFixed(6)
          : undefined,
      subdistrictCode: land.subdistrictCode,
      zipCode: Number(land.zipCode),
      village: land.village || undefined,
      farmerId: Number(land.farmerId),
    };

    try {
      const createdLand = await createLand(dataToSubmit);
      if (state?.bookId && createdLand?.landId) {
        await settingOwnerData(Number(state.bookId), {
          farmerId: Number(land.farmerId),
          landId: Number(createdLand.landId),
          serviceTypeId: state.serviceTypeId,
          latitude: dataToSubmit.latitude,
          longitude: dataToSubmit.longitude,
        });
      }
      await swalSuccessTimer('สำเร็จ!', 'เพิ่มข้อมูลพื้นที่เกษตรกรเสร็จสิ้น');
      if (state?.bookId) {
        navigate(-1);
      } else {
        navigate('/admin/land');
      }
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
            <div key={cfg.key} className="col-sm-6 col-lg-3">
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

      {/* Form + Map layout */}
      <div className="row">
        {/* Form Card */}
        <div className="col-md-6 order-2 order-lg-1">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-map-marked me-2" />
                เพิ่มแปลงใหม่
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle
                  color={B_LIST.list.color}
                  icon={B_LIST.list.icon}
                  link="/admin/land"
                />
                <GenButtonCircle
                  color={B_LIST['farmer-add'].color}
                  icon={B_LIST['farmer-add'].icon}
                  link="/admin/farmer/add"
                />
              </div>
            </div>
            <div className="private-card-body">
              {state?.bookId && (
                <div className="alert alert-info border-0 d-flex align-items-start gap-2 mb-3 py-2 px-3 small">
                  <i className="fas fa-circle-info mt-1 flex-shrink-0" />
                  <div>
                    <strong>ดึงข้อมูลจาก QR Booking อัตโนมัติ</strong>
                    <span className="text-muted ms-1">
                      — กรุณาตรวจสอบและเติมข้อมูลที่ยังขาดให้ครบก่อนบันทึก
                    </span>
                  </div>
                </div>
              )}
              <GenFormSearchSelect
                id="farmer-select"
                label="เจ้าของ"
                isRequired
                errorMessage={error.farmerId}
                loadOptions={loadFarmerOptions}
                value={selectedFarmer}
                onChange={handleFarmerChange}
                placeholder="ค้นหาเกษตรกร..."
              />
              <GenFormText1
                isRequired={false}
                id="quotaCode"
                name="quotaCode"
                label="รหัสโคต้าอ้อย"
                placeholder="ระบุรหัสโคต้าอ้อย"
                value={land.quotaCode}
                onChange={handleInputChange}
                errorMessage={error.quotaCode}
              />
              <GenFormText1
                isRequired={false}
                id="landCode"
                name="landCode"
                label="หมายเลขแปลง"
                placeholder="ระบุหมายเลขแปลง"
                value={land.landCode}
                onChange={handleInputChange}
                errorMessage={error.landCode}
              />
              <GenFormText1
                isRequired
                id="name"
                name="name"
                label="ชื่อแปลง"
                placeholder="ระบุชื่อแปลง"
                value={land.name}
                onChange={handleInputChange}
                errorMessage={error.name}
              />
              <GenFormText1
                isRequired
                id="area"
                name="areaSize"
                label="พื้นที่ (ไร่)"
                placeholder="ระบุขนาดแปลง (ไร่)"
                value={land.areaSize}
                onChange={handleInputChange}
                errorMessage={error.areaSize}
              />
              <GenFormSelect
                isRequired
                id="Province"
                name="provinceId"
                label="จังหวัด"
                options={provinceOptions}
                value={land.provinceId}
                onChange={handleInputChange}
              />
              <GenFormSelect
                isRequired
                id="District"
                name="districtId"
                label="เขต/อำเภอ"
                options={districtsOptions}
                value={land.districtId}
                emptyMessage="-- กรุณาเลือกจังหวัดก่อนเลือกอำเภอ --"
                onChange={handleInputChange}
              />
              <GenFormSelect
                isRequired
                id="subdistrict"
                name="subdistrictCode"
                label="แขวง/ตำบล"
                options={subdistrictOptions}
                value={land.subdistrictCode}
                emptyMessage="-- กรุณาเลือกอำเภอก่อนเลือกตำบล --"
                onChange={handleInputChange}
              />
              <GenFormText1
                isRequired
                id="zipCode"
                name="zipCode"
                label="รหัสไปรษณีย์"
                placeholder="กรอกอัตโนมัติเมื่อเลือกตำบล"
                value={land.zipCode || ''}
                onChange={handleInputChange}
                errorMessage={error.zipCode}
              />
              <GenFormText1
                isRequired={false}
                id="Village"
                name="village"
                label="หมู่บ้าน"
                placeholder="ระบุหมู่บ้าน"
                value={land.village}
                onChange={handleInputChange}
              />

              <div className="private-action-footer d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ width: 150 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'เพิ่มแปลง'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: 150 }}
                  onClick={() => setShowConfirm(true)}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map Card */}
        <div className="col-md-6 order-1 order-lg-2">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-map-marker-alt me-2" />
                พิกัดแปลง
              </h4>
            </div>
            <div className="private-card-body">
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="allowLocation"
                  checked={allowLocation}
                  onChange={() => setAllowLocation(!allowLocation)}
                />
                <label className="form-check-label" htmlFor="allowLocation">
                  บันทึกตำแหน่งพิกัด
                </label>
              </div>
              <LeafletMapMarker center={defaultCenter} onChange={setLocation} />
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ยืนยันการยกเลิก"
          text="คุณต้องการยกเลิกการเพิ่มแปลงหรือไม่?"
          action="cancel"
          onConfirm={() => {
            navigate('/admin/land');
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default LandAdd;
