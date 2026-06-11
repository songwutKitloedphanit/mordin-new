import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { GenFormSelect, GenFormText1 } from '@/components/gui/GuiForm';
import LeafletMapMarker from '@/components/map/LeafletMapMarker';
import { getDistrictsByProvinceCode } from '@/services/api/address/DistrictApi';
import { getAllProvinces } from '@/services/api/address/ProvinceApi';
import { getSubdistrictsByDistrictCode } from '@/services/api/address/SubdistrictApi';
import { createShop, getShopSummary } from '@/services/api/ShopApi';
import { ShopInput, ShopSummary } from '@/types/Shop';
import { formatPhoneNumber } from '@/utils/PhoneNumberFormat';

interface SubdistrictOption {
  value: string;
  name: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

const KPI_CONFIG = [
  {
    key: 'totalShops' as keyof ShopSummary,
    label: 'ร้านค้าทั้งหมด',
    icon: 'fas fa-store',
    accent: '#18a05c',
    unit: 'ร้าน',
  },
];

const ShopAdd = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<ShopSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState<ShopInput>({
    name: '',
    phone: '',
    owner: '',
    facebook: '',
    line: '',
    houseNumber: '',
    street: '',
    village: '',
    shopAddress: '',
    zipcode: '',
    subdistrict: '',
    district: '',
    province: '',
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [defaultCenter, setDefaultCenter] = useState({
    lat: 13.736717,
    lng: 100.523186,
  });
  const [location, setLocation] = useState<{ lat: number; lng: number }>();

  const [provinceOptions, setProvinceOptions] = useState<
    { value: string; name: string }[]
  >([]);
  const [districtOptions, setDistrictOptions] = useState<
    { value: string; name: string }[]
  >([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<
    SubdistrictOption[]
  >([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedSubdistrictId, setSelectedSubdistrictId] = useState('');

  useEffect(() => {
    getShopSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    getAllProvinces()
      .then(data =>
        setProvinceOptions(
          data.map((p: { code: number; nameTh: string }) => ({
            value: String(p.code),
            name: p.nameTh,
          }))
        )
      )
      .catch(console.error);
  }, []);

  const handleProvinceChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    const provinceName =
      provinceOptions.find(p => p.value === provinceId)?.name || '';
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId('');
    setSelectedSubdistrictId('');
    setDistrictOptions([]);
    setSubdistrictOptions([]);
    setForm(prev => ({
      ...prev,
      province: provinceName,
      district: '',
      subdistrict: '',
      zipcode: '',
    }));
    if (provinceId) {
      try {
        const districts = await getDistrictsByProvinceCode(Number(provinceId));
        setDistrictOptions(
          districts.map((d: { code: number; nameTh: string }) => ({
            value: String(d.code),
            name: d.nameTh,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDistrictChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    const districtName =
      districtOptions.find(d => d.value === districtId)?.name || '';
    setSelectedDistrictId(districtId);
    setSelectedSubdistrictId('');
    setSubdistrictOptions([]);
    setForm(prev => ({
      ...prev,
      district: districtName,
      subdistrict: '',
      zipcode: '',
    }));
    if (districtId) {
      try {
        const subs = await getSubdistrictsByDistrictCode(Number(districtId));
        setSubdistrictOptions(
          subs.map(
            (s: {
              code: number;
              nameTh: string;
              zipCode?: string;
              latitude?: number;
              longitude?: number;
            }) => ({
              value: String(s.code),
              name: s.nameTh,
              zipCode: s.zipCode,
              latitude: s.latitude,
              longitude: s.longitude,
            })
          )
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubdistrictChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const subdistrictId = e.target.value;
    const selectedSub = subdistrictOptions.find(s => s.value === subdistrictId);
    setSelectedSubdistrictId(subdistrictId);
    if (selectedSub) {
      setForm(prev => ({
        ...prev,
        subdistrict: selectedSub.name,
        zipcode: selectedSub.zipCode || '',
      }));
      if (selectedSub.latitude && selectedSub.longitude) {
        setDefaultCenter({
          lat: selectedSub.latitude,
          lng: selectedSub.longitude,
        });
        setLocation({ lat: selectedSub.latitude, lng: selectedSub.longitude });
      }
    } else {
      setForm(prev => ({ ...prev, subdistrict: '', zipcode: '' }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setForm(prev => ({ ...prev, images: [file] }));
      setImagePreviews([URL.createObjectURL(file)]);
    }
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.phone) newErrors.phone = 'กรุณาระบุเบอร์โทร';
    if (!form.name) newErrors.name = 'กรุณาระบุชื่อร้าน';
    if (!form.owner) newErrors.owner = 'กรุณาระบุชื่อเจ้าของ';
    if (!selectedProvinceId) newErrors.province = 'กรุณาเลือกจังหวัด';
    if (!selectedDistrictId) newErrors.district = 'กรุณาเลือกอำเภอ';
    if (!selectedSubdistrictId) newErrors.subdistrict = 'กรุณาเลือกตำบล';
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const data = new FormData();
    data.append('name', form.name);
    data.append('phone', form.phone.replace(/-/g, ''));
    data.append('ownerName', form.owner);
    if (form.facebook) data.append('facebook', form.facebook);
    if (form.line) data.append('lineId', form.line);
    if (form.shopAddress) data.append('googleMapUrl', form.shopAddress);
    data.append('subdistrictId', selectedSubdistrictId);
    data.append('zipCode', form.zipcode);
    if (location) {
      data.append('latitude', location.lat.toString());
      data.append('longitude', location.lng.toString());
    }
    if (Array.isArray(form.images)) {
      form.images.forEach(file => data.append('images', file));
    }

    try {
      await createShop(data);
      await Swal.fire({
        title: 'สำเร็จ',
        text: 'ข้อมูลร้านค้าถูกบันทึกเรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
      navigate('/admin/shop');
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
      await Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
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

      {/* Form + Map/Image layout */}
      <div className="row">
        {/* Form Card */}
        <div className="col-md-6 order-2 order-lg-1">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-store me-2" />
                เพิ่มร้านค้า
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle
                  color={B_LIST.list.color}
                  icon={B_LIST.list.icon}
                  link="/admin/shop"
                />
              </div>
            </div>
            <div className="private-card-body">
              <GenFormText1
                id="phone"
                name="phone"
                label="เบอร์โทร"
                isRequired
                placeholder="ระบุเบอร์โทร"
                value={form.phone}
                onChange={e =>
                  setForm({ ...form, phone: formatPhoneNumber(e.target.value) })
                }
                errorMessage={errors.phone}
              />
              <GenFormText1
                id="name"
                name="name"
                label="ชื่อร้าน"
                isRequired
                placeholder="ระบุชื่อร้าน"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                errorMessage={errors.name}
              />
              <GenFormText1
                id="owner"
                name="owner"
                label="ชื่อเจ้าของร้าน"
                isRequired
                placeholder="ระบุชื่อเจ้าของร้าน"
                value={form.owner}
                onChange={e => setForm({ ...form, owner: e.target.value })}
                errorMessage={errors.owner}
              />
              <GenFormText1
                id="facebook"
                name="facebook"
                label="ลิงก์เพจเฟสบุ๊ค"
                placeholder="ระบุลิงก์เพจเฟสบุ๊ค"
                isRequired={false}
                value={form.facebook}
                onChange={e => setForm({ ...form, facebook: e.target.value })}
              />
              <GenFormText1
                id="line"
                name="line"
                label="ไลน์แอคเคาท์"
                placeholder="ระบุไลน์แอคเคาท์"
                isRequired={false}
                value={form.line}
                onChange={e => setForm({ ...form, line: e.target.value })}
              />
              <GenFormText1
                id="shopAddress"
                name="shopAddress"
                label="ลิงก์ Google Map"
                placeholder="ระบุลิงก์ Google Map"
                isRequired={false}
                value={form.shopAddress}
                onChange={e =>
                  setForm({ ...form, shopAddress: e.target.value })
                }
              />
              <GenFormSelect
                id="province"
                name="province"
                label="จังหวัด"
                isRequired
                options={[
                  { value: '', name: 'เลือกจังหวัด' },
                  ...provinceOptions,
                ]}
                value={selectedProvinceId}
                onChange={handleProvinceChange}
              />
              {errors.province && (
                <div className="text-danger small mb-2">{errors.province}</div>
              )}
              <GenFormSelect
                id="district"
                name="district"
                label="อำเภอ"
                isRequired
                options={[
                  { value: '', name: 'เลือกอำเภอ' },
                  ...districtOptions,
                ]}
                value={selectedDistrictId}
                onChange={handleDistrictChange}
              />
              {errors.district && (
                <div className="text-danger small mb-2">{errors.district}</div>
              )}
              <GenFormSelect
                id="subdistrict"
                name="subdistrict"
                label="ตำบล"
                isRequired
                options={[
                  { value: '', name: 'เลือกตำบล' },
                  ...subdistrictOptions,
                ]}
                value={selectedSubdistrictId}
                onChange={handleSubdistrictChange}
              />
              {errors.subdistrict && (
                <div className="text-danger small mb-2">
                  {errors.subdistrict}
                </div>
              )}
              <GenFormText1
                id="zipcode"
                name="zipcode"
                label="รหัสไปรษณีย์"
                isRequired={false}
                placeholder="กรอกอัตโนมัติเมื่อเลือกตำบล"
                value={form.zipcode}
                onChange={() => {}}
              />

              <div className="private-action-footer d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ width: 150 }}
                  onClick={handleSubmit}
                >
                  บันทึก
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

        {/* Map + Image Cards */}
        <div className="col-md-6 order-1 order-lg-2">
          <div className="private-card mb-3">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-map-marker-alt me-2" />
                พิกัดร้านค้า
              </h4>
            </div>
            <div className="private-card-body">
              <LeafletMapMarker center={defaultCenter} onChange={setLocation} />
            </div>
          </div>

          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-image me-2" />
                รูปร้านค้า
              </h4>
            </div>
            <div className="private-card-body">
              {imagePreviews.length > 0 && (
                <div className="row mb-3">
                  {imagePreviews.map((url, i) => (
                    <div className="col-md-6 mb-2" key={url}>
                      <img
                        src={url}
                        alt={`preview-${i}`}
                        style={{ width: '100%', borderRadius: 6 }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="shop-images" className="form-label">
                  เลือกรูปภาพ
                </label>
                <input
                  id="shop-images"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ยืนยันการยกเลิก"
          text="คุณต้องการยกเลิกการเพิ่มร้านค้าหรือไม่?"
          action="cancel"
          onConfirm={() => {
            navigate('/admin/shop');
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default ShopAdd;
