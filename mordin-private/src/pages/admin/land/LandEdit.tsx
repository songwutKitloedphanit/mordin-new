import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import { GenButtonCircle } from '../../../components/gui/GuiButton';
import { GenFormSelect, GenFormText1 } from '../../../components/gui/GuiForm';
import { getDistrictsByProvinceCode } from '../../../services/api/address/DistrictApi';
import { getAllProvinces } from '../../../services/api/address/ProvinceApi';
import { getSubdistrictsByDistrictCode } from '../../../services/api/address/SubdistrictApi';
import { getAllFarmers } from '../../../services/api/FarmerApi';
import { getLandById, updateLandById } from '../../../services/api/LandApi';
import {
  LandFormInterface,
  LandInputInterface,
  LatLng,
} from '../../../types/Land';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import LeafletMapMarker from '@/components/map/LeafletMapMarker';
import LandCard from '@/components/pages/land/LandCard';
import { Subdistrict } from '@/types/address';

const LandEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [defaultCenter, setDefaultCenter] = useState<LatLng>({
    lat: 13.736717,
    lng: 100.523186,
  });

  const [location, setLocation] = useState<LatLng>();

  // ข้อมูลสำหรับ cards
  // const totalLands = 2;
  // const poorSoilCount = 0;
  // const normalSoilCount = 2;
  // const fertileSoilCount = 0;

  // State สำหรับควบคุมฟอร์ม
  const [land, setLand] = useState<LandFormInterface>({} as LandFormInterface);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const [error, setError] = useState<{ [key: string]: string }>({});

  const [subdistricts, setSubdistrict] = useState<Subdistrict[]>([]);
  const [provinceOptions, setProvincesOptions] = useState<
    { value: string | number; name: string }[]
  >([]);
  const [districtsOptions, setDistrictsOptions] = useState<
    { value: string | number; name: string }[]
  >([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<
    { value: string | number; name: string }[]
  >([]);
  const [farmerOptions, setFarmerOptions] = useState([]);
  const isFirstLoadRef = useRef(true);
  const [allowLocation, setAllowLocation] = useState(false);
  // โหลดรอบแรก
  useEffect(() => {
    async function loadInitialData() {
      const [provinceData, farmerData, landData] = await Promise.all([
        getAllProvinces(),
        getAllFarmers(),
        getLandById(Number(id)),
      ]);

      const updateLand = {
        landCode: landData.landCode ?? undefined,
        name: landData.name ?? '',
        quotaCode: landData.quotaCode ?? undefined,
        areaSize: landData.areaSize ?? '',
        latitude: landData.latitude,
        longitude: landData.longitude,
        provinceId: landData.subdistrict?.district?.provinceCode,
        districtId: landData.subdistrict?.districtCode,
        subdistrictCode: landData.subdistrictCode ?? '',
        zipCode: landData.zipCode ? Number(landData.zipCode) : undefined,
        village: landData.village,
        farmerId: landData.farmerId ?? null,
      };
      setLand(updateLand);

      setProvincesOptions(
        provinceData.map((p: { code: string; nameTh: string }) => ({
          value: p.code,
          name: p.nameTh,
        }))
      );

      setFarmerOptions(
        farmerData.data.map(
          (f: { farmerId: string; firstName: string; lastName: string }) => ({
            value: f.farmerId,
            name: `${f.firstName} ${f.lastName}`,
          })
        )
      );

      if (landData.latitude && landData.longitude) {
        setLocation({
          lat: Number(landData.latitude),
          lng: Number(landData.longitude),
        });
        setDefaultCenter({
          lat: Number(landData.latitude),
          lng: Number(landData.longitude),
        });
      }

      if (updateLand.provinceId) {
      const districts = await getDistrictsByProvinceCode(
        updateLand.provinceId
      );
      setDistrictsOptions([
        { value: '', name: '-- กรุณาเลือกอำเภอ --' },
        ...districts.map((d: { code: string; nameTh: string }) => ({
          value: d.code,
          name: d.nameTh,
        })),
      ]);
      }

      if (updateLand.districtId) {
      const subdistricts = await getSubdistrictsByDistrictCode(
        updateLand.districtId
      );
      setSubdistrict(subdistricts);
      setSubdistrictOptions([
        { value: '', name: '-- กรุณาเลือกตำบล --' },
        ...subdistricts.map((s: { code: string; nameTh: string }) => ({
          value: s.code,
          name: s.nameTh,
        })),
      ]);
      }

      isFirstLoadRef.current = false;
    }

    loadInitialData();
  }, [id]);

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
    async function loadDistricts() {
      if (!land.provinceId) return;

      const districts = await getDistrictsByProvinceCode(
        Number(land.provinceId)
      );
      setDistrictsOptions([
        { value: '', name: '-- กรุณาเลือกอำเภอ --' },
        ...districts.map((d: { code: string; nameTh: string }) => ({
          value: d.code,
          name: d.nameTh,
        })),
      ]);

      if (isFirstLoadRef.current) return;

      setLand(prev => ({
        ...prev,
        districtId: undefined,
        subdistrictCode: '',
        zipCode: undefined,
      }));
      setSubdistrictOptions([]);
    }

    loadDistricts();
  }, [land.provinceId]);

  useEffect(() => {
    async function loadSubdistricts() {
      if (!land.districtId) return;

      const subdistricts = await getSubdistrictsByDistrictCode(
        Number(land.districtId)
      );
      setSubdistrict(subdistricts);
      setSubdistrictOptions([
        { value: '', name: '-- กรุณาเลือกตำบล --' },
        ...subdistricts.map((s: { code: string; nameTh: string }) => ({
          value: s.code,
          name: s.nameTh,
        })),
      ]);

      if (isFirstLoadRef.current) return;

      setLand(prev => ({
        ...prev,
        subdistrictCode: '',
        zipCode: undefined,
      }));
    }

    loadSubdistricts();
  }, [land.districtId]);

  console.log('land', land);

  useEffect(() => {
    if (!land.subdistrictCode) return;

    const selected = subdistricts.find(s => s.code === land.subdistrictCode);
    if (selected) {
      setLand(prev => ({
        ...prev,
        zipCode: Number(selected.zipCode),
      }));
      if (selected.latitude && selected.longitude) {
        setLocation({
          lat: Number(selected.latitude),
          lng: Number(selected.longitude),
        });
        setDefaultCenter({
          lat: Number(selected.latitude),
          lng: Number(selected.longitude),
        });
      }
    }
  }, [land.subdistrictCode, subdistricts]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setLand(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const validationErrors: { [key: string]: string } = {}; // Initialize validation errors

    // Validation checks
    if (!land.name) {
      validationErrors.name = 'กรุณากรอกชื่อแปลง';
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
      village: land.village ?? '',
      farmerId: Number(land.farmerId),
    };
    console.log('Submitted Data', dataToSubmit);
    try {
      const response = await updateLandById(Number(id), dataToSubmit);
      console.log('response Data');
      console.log(response);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'แก้ไขข้อมูลพื้นที่เกษตรกรเสร็จสิ้น',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate('/admin/land');
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล กรุณาลองใหม่',
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
      <LandCard />

      {/* Add Form and Map */}
      <div className="row">
        <div className="col-md-6 order-1 order-lg-2">
          <div className="col-md-12">
            <div className="private-card">
              <div className="private-card-header">
                <div className="private-card-title">พิกัดแปลง</div>
              </div>
              <div className="private-card-body">
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
                {land.subdistrictCode ? (
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
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="private-card-title">แก้ไขข้อมูลแปลง ({land.name})</h4>
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
            <div className="private-card-body">
              <div className="col-md-8 ms-auto me-auto">
                <GenFormSelect
                  isRequired={true}
                  id="farmerId"
                  name="farmerId"
                  label="เจ้าของ"
                  options={farmerOptions}
                  value={land.farmerId}
                  onChange={handleInputChange}
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
                  //errorMessage={error.village}
                />

                <div className="private-action-footer d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: '150px' }}
                    onClick={handleSubmit}
                  >
                    แก้ไขแปลง
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
                      text={'คุณต้องการยกเลิกการแก้ไขแปลงหรือไม่'}
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

export default LandEdit;

