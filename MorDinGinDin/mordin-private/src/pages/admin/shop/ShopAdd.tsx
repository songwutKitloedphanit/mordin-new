import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import { GenButtonCircle } from '../../../components/gui/GuiButton';
import { GenFormText1, GenFormSelect } from '../../../components/gui/GuiForm';
import { ShopInput } from '../../../types/Shop';

import LeafletMapMarker from '@/components/map/LeafletMapMarker';
import ShopSummaryCard from '@/components/pages/shop/ShopSummaryCard';
import { getAllProvinces } from '../../../services/api/address/ProvinceApi';
import { getDistrictsByProvinceCode } from '../../../services/api/address/DistrictApi';
import { getSubdistrictsByDistrictCode } from '../../../services/api/address/SubdistrictApi';
import { createShop } from '@/services/api/ShopApi';
import { formatPhoneNumber } from '@/utils/PhoneNumberFormat';

const ShopAdd: React.FC = () => {
  const navigate = useNavigate();

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Address Options
  const [provinceOptions, setProvinceOptions] = useState<{ value: string; name: string }[]>([]);
  const [districtOptions, setDistrictOptions] = useState<{ value: string; name: string }[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<{ value: string; name: string }[]>([]);

  // Selected IDs for cascading
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedSubdistrictId, setSelectedSubdistrictId] = useState<string>('');

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [defaultCenter, setDefaultCenter] = useState({
    lat: 13.736717,
    lng: 100.523186,
  });
  const [location, setLocation] = useState<{ lat: number; lng: number }>();

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getAllProvinces();
        setProvinceOptions(data.map((p: any) => ({ value: p.code, name: p.nameTh })));
      } catch (error) {
        console.error('Failed to fetch provinces', error);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    const provinceName = provinceOptions.find(p => p.value == provinceId)?.name || '';

    setSelectedProvinceId(provinceId);
    setForm(prev => ({ ...prev, province: provinceName, district: '', subdistrict: '', zipcode: '' }));
    setSelectedDistrictId('');
    setSelectedSubdistrictId('');
    setDistrictOptions([]);
    setSubdistrictOptions([]);

    if (provinceId) {
      try {
        const districts = await getDistrictsByProvinceCode(Number(provinceId));
        setDistrictOptions(districts.map((d: any) => ({ value: d.code, name: d.nameTh })));
      } catch (error) {
        console.error('Failed to fetch districts', error);
      }
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    const districtName = districtOptions.find(d => d.value == districtId)?.name || '';

    setSelectedDistrictId(districtId);
    setForm(prev => ({ ...prev, district: districtName, subdistrict: '', zipcode: '' }));
    setSelectedSubdistrictId('');
    setSubdistrictOptions([]);

    if (districtId) {
      try {
        const subdistricts = await getSubdistrictsByDistrictCode(Number(districtId));
        // Store full subdistrict object to access zipcode/lat/long later if needed
        setSubdistrictOptions(subdistricts.map((s: any) => ({
          value: s.code,
          name: s.nameTh,
          zipCode: s.zipCode,
          latitude: s.latitude,
          longitude: s.longitude
        })));
      } catch (error) {
        console.error('Failed to fetch subdistricts', error);
      }
    }
  };

  const handleSubdistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subdistrictId = e.target.value;
    const selectedSub = subdistrictOptions.find(s => s.value == subdistrictId) as any;

    setSelectedSubdistrictId(subdistrictId);

    if (selectedSub) {
      setForm(prev => ({
        ...prev,
        subdistrict: selectedSub.name,
        zipcode: selectedSub.zipCode
      }));

      // Update map center if coordinates exist
      if (selectedSub.latitude && selectedSub.longitude) {
        const lat = Number(selectedSub.latitude);
        const lng = Number(selectedSub.longitude);
        setDefaultCenter({ lat, lng });
        setLocation({ lat, lng });
      }
    } else {
      setForm(prev => ({ ...prev, subdistrict: '', zipcode: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm(prev => ({ ...prev, images: [file] }));
      setImagePreviews([URL.createObjectURL(file)]);
    }
  };

  const handleCancel = () => {
    navigate('/admin/shop');
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.phone) newErrors.phone = 'กรุณาระบุเบอร์โทร';
    if (!form.name) newErrors.name = 'กรุณาระบุชื่อร้าน';
    if (!form.owner) newErrors.owner = 'กรุณาระบุชื่อเจ้าของ';
    // if (!form.shopAddress) newErrors.shopAddress = 'กรุณาระบุที่อยู่ร้าน';
    if (!selectedProvinceId) newErrors.province = "กรุณาเลือกจังหวัด";
    if (!selectedDistrictId) newErrors.district = "กรุณาเลือกอำเภอ";
    if (!selectedSubdistrictId) newErrors.subdistrict = "กรุณาเลือกตำบล";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      console.log(validationErrors)
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
    // Address fields
    data.append('subdistrictId', selectedSubdistrictId);
    data.append('zipCode', form.zipcode);

    // Construct full address if needed or just send parts? 
    // Backend seems to expect specific fields. Let's check DTO.
    // DTO: phone, name, ownerName, facebook, lineId, googleMapUrl, subdistrictId, zipCode, latitude, longitude, imageUrl
    // UI has: houseNumber, street, village, shopAddress. These might need to be concatenated or stored if backend supports them.
    // Current DTO doesn't have houseNumber/street/village/shopAddress. 
    // I will ignore them for now as per DTO or maybe Map them to something else if requested?
    // User asked "Shop Address from Land creation example". 
    // Land creation saves address parts? No, Land creation saves subdistrictCode, zipCode, village. 
    // Shop entity has subdistrict_id, zip_code. NO specific address text field other than what we see.
    // Wait, ShopAdd.tsx original had 'shopAddress'.
    // If backend doesn't support it, I might skip it or ask. 
    // But user said "เขียนให้ backend ด้วย". I already checked backend entity/dto, it doesn't have 'address' string.
    // I will assume for now we only send what the DTO supports + the file.

    if (location) {
      data.append('latitude', location.lat.toString());
      data.append('longitude', location.lng.toString());
    }

    if (form.images && Array.isArray(form.images)) {
      form.images.forEach((file: File) => {
        data.append('images', file);
      });
    }

    try {
      await createShop(data);
      Swal.fire({
        title: 'สำเร็จ',
        text: 'ข้อมูลร้านค้าถูกบันทึกเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง',
      }).then(() => navigate('/admin/shop'));
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <ShopSummaryCard />
      </div>
      <div className="row">
        <div className="col-md-6 order-1 order-lg-2">
          <div className="card mb-3">
            <div className="card-header">พิกัดร้านค้า</div>
            <div className="card-body">
              <LeafletMapMarker center={defaultCenter} onChange={setLocation} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">รูปร้านค้า</div>
            <div className="card-body">
              <div className="row">
                {imagePreviews.map((url, i) => (
                  <div className="col-md-6 mb-2" key={url}>
                    <img src={url} alt={`preview-${i}`} width="100%" />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label htmlFor="shop-images">เลือกรูปภาพ</label>
                <input
                  id="shop-images"
                  type="file"
                  className="form-control-file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 order-2 order-lg-1">
          <div className="card">
            <div className="card-header d-flex justify-content-between">
              <h4 className="card-title">เพิ่มร้านค้า</h4>
              <GenButtonCircle
                color="btn-info"
                icon="fa fa-list"
                link="/admin/shop"
              />
            </div>
            <form onSubmit={handleSubmit} className="card-body">
              <GenFormText1
                id="phone"
                name="phone"
                label="เบอร์โทร"
                isRequired
                placeholder="ระบุเบอร์โทร"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: formatPhoneNumber(e.target.value) })}
                errorMessage={errors.phone}
              />
              <GenFormText1
                id="name"
                name="name"
                label="ชื่อร้าน"
                isRequired
                placeholder="ชื่อร้าน"
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
                onChange={e => setForm({ ...form, shopAddress: e.target.value })}
              />

              <GenFormSelect
                id="province"
                name="province"
                label="จังหวัด"
                isRequired
                options={[{ value: '', name: 'เลือกจังหวัด' }, ...provinceOptions]}
                value={selectedProvinceId}
                onChange={handleProvinceChange}
              />

              <GenFormSelect
                id="district"
                name="district"
                label="อำเภอ"
                isRequired
                options={[{ value: '', name: 'เลือกอำเภอ' }, ...districtOptions]}
                value={selectedDistrictId}
                onChange={handleDistrictChange}
              />

              <GenFormSelect
                id="subdistrict"
                name="subdistrict"
                label="ตำบล"
                isRequired
                options={[{ value: '', name: 'เลือกตำบล' }, ...subdistrictOptions]}
                value={selectedSubdistrictId}
                onChange={handleSubdistrictChange}
              />

              <GenFormText1
                id="zipcode"
                name="zipcode"
                label="รหัสไปรษณีย์"
                isRequired
                placeholder="รหัสไปรษณีย์"
                value={form.zipcode}
                onChange={() => { }}
              />

              <div className="card-action d-flex justify-content-between mt-4">
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ width: 150 }}
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: 150 }}
                  onClick={handleCancel}
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopAdd;
