import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import { GenButtonCircle } from '../../../components/gui/GuiButton';
import { GenFormText1, GenFormSelect } from '../../../components/gui/GuiForm';
import { getDistrictsByProvinceCode } from '../../../services/api/address/DistrictApi';
import { getAllProvinces } from '../../../services/api/address/ProvinceApi';
import { getSubdistrictsByDistrictCode } from '../../../services/api/address/SubdistrictApi';
import { District, Province, Subdistrict } from '../../../types/address';
import { ShopInput } from '../../../types/Shop';

import LeafletMapMarker from '@/components/map/LeafletMapMarker';
import ShopSummaryCard from '@/components/pages/shop/ShopSummaryCard';
import { getShopById, updateShop } from '@/services/api/ShopApi';
import { formatPhoneNumber } from '@/utils/PhoneNumberFormat';

interface SelectOption {
  value: string;
  name: string;
}

interface SubdistrictOption extends SelectOption {
  zipCode?: string;
  latitude?: number | string;
  longitude?: number | string;
}

interface ShopResponse {
  name: string;
  phone: string;
  ownerName: string;
  facebook?: string;
  lineId?: string;
  googleMapUrl?: string;
  zipCode?: number | string;
  latitude?: number | string;
  longitude?: number | string;
  imageUrl?: string;
  subdistrict?: Subdistrict;
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string | string[] } } };
  const message = err?.response?.data?.message || fallback;

  return Array.isArray(message) ? message.join(', ') : message;
};

const ShopEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
  const [provinceOptions, setProvinceOptions] = useState<SelectOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<
    SubdistrictOption[]
  >([]);

  // Selected IDs
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedSubdistrictId, setSelectedSubdistrictId] =
    useState<string>('');

  // Image Management - single image
  const [existingImage, setExistingImage] = useState<string>('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState('');

  const [defaultCenter, setDefaultCenter] = useState({
    lat: 13.736717,
    lng: 100.523186,
  });
  const [location, setLocation] = useState<{ lat: number; lng: number }>();

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data: Province[] = await getAllProvinces();
        setProvinceOptions(
          data.map(p => ({ value: String(p.code), name: p.nameTh }))
        );
      } catch (error) {
        console.error('Failed to fetch provinces', error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchShopData = async () => {
      try {
        const shop: ShopResponse = await getShopById(Number(id));

        setForm(prev => ({
          ...prev,
          name: shop.name,
          phone: shop.phone,
          owner: shop.ownerName,
          facebook: shop.facebook || '',
          line: shop.lineId || '',
          shopAddress: shop.googleMapUrl || '',
          zipcode: shop.zipCode?.toString() || '',
        }));

        if (shop.latitude && shop.longitude) {
          setLocation({
            lat: Number(shop.latitude),
            lng: Number(shop.longitude),
          });
          setDefaultCenter({
            lat: Number(shop.latitude),
            lng: Number(shop.longitude),
          });
        }

        if (shop.imageUrl) {
          setExistingImage(shop.imageUrl);
        }

        if (shop.subdistrict) {
          const sub = shop.subdistrict;
          const dist = sub.district;
          const prov = dist?.province;

          if (prov) {
            setSelectedProvinceId(String(prov.code));
            const districts: District[] = await getDistrictsByProvinceCode(
              Number(prov.code)
            );
            setDistrictOptions(
              districts.map(d => ({ value: String(d.code), name: d.nameTh }))
            );

            if (dist) {
              setSelectedDistrictId(String(dist.code));
              const subdistricts: Subdistrict[] =
                await getSubdistrictsByDistrictCode(
                  Number(dist.code)
                );
              setSubdistrictOptions(
                subdistricts.map(s => ({
                  value: String(s.code),
                  name: s.nameTh,
                  zipCode: s.zipCode,
                  latitude: s.latitude,
                  longitude: s.longitude,
                }))
              );

              setSelectedSubdistrictId(String(sub.code));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch shop', error);
      }
    };
    fetchShopData();
  }, [id]);

  const handleProvinceChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId('');
    setSelectedSubdistrictId('');
    setDistrictOptions([]);
    setSubdistrictOptions([]);
    setForm(prev => ({ ...prev, zipcode: '' }));

    if (provinceId) {
      try {
        const districts: District[] = await getDistrictsByProvinceCode(
          Number(provinceId)
        );
        setDistrictOptions(
          districts.map(d => ({ value: String(d.code), name: d.nameTh }))
        );
      } catch (error) {
        console.error('Failed to fetch districts', error);
      }
    }
  };

  const handleDistrictChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setSelectedDistrictId(districtId);
    setSelectedSubdistrictId('');
    setSubdistrictOptions([]);
    setForm(prev => ({ ...prev, zipcode: '' }));

    if (districtId) {
      try {
        const subdistricts: Subdistrict[] = await getSubdistrictsByDistrictCode(
          Number(districtId)
        );
        setSubdistrictOptions(
          subdistricts.map(s => ({
            value: String(s.code),
            name: s.nameTh,
            zipCode: s.zipCode,
            latitude: s.latitude,
            longitude: s.longitude,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch subdistricts', error);
      }
    }
  };

  const handleSubdistrictChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const subdistrictId = e.target.value;
    const selectedSub = subdistrictOptions.find(
      s => s.value === subdistrictId
    );
    setSelectedSubdistrictId(subdistrictId);

    if (selectedSub) {
      setForm(prev => ({
        ...prev,
        zipcode: selectedSub.zipCode || '',
      }));
      if (selectedSub.latitude && selectedSub.longitude) {
        const lat = Number(selectedSub.latitude);
        const lng = Number(selectedSub.longitude);
        setDefaultCenter({ lat, lng });
        setLocation({ lat, lng });
      }
    } else {
      setForm(prev => ({ ...prev, zipcode: '' }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
      // Clear existing image when selecting new one
      setExistingImage('');
    }
  };

  const removeExistingImage = () => {
    setExistingImage('');
  };

  const removeNewImage = () => {
    setNewImage(null);
    setNewImagePreview('');
  };

  const handleCancel = () => {
    navigate('/admin/shop');
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.phone) newErrors.phone = 'กรุณาระบุเบอร์โทร';
    if (!form.name) newErrors.name = 'กรุณาระบุชื่อร้าน';
    if (!form.owner) newErrors.owner = 'กรุณาระบุชื่อเจ้าของ';
    if (!selectedProvinceId) newErrors.province = 'กรุณาเลือกจังหวัด';
    if (!selectedDistrictId) newErrors.district = 'กรุณาเลือกอำเภอ';
    if (!selectedSubdistrictId) newErrors.subdistrict = 'กรุณาเลือกตำบล';
    return newErrors;
  };

  useEffect(() => {
    if (!newImage) {
      setNewImagePreview('');
      return;
    }

    const previewUrl = URL.createObjectURL(newImage);
    setNewImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [newImage]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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

    // Only append new image if selected
    if (newImage) {
      data.append('images', newImage);
    } else if (!existingImage) {
      data.append('imageUrl', '');
    }

    try {
      await updateShop(Number(id), data);
      Swal.fire({
        title: 'สำเร็จ',
        text: 'แก้ไขข้อมูลร้านค้าเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง',
      }).then(() => navigate('/admin/shop'));
    } catch (error: unknown) {
      console.error(error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: getApiErrorMessage(error, 'ไม่สามารถแก้ไขข้อมูลได้'),
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
          <div className="private-card mb-3">
            <div className="private-card-header">พิกัดร้านค้า</div>
            <div className="private-card-body">
              <LeafletMapMarker center={defaultCenter} onChange={setLocation} />
            </div>
          </div>

          <div className="private-card">
            <div className="private-card-header">รูปร้านค้า</div>
            <div className="private-card-body">
              <div className="row">
                {existingImage && (
                  <div className="col-12 mb-2 position-relative">
                    <img
                      src={
                        existingImage.startsWith('http')
                          ? existingImage
                          : `${import.meta.env.VITE_API_URL}${existingImage}`
                      }
                      alt="shop"
                      width="100%"
                      className="img-thumbnail"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute"
                      style={{ top: 5, right: 20 }}
                      onClick={removeExistingImage}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                    <small className="d-block text-center">รูปปัจจุบัน</small>
                  </div>
                )}
                {newImage && (
                  <div className="col-12 mb-2 position-relative">
                    <img
                      src={newImagePreview}
                      alt="new"
                      width="100%"
                      className="img-thumbnail"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute"
                      style={{ top: 5, right: 20 }}
                      onClick={removeNewImage}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                    <small className="d-block text-center text-success">
                      รูปใหม่
                    </small>
                  </div>
                )}
              </div>
              <div className="form-group mt-3">
                <label htmlFor="shop-images">
                  {existingImage ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}
                </label>
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
          <div className="private-card">
            <div className="private-card-header d-flex justify-content-between">
              <h4 className="private-card-title">แก้ไขร้านค้า</h4>
              <GenButtonCircle
                color="btn-info"
                icon="fa fa-list"
                link="/admin/shop"
              />
            </div>
            <form onSubmit={handleSubmit} className="private-card-body">
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
                <div className="invalid-feedback d-block">
                  {errors.province}
                </div>
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
                <div className="invalid-feedback d-block">
                  {errors.district}
                </div>
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
                <div className="invalid-feedback d-block">
                  {errors.subdistrict}
                </div>
              )}

              <GenFormText1
                id="zipcode"
                name="zipcode"
                label="รหัสไปรษณีย์"
                isRequired
                placeholder="รหัสไปรษณีย์"
                value={form.zipcode}
                onChange={() => {}}
                readOnly={true}
              />

              <div className="private-action-footer d-flex justify-content-between mt-4">
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ width: 150 }}
                >
                  บันทึกการแก้ไข
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

export default ShopEdit;

