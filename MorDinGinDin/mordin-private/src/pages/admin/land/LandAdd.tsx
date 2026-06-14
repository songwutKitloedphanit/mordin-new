import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActionMeta, SingleValue } from 'react-select';
import Swal from 'sweetalert2';

import { GenButtonCircle } from '../../../components/gui/GuiButton';
import GenFormSearchSelect, {
  GenFormSelect,
  GenFormText1,
} from '../../../components/gui/GuiForm';
import { getDistrictsByProvinceCode } from '../../../services/api/address/DistrictApi';
import { getAllProvinces } from '../../../services/api/address/ProvinceApi';
import { getSubdistrictsByDistrictCode } from '../../../services/api/address/SubdistrictApi';
import { searchFarmers } from '../../../services/api/FarmerApi';
import { createLand } from '../../../services/api/LandApi';
import {
  LandFormInterface,
  LandInputInterface,
  LatLng,
} from '../../../types/Land';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import LeafletMapMarker from '@/components/map/LeafletMapMarker';
import LandCard from '@/components/pages/land/LandCard';
import { Subdistrict } from '@/types/address';
import { FarmerInfo } from '@/types/Farmer';

interface FarmerOption {
  value: string;
  label: string;
}

const LandAdd: React.FC = () => {
  const navigate = useNavigate();
  const [defaultCenter, setDefaultCenter] = useState<LatLng>({
    lat: 13.7563,
    lng: 100.5018,
  });

  const [location, setLocation] = useState<LatLng>();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const locationState = useLocation();
  const state = locationState.state;

  // ข้อมูลสำหรับ cards
  // const totalLands = 2;
  // const poorSoilCount = 0;
  // const normalSoilCount = 2;
  // const fertileSoilCount = 0;

  // State สำหรับควบคุมฟอร์ม
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
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerOption | null>(
    null
  );

  useEffect(() => {
    async function fetchData() {
      const provinceData = await getAllProvinces();

      if (state) {
        setLand(prev => ({
          ...prev,
          farmerId: state.farmerId,
          latitude: state.latitude,
          longitude: state.longitude,
          landCode: state.landCode,
          name: state.landName,
        }));

        if (state.latitude && state.longitude) {
          setDefaultCenter({
            lat: Number(state.latitude),
            lng: Number(state.longitude),
          });
        }

        // ✅ โหลดข้อมูลเกษตรกรสำหรับ default
        if (state.farmerId) {
          try {
            const response = await searchFarmers({ search: '' });
            const matchedFarmer = response.data.find(
              (farmer: FarmerInfo) => farmer.farmerId === state.farmerId
            );

            if (matchedFarmer) {
              const selectedOption = {
                label: `${matchedFarmer.firstName} ${matchedFarmer.lastName} (${matchedFarmer.phone})`,
                value: matchedFarmer.farmerId,
                farmerData: matchedFarmer,
              };
              setSelectedFarmer(selectedOption);
            }
          } catch (error) {
            console.error('Cannot load default farmer:', error);
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
    if (location && allowLocation) {
      setLand(prevLand => ({
        ...prevLand,
        latitude: Number(location?.lat?.toFixed(6)),
        longitude: Number(location?.lng?.toFixed(6)),
      }));
    } else if (!allowLocation) {
      setLand(prevLand => ({
        ...prevLand,
        latitude: undefined,
        longitude: undefined,
      }));
    }
  }, [location, allowLocation]);

  useEffect(() => {
    const loadDistricts = async () => {
      if (land.provinceId) {
        const districts = await getDistrictsByProvinceCode(
          Number(land.provinceId)
        );
        console.log('districts', districts);

        const mappedDistricts = districts.map(
          (d: { code: string; nameTh: string }) => ({
            value: d.code,
            name: d.nameTh,
          })
        );

        setDistrictsOptions([
          { value: '', name: '-- กรุณาเลือกอำเภอ --' },
          ...mappedDistricts,
        ]);

        setSubdistrictOptions([]);
        setLand(prev => ({
          ...prev,
          districtId: undefined,
          subdistrictCode: '',
          zipCode: undefined,
        }));
      }
    };

    loadDistricts();
  }, [land.provinceId]);

  useEffect(() => {
    const loadSubdistricts = async () => {
      if (land.districtId) {
        const subdistricts = await getSubdistrictsByDistrictCode(
          Number(land.districtId)
        );

        console.log('subdistricts', subdistricts);

        const mappedSubdistricts = subdistricts.map(
          (s: { code: string; nameTh: string }) => ({
            value: s.code,
            name: s.nameTh,
          })
        );

        setSubdistricts(subdistricts);

        setSubdistrictOptions([
          { value: '', name: '-- กรุณาเลือกตำบล --' },
          ...mappedSubdistricts,
        ]);
      } else {
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
    const loadZipCode = () => {
      if (land.subdistrictCode) {
        const subdistrict = subdistricts.find(
          s => s.code === land.subdistrictCode
        );

        if (subdistrict) {
          console.log('subdistrict : ', subdistrict);

          setLand(prev => ({
            ...prev,
            zipCode: Number(subdistrict.zipCode),
          }));

          if (subdistrict.latitude && subdistrict.longitude) {
            setLocation({
              lat: Number(subdistrict.latitude),
              lng: Number(subdistrict.longitude),
            });
            setDefaultCenter({
              lat: Number(subdistrict.latitude),
              lng: Number(subdistrict.longitude),
            });
          }
        }
      } else {
        setLand(prev => ({
          ...prev,
          zipCode: undefined,
        }));
      }
    };
    loadZipCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [land.subdistrictCode, subdistrictOptions, subdistricts]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setLand(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const loadFarmerOptions = async (
    inputValue: string
  ): Promise<FarmerOption[]> => {
    try {
      const response = await searchFarmers({ search: inputValue });
      return response.data.map((farmer: FarmerInfo) => ({
        label: `${farmer.firstName} ${farmer.lastName} (${farmer.phone})`,
        value: farmer.farmerId,
        farmerData: farmer,
      }));
    } catch (error) {
      console.error('Cannot search farmers:', error);
      return [];
    }
  };

  const handleFarmerChange = (
    newValue: SingleValue<FarmerOption>,
    actionMeta: ActionMeta<FarmerOption>
  ) => {
    if (actionMeta.action === 'clear') {
      setSelectedFarmer(null);
      setLand(prev => ({
        ...prev,
        farmerId: null,
      }));
    } else if (actionMeta.action === 'select-option') {
      setSelectedFarmer(newValue);
      setLand(prev => ({
        ...prev,
        farmerId: Number(newValue?.value),
      }));
    }

    // อัปเดต state ให้เป็นค่าที่เลือกใหม่
  };

  const handleSubmit = async () => {
    const validationErrors: { [key: string]: string } = {}; // Initialize validation errors

    // Validation checks
    if (!land.name) {
      validationErrors.name = 'กรุณากรอกชื่อแปลง';
    }

    if (!land.farmerId) {
      validationErrors.farmerId = 'กรุณากรอกชื่อแปลง';
    }
    if (!land.provinceId) {
      validationErrors.province = 'กรุณาเลือกจังหวัด';
    }
    if (!land.districtId) {
      validationErrors.district = 'กรุณาเลือกอำเภอ';
    }
    if (!land.subdistrictCode) {
      validationErrors.subdistrict = 'กรุณาเลือกตำบล';
    }
    // if (!land.village) {
    //   validationErrors.village = 'กรุณาเลือกหมู่บ้าน';
    // }
    // if (!land.landCode) {
    //   validationErrors.landCode = 'กรุณากรอกหมายเลขแปลง';
    // }
    if (!land.areaSize) {
      validationErrors.areaSize = 'กรุณากรอกพื้นที่';
    }
    if (!land.zipCode) {
      validationErrors.zipCode = 'กรุณากรอกรหัสไปรษณีย์';
    }

    // Example of numeric validation for landCode and quotaCode
    // แต่ถ้ามีค่าและไม่เป็นตัวเลข ต้องตรวจสอบความถูกต้อง
    if (land.landCode && !/^\d+$/.test(land.landCode)) {
      validationErrors.landCode = 'หมายเลขแปลงต้องเป็นตัวเลข';
    }
    if (land.quotaCode && !/^\d+$/.test(land.quotaCode)) {
      validationErrors.quotaCode = 'รหัสโคต้าอ้อยต้องเป็นตัวเลข';
    }

    // If there are validation errors, set the error state and return early
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

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
      zipCode: Number(land.zipCode), // <-- make sure it's a number
      village: land.village || undefined,
      farmerId: Number(land.farmerId),
    };

    console.log('Submitted Data', dataToSubmit);

    try {
      const response = await createLand(dataToSubmit);
      console.log('Response Data', response);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มข้อมูลพื้นที่เกษตรกรเสร็จสิ้น',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate(-1);
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่',
        icon: 'error',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
      return;
    }
  };

  return (
    <div className="container-fluid">
      {/* Statistics Cards */}
      <div className="row">
        <LandCard />
      </div>

      {/* Add Form and Map */}
      <div className="row">
        <div className="col-md-6 order-1 order-lg-2">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <div className="card-title">พิกัดแปลง</div>
              </div>
              <div className="card-body">
                <div className="form-check mb-2">
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
                {land.subdistrictCode || state ? (
                  <LeafletMapMarker
                    center={defaultCenter}
                    onChange={setLocation}
                  />
                ) : (
                  <p>กรุณาเลือกตำบล</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 order-2 order-lg-1">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">เพิ่มแปลงใหม่</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color="btn-primary"
                    icon="fa fa-clipboard-list"
                    link="/admin/land"
                    className="mx-1"
                  />
                  <GenButtonCircle
                    color="btn-primary"
                    icon="fa fa-user-plus"
                    link="/admin/farmer/add"
                    className="text-white"
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="col-md-8 ms-auto me-auto">
                <GenFormSearchSelect
                  id="farmer-select"
                  label="เจ้าของ"
                  isRequired={true}
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
                  isRequired={true}
                  id="name"
                  name="name"
                  label="ชื่อแปลง"
                  placeholder="ระบุชื่อแปลง"
                  value={land.name}
                  onChange={handleInputChange}
                  errorMessage={error.name}
                />

                <GenFormText1
                  isRequired={true}
                  id="area"
                  name="areaSize"
                  label="พื้นที่ (ไร่)"
                  placeholder="ระบุขนาดแปลง (ไร่)"
                  value={land.areaSize}
                  onChange={handleInputChange}
                  errorMessage={error.areaSize}
                />
                <GenFormSelect
                  isRequired={true}
                  id="Province"
                  name="provinceId"
                  label="จังหวัด"
                  options={provinceOptions}
                  value={land.provinceId}
                  onChange={handleInputChange}
                />

                <GenFormSelect
                  isRequired={true}
                  id="District"
                  name="districtId"
                  label="เขต/อำเภอ"
                  options={districtsOptions}
                  value={land.districtId}
                  emptyMessage="-- กรุณาเลือกจังหวัดก่อนเลือกอำเภอ --"
                  onChange={handleInputChange}
                />

                <GenFormSelect
                  isRequired={true}
                  id="subdistrict"
                  name="subdistrictCode"
                  label="แขวง/ตำบล"
                  options={subdistrictOptions}
                  value={land.subdistrictCode}
                  emptyMessage="-- กรุณาเลือกอำเภอก่อนเลือกตำบล --"
                  onChange={handleInputChange}
                />
                <GenFormText1
                  isRequired={true}
                  id="zipCode"
                  name="zipCode"
                  label="รหัสไปรษณีย์"
                  placeholder="ระบุรหัสไปรษณีย์"
                  // options={districtList}
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
                  // options={districtList}
                  value={land.village}
                  onChange={handleInputChange}
                  //errorMessage={error.village}
                />

                <div className="card-action d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: '150px' }}
                    onClick={handleSubmit}
                  >
                    เพิ่มแปลง
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ width: '150px' }}
                    onClick={() => setShowConfirm(true)}
                  >
                    ยกเลิก
                  </button>
                  {showConfirm && (
                    <ConfirmAlert
                      title={'ยืนยันการยกเลิก'}
                      text={'คุณต้องการยกเลิกการบันทึกข้อมูลหรือไม่'}
                      action={'cancel'}
                      onConfirm={() => navigate(-1)}
                      onCancel={() => setShowConfirm(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandAdd;
