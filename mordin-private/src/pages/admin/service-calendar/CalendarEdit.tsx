import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle } from '../../../components/gui/GuiButton';
import {
  GenFormDate1,
  GenFormText1,
  GenFormSelect,
} from '../../../components/gui/GuiForm';
import {
  getAllDistricts,
  getDistrictsByProvinceCode,
} from '../../../services/api/address/DistrictApi';
import { getAllProvinces } from '../../../services/api/address/ProvinceApi';
import {
  getAllSubdistricts,
  getSubdistrictsByDistrictCode,
} from '../../../services/api/address/SubdistrictApi';
import { getAllBuses } from '../../../services/api/BusApi';
import {
  getCalendarById,
  updateServiceCalendar,
  resolveGoogleMapLink,
} from '../../../services/api/ServiceCalendarApi';
import { Bus } from '../../../types/Bus';
import { CalendarInput } from '../../../types/ServiceCalendar';

import LeafletMapPicker from '@/components/map/LeafletMapMarker';
import ServiceCalenderCard from '@/components/pages/service-calender/ServiceCalendarCard';
import { Province, Subdistrict, District } from '@/types/address';
import { extractLatLngFromGoogleMapsUrl } from '@/utils/Map';

interface LatLng {
  location?: { lat: number; lng: number };
  lat: number;
  lng: number;
}

const CalendarEdit: React.FC = () => {
  const { id } = useParams();
  const serviceCalendaId = Number(id);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [zipcode, setZipCode] = useState<string>('');
  const [defaultCenter, setDefaultCenter] = useState<LatLng>({
    lat: 13.736717,
    lng: 100.523186, // กทม. เป็น default
  });

  const [calendarData, setCalendarData] = useState<CalendarInput>({
    date: new Date(),
    numberOfSamples: null,
    numberOfBookings: 0,
    numberOfExaminations: 0,
    busId: null,
    subdistrictCode: '',
    village: '',
    latitude: '',
    longitude: '',
    description: '',
    mapLink: '',
  });

  const [error, setError] = useState<Record<string, string>>({});
  const [busList, setBusList] = useState<Bus[]>([]);
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [districtsList, setDistrictsList] = useState<District[]>([]);
  const [subdistrictsList, setSubdistrictsList] = useState<Subdistrict[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province>();
  const [selectedDistrict, setSelectedDistrict] = useState<District>();

  // โหลดข้อมูลตอน component สร้าง
  useEffect(() => {
    const fetchAllData = async () => {
      const buses = await getAllBuses();
      const provinces = await getAllProvinces();
      const districts = await getAllDistricts();
      const subdistricts = await getAllSubdistricts();
      setBusList(buses);
      setProvinceList(provinces);
      setDistrictsList(districts);
      setSubdistrictsList(subdistricts);
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      const data = await getCalendarById(serviceCalendaId);
      console.log('data form api', data);
      setCalendarData({
        date: new Date(data.date),
        numberOfSamples: data.numberOfSamples ?? null,
        numberOfBookings: data.numberOfBookings ?? null,
        numberOfExaminations: data.numberOfExaminations ?? null,
        busId: data.busId ?? null,
        subdistrictCode: data.subdistrictCode,
        village: data.village,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description || '',
        mapLink: data.mapLink || '',
      });

      const lat = Number(data.latitude);
      const lng = Number(data.longitude);
      setDefaultCenter({ lat, lng });
      setLocation({ lat, lng });
      setSelectedProvince(data.subdistrict.district.province);
      setSelectedDistrict(data.subdistrict.district);
      setZipCode(data.subdistrict.zipCode);
    };

    fetchAllData();
  }, [serviceCalendaId]);

  console.log('calendarData', calendarData);

  // ฟังก์ชันจัดการการเปลี่ยนแปลงจังหวัด
  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const provinceCode = e.target.value;
    if (provinceCode) {
      try {
        const districtsResponse = await getDistrictsByProvinceCode(
          parseInt(provinceCode)
        );
        setDistrictsList(districtsResponse || []);
        setCalendarData(prevData => ({
          ...prevData,
          subdistrictCode: '',
        }));
        setSubdistrictsList([]);
        setZipCode('');
        const province = provinceList.find(
          p => p.code.toString() === provinceCode.toString()
        );
        setSelectedProvince(province);
        console.log('จังหวัดที่เลือก', province);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลอำเภอ:', error);
        setDistrictsList([]);
      }
    } else {
      setDistrictsList([]);
    }
  };

  // ฟังก์ชันจัดการการเปลี่ยนแปลงอำเภอ
  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const districtCode = e.target.value;
    if (districtCode) {
      try {
        const subdistrictsResponse = await getSubdistrictsByDistrictCode(
          parseInt(districtCode)
        );
        setSubdistrictsList(subdistrictsResponse || []);
        const district = districtsList.find(
          p => p.code.toString() === districtCode.toString()
        );
        setSelectedDistrict(district);
        console.log('อำเภอที่เลือก', district);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลตำบล:', error);
        setSubdistrictsList([]);
      }
    } else {
      setSubdistrictsList([]);
    }
  };

  // ฟังก์ชันเมื่อเลือกตำบล
  const handleSubdistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = subdistrictsList.find(
      s => s.code.toString() === e.target.value
    );

    if (!selected) {
      setZipCode('');
      return;
    }

    // อัปเดต state พร้อมกัน
    setZipCode(selected.zipCode || '');

    // อัปเดตแผนที่
    if (selected.latitude && selected.longitude) {
      setDefaultCenter({
        lat: Number(selected.latitude),
        lng: Number(selected.longitude),
      });
      setLocation({
        lat: Number(selected.latitude),
        lng: Number(selected.longitude),
      });
    }
    setCalendarData(prev => ({
      ...prev,
      subdistrictCode: e.target.value,
    }));
  };

  const handleZipCodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const zipCode = e.target.value;
    setZipCode(zipCode);
    setError(prev => ({ ...prev, zipcode: '' }));

    // ถ้า zipcode มี 5 หลัก (รูปแบบไทย) ให้ค้นหา
    if (zipCode.length === 5) {
      try {
        const subdristict = await getAllSubdistricts();
        // 1. ค้นหาตำบลที่ตรงกับ zipcode
        const matchedSubdistrict = subdristict.find(
          (s: Subdistrict) => s.zipCode.toString() === zipCode
        );

        console.log('matchedSubdistrict:', matchedSubdistrict);

        if (matchedSubdistrict) {
          // 2. ค้นหาอำเภอที่เกี่ยวข้อง
          const district = districtsList.find(
            d =>
              d.code.toString() === matchedSubdistrict.districtCode.toString()
          );
          console.log('handleZipCode district:', district);

          if (!district) {
            console.error(
              'District not found for code:',
              matchedSubdistrict.districtCode
            );
            return;
          } else {
            setSelectedDistrict(district);
            handleDistrictChange({
              target: { value: district.code.toString() },
            } as React.ChangeEvent<HTMLSelectElement>);
          }

          // 3. ค้นหาจังหวัดที่เกี่ยวข้อง
          const province = provinceList.find(
            p => p.code === district.provinceCode
          );

          if (!province) {
            console.error(
              'Province not found for code:',
              district.provinceCode
            );
            return;
          } else {
            setSelectedProvince(province);
            handleProvinceChange({
              target: { value: province.code.toString() },
            } as React.ChangeEvent<HTMLSelectElement>);
          }

          // 4. อัปเดต state ต่างๆ

          setCalendarData({
            ...calendarData,
            subdistrictCode: matchedSubdistrict.code.toString(),
            latitude: matchedSubdistrict.latitude?.toFixed(6),
            longitude: matchedSubdistrict.longitude?.toFixed(6),
          });

          // 5. อัปเดตแผนที่
          if (matchedSubdistrict.latitude && matchedSubdistrict.longitude) {
            setDefaultCenter({
              lat: Number(matchedSubdistrict.latitude),
              lng: Number(matchedSubdistrict.longitude),
            });
          }

          // 6. อัปเดต dropdown (ถ้าจำเป็น)
          // อาจต้องโหลดข้อมูลอำเภอ/จังหวัดเพิ่มเติมถ้ายังไม่มีใน list
        } else {
          Swal.fire({
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบตำบลที่ตรงกับรหัสไปรษณีย์นี้',
            icon: 'warning',
          });
        }
      } catch (error) {
        console.error('Error searching by zipcode:', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถค้นหาข้อมูลจากรหัสไปรษณีย์ได้',
          icon: 'error',
        });
      }
    }
  };
  useEffect(() => {
    const handleMapLink = async () => {
      const rawLink = String(calendarData.mapLink ?? '').trim();
      if (!rawLink) return;

      let resolved = rawLink;
      if (resolved.includes('goo.gl')) {
        try {
          const full = await resolveGoogleMapLink(resolved);
          if (full) resolved = full;
        } catch {
          return;
        }
      }

      const coords = extractLatLngFromGoogleMapsUrl(resolved);
      if (coords && !isNaN(coords.lat) && !isNaN(coords.lng)) {
        const lat = +coords.lat.toFixed(6),
          lng = +coords.lng.toFixed(6);
        //console.log('Extracted from mapLink โ’', { lat, lng });
        setLocation({ lat, lng });
        setDefaultCenter({ lat, lng });
        setCalendarData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));
      }
    };

    handleMapLink();
  }, [calendarData.mapLink]);

  useEffect(() => {
    if (location) {
      setCalendarData(prev => ({
        ...prev,
        latitude: location?.lat.toFixed(6) || '',
        longitude: location?.lng.toFixed(6) || '',
      }));
    }
  }, [location]);

  const resolveFinalLatLng = (): { lat: string; lng: string } | null => {
    const rawLink = String(calendarData.mapLink ?? '').trim();
    const linkCoords = extractLatLngFromGoogleMapsUrl(rawLink);

    if (rawLink && linkCoords && !isNaN(linkCoords.lat) && !isNaN(linkCoords.lng)) {
      return {
        lat: linkCoords.lat.toFixed(6),
        lng: linkCoords.lng.toFixed(6),
      };
    }

    if (location && !isNaN(location.lat) && !isNaN(location.lng)) {
      return {
        lat: location.lat.toFixed(6),
        lng: location.lng.toFixed(6),
      };
    }

    const subdistrict = subdistrictsList.find(
      s => s.code.toString() === calendarData.subdistrictCode?.toString()
    );
    if (subdistrict && subdistrict.latitude && subdistrict.longitude) {
      return {
        lat: Number(subdistrict.latitude).toFixed(6),
        lng: Number(subdistrict.longitude).toFixed(6),
      };
    }

    return null;
  };

  // handleSubmit ************************************************************************************************************************
  const handleSubmit = async () => {
    const validationErrors: Record<string, string> = {};
    if (
      calendarData.numberOfSamples === null ||
      isNaN(calendarData.numberOfSamples)
    ) {
      validationErrors.numberOfSamples = 'กรุณากรอกจำนวนตัวอย่าง';
    } else if (calendarData.numberOfSamples <= 0) {
      validationErrors.numberOfSamples =
        'กรุณากรอกจำนวนตัวอย่าง อย่างน้อย 1 ตัวอย่าง';
    }

    if (calendarData.busId === null || isNaN(Number(calendarData.busId))) {
      validationErrors.busId = 'กรุณาเลือกรถบริการ';
    }

    if (!calendarData.description || calendarData.description.trim() === '') {
      validationErrors.description = 'กรุณากรอกสถานที่ให้บริการ';
    }

    if (!selectedProvince?.code) {
      validationErrors.provinceCode = 'กรุณาเลือกจังหวัด';
    }

    if (!selectedDistrict?.code) {
      validationErrors.districtCode = 'กรุณาเลือกอำเภอ';
    }

    if (!calendarData.subdistrictCode?.toString().trim()) {
      validationErrors.subdistrictCode = 'กรุณาเลือกตำบล';
    }

    if (!zipcode.trim()) {
      validationErrors.zipcode = 'กรุณาระบุรหัสไปรษณีย์';
    }

    if (!calendarData.village || calendarData.village.trim() === '') {
      validationErrors.village = 'กรุณากรอกชื่อหมู่บ้าน';
    }

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    const finalLatLng = resolveFinalLatLng();

    if (!finalLatLng) {
      Swal.fire({
        icon: 'error',
        title: 'ไม่พบพิกัด',
        text: 'ไม่สามารถระบุพิกัดได้จากลิงก์แผนที่, หมุด, หรือข้อมูลตำบล กรุณาตรวจสอบอีกครั้ง',
      });
      return;
    }

    const calendarToSubmit: CalendarInput = {
      ...calendarData,
      latitude: finalLatLng.lat,
      longitude: finalLatLng.lng,
    };

    try {
      const response = await updateServiceCalendar(
        serviceCalendaId,
        calendarToSubmit
      );
      console.log('Form submitted:', response);

      Swal.fire({
        title: 'สำเร็จ!',
        text: 'แก้ไขข้อมูลปฏิทินให้บริการเรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate('/admin/service-calendar');
      });
    } catch (error) {
      console.error('Error creating calendar:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถแก้ข้อมูลปฏิทินให้บริการได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      throw error;
    }
  };

  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState<null | {
    type: 'delete' | 'cancel';
    index?: number;
  }>(null);

  return (
    <>
      {/* Statistics Cards */}
      <div className="row">
        <ServiceCalenderCard />
      </div>

      {/* Add Form and Map */}
      <div className="row">
        <div className="col-md-6 order-1 order-lg-2">
          <div className="col-md-12">
            <div className="private-card">
              <div className="private-card-header">
                <div className="private-card-title">พิกัดการให้บริการ</div>
              </div>
              <div className="private-card-body">
                <LeafletMapPicker
                  center={defaultCenter}
                  onChange={setLocation}
                />
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
                  <h4 className="private-card-title">แก้ไขปฏิทินให้บริการ</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color="btn-info"
                    icon="fa fa-list"
                    link={`/admin/service-calendar/${serviceCalendaId}`}
                  />
                </div>
              </div>
            </div>
            <div className="private-card-body">
              <div className="col-md-8 ms-auto me-auto">
                <GenFormSelect
                  isRequired={true}
                  id="Bus"
                  name="bus"
                  label="รถให้บริการ"
                  options={busList.map(bus => ({
                    value: bus.busId.toString(),
                    name: `${bus.busNumber} - ${bus.busName} `,
                    // name: `${bus.busNumber} - ${bus.busName} (${bus.licensePlate})`,
                  }))}
                  value={calendarData.busId?.toString()}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setCalendarData({
                      ...calendarData,
                      busId: parseInt(e.target.value),
                    });
                    setError(prev => ({ ...prev, busId: '' }));
                  }}
                />
                {error.busId && (
                  <div className="text-danger ms-2">{error.busId}</div>
                )}
                <GenFormDate1
                  isRequired={true}
                  id="dd"
                  name="date"
                  label="วันที่ให้บริการ"
                  value={
                    calendarData?.date
                      ? calendarData.date.toISOString().slice(0, 10)
                      : ''
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCalendarData({
                      ...calendarData,
                      date: new Date(e.target.value),
                    })
                  }
                />
                <GenFormText1
                  isRequired={true}
                  id="num"
                  name="num-samples"
                  label="จำนวนตัวอย่าง"
                  placeholder="ระบุจำนวนตัวอย่างต่อวัน"
                  value={calendarData.numberOfSamples?.toString() || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setCalendarData({
                        ...calendarData,
                        numberOfSamples: value === '' ? null : parseInt(value),
                      });
                    }
                    setError(prev => ({ ...prev, numberOfSamples: '' }));
                  }}
                  errorMessage={error.numberOfSamples}
                />
                <GenFormText1
                  isRequired={true}
                  id="description"
                  name="description"
                  label="สถานที่ให้บริการ"
                  placeholder="ระบุสถานที่ให้บริการ (คำอธิบายตำแหน่ง)"
                  value={calendarData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setCalendarData({
                      ...calendarData,
                      description: e.target.value,
                    });
                    setError(prev => ({ ...prev, description: '' }));
                  }}
                  errorMessage={error.description}
                />
                <GenFormSelect
                  isRequired
                  id="Province"
                  name="province"
                  label="จังหวัด"
                  options={provinceList.map(p => ({
                    value: p.code.toString(),
                    name: p.nameTh,
                  }))}
                  value={selectedProvince?.code.toString() || ''}
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    setError(prev => ({ ...prev, provinceCode: '' }));
                    await handleProvinceChange(e);
                  }}
                />
                {error.provinceCode && (
                  <div className="text-danger ms-2">{error.provinceCode}</div>
                )}

                <GenFormSelect
                  isRequired
                  id="District"
                  name="district"
                  label="อำเภอ"
                  options={districtsList.map(d => ({
                    value: d.code.toString(),
                    name: d.nameTh,
                  }))}
                  value={selectedDistrict?.code.toString() || ''}
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    setError(prev => ({ ...prev, districtCode: '' }));
                    await handleDistrictChange(e);
                  }}
                />
                {error.districtCode && (
                  <div className="text-danger ms-2">{error.districtCode}</div>
                )}

                <GenFormSelect
                  isRequired
                  id="subDistrict"
                  name="subDistrict"
                  label="ตำบล"
                  options={subdistrictsList.map(s => ({
                    value: s.code.toString(),
                    name: s.nameTh,
                  }))}
                  value={calendarData.subdistrictCode?.toString() || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setError(prev => ({ ...prev, subdistrictCode: '' }));
                    handleSubdistrictChange(e);
                  }}
                  emptyMessage="-- กรุณาเลือกอำเภอก่อนเลือกตำบล --"
                />
                {error.subdistrictCode && (
                  <div className="text-danger ms-2">{error.subdistrictCode}</div>
                )}

                <GenFormText1
                  isRequired={true}
                  id="zipcode"
                  name="zip-code"
                  label="รหัสไปรษณีย์"
                  placeholder="ระบุรหัสไปรษณีย์"
                  value={zipcode}
                  onChange={handleZipCodeChange}
                  errorMessage={error.zipcode}
                />

                <GenFormText1
                  isRequired={true}
                  id="village"
                  name="village"
                  label="หมู่บ้าน"
                  placeholder="ระบุหมู่บ้าน"
                  value={calendarData.village}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setCalendarData({
                      ...calendarData,
                      village: e.target.value,
                    });
                    setError(prev => ({ ...prev, village: '' }));
                  }}
                  errorMessage={error.village}
                />
                <GenFormText1
                  id="mapLink"
                  name="mapLink"
                  label="ลิงก์ Google Maps"
                  placeholder="วางลิงก์ Google Maps ที่นี่"
                  value={calendarData.mapLink}
                  onChange={e =>
                    setCalendarData({
                      ...calendarData,
                      mapLink: e.target.value,
                    })
                  }
                  isRequired={false}
                />

                <div className="private-action-footer d-flex justify-content-between">
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{ width: '110px' }}
                    onClick={handleSubmit}
                  >
                    แก้ไขปฏิทิน
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ width: '110px' }}
                    onClick={() => setShowConfirm({ type: 'cancel' })}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title={
            showConfirm.type === 'delete' ? 'ยืนยันการลบ' : 'ยืนยันการยกเลิก'
          }
          text={
            showConfirm.type === 'delete'
              ? 'คุณต้องการลบประเภทการประเมินนี้หรือไม่?'
              : 'คุณต้องการยกเลิกการแก้ไขหรือไม่?'
          }
          action={showConfirm.type}
          onConfirm={() => {
            navigate('/admin/service-calendar');
          }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};

export default CalendarEdit;

