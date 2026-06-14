import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import {
  GenFormDate1,
  GenFormText1,
  GenFormSelect,
} from '../../../components/gui/GuiForm';
import { getDistrictsByProvinceCode } from '../../../services/api/address/DistrictApi';
import { getAllProvinces } from '../../../services/api/address/ProvinceApi';
import { getSubdistrictsByDistrictCode } from '../../../services/api/address/SubdistrictApi';
import { getAllBuses } from '../../../services/api/BusApi';
import {
  createServiceCalendar,
  resolveGoogleMapLink,
} from '../../../services/api/ServiceCalendarApi';
import { Bus } from '../../../types/Bus';
import { CalendarInput } from '../../../types/ServiceCalendar';

import LeafletMapMarker from '@/components/map/LeafletMapMarker';
import ServiceCalenderCard from '@/components/pages/service-calender/ServiceCalendarCard';
import { Province, Subdistrict, District } from '@/types/address';
import { extractLatLngFromGoogleMapsUrl } from '@/utils/Map';

interface LatLng {
  location?: { lat: number; lng: number };
  lat: number;
  lng: number;
}

interface SelectOption {
  value: string;
  name: string;
}

const CalendarAdd: React.FC = () => {
  const [location, setLocation] = useState<LatLng | undefined>();
  const [zipcode, setZipCode] = useState<string>('');
  const [defaultCenter, setDefaultCenter] = useState<LatLng>({
    lat: 13.736717,
    lng: 100.523186,
  });

  const [error, setError] = useState<Record<string, string>>({});
  const [busList, setBusList] = useState<Bus[]>([]);
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [, setDistrictsList] = useState<District[]>([]);
  const [subdistrictsList, setSubdistrictsList] = useState<Subdistrict[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | undefined>(
    undefined
  );
  const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>(
    undefined
  );
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<SelectOption[]>(
    []
  );

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

  // โหลดข้อมูลตอน component สร้าง
  useEffect(() => {
    const fetchAllData = async () => {
      const provincesResponse = await getAllProvinces();
      const busesResponse = await getAllBuses();
      setProvinceList(provincesResponse || []);
      setBusList(busesResponse || []);
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (busList.length > 0 && calendarData.busId === null) {
      setCalendarData(prev => ({
        ...prev,
        busId: busList[0].busId,
      }));
    }
  }, [busList, calendarData.busId]);

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
        setDistrictOptions([
          { value: '', name: '--กรุณาเลือกเขต/อำเภอ--' },
          ...(districtsResponse?.map((d: District) => ({
            value: d.code,
            name: d.nameTh,
          })) || []),
        ]);

        setSelectedProvince(Number(provinceCode));
        setSubdistrictsList([]);
        setZipCode('');
        console.log('จังหวัดที่เลือก', provinceCode);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลอำเภอ:', error);
        setDistrictsList([]);
      }
    } else {
      setDistrictsList([]);
    }
  };

  // console.log(districtsList);

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
        setSubdistrictOptions([
          { value: '', name: '--กรุณาเลือกตำบล--' },
          ...(subdistrictsResponse?.map((s: Subdistrict) => ({
            value: s.code,
            name: s.nameTh,
          })) || []),
        ]);
        setSelectedDistrict(Number(districtCode));
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

    setZipCode(selected.zipCode || '');

    if (selected.zipCode) {
      setError({ ...error, zipcode: '', subdistrictCode: '' });
    }

    // ✨ ถ้ายังไม่มี mapLink → set defaultCenter และ location จากตำบล
    if (!calendarData.mapLink && selected.latitude && selected.longitude) {
      const lat = Number(selected.latitude);
      const lng = Number(selected.longitude);
      setDefaultCenter({ lat, lng });
      setLocation({ lat, lng });
    }

    setCalendarData(prev => ({
      ...prev,
      subdistrictCode: e.target.value,
    }));
  };

  // console.log('defaultCenter', defaultCenter);
  // console.log('Map location changed useEffect:', location);

  useEffect(() => {
    if (location) {
      setCalendarData(prev => ({
        ...prev,
        latitude: location.lat.toFixed(6),
        longitude: location.lng.toFixed(6),
      }));
    }
  }, [location]);

  useEffect(() => {
    const handleMapLink = async () => {
      const rawLink =
        typeof calendarData.mapLink === 'string'
          ? calendarData.mapLink.trim()
          : calendarData.mapLink !== undefined && calendarData.mapLink !== null
            ? String(calendarData.mapLink).trim()
            : '';

      if (!rawLink) return;

      let resolvedUrl = rawLink;

      // 🌐 หากเป็นลิงก์สั้น (short link)
      if (resolvedUrl.includes('goo.gl')) {
        try {
          const fullUrl = await resolveGoogleMapLink(resolvedUrl);

          if (fullUrl) {
            resolvedUrl = fullUrl;
          } else {
            console.warn('❌ ไม่สามารถ resolve ลิงก์สั้นได้:', rawLink);
            return;
          }
        } catch (err) {
          console.error('🔥 Error while resolving Google Map link:', err);
          return;
        }
      }

      // 📍 Extract พิกัดจากลิงก์ (full URL เท่านั้น)
      const coords = extractLatLngFromGoogleMapsUrl(resolvedUrl);
      if (coords && !isNaN(coords.lat) && !isNaN(coords.lng)) {
        const lat = Number(coords.lat.toFixed(6));
        const lng = Number(coords.lng.toFixed(6));

        setCalendarData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));
        setLocation({ lat, lng }); // สำหรับแผนที่
        setDefaultCenter({ lat, lng });
      } else {
        console.warn('ไม่สามารถดึงพิกัดจากลิงก์:', resolvedUrl);
      }
    };

    handleMapLink();
  }, [calendarData.mapLink]);

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

    if (calendarData.busId === null) {
      validationErrors.busId = 'กรุณาเลือกรถบริการ';
    }

    if (!calendarData.description || calendarData.description.trim() === '') {
      validationErrors.description = 'กรุณากรอกสถานที่ให้บริการ';
    }

    if (!calendarData.village || calendarData.village.trim() === '') {
      validationErrors.village = 'กรุณากรอกชื่อหมู่บ้าน';
    }

    if (
      !calendarData.subdistrictCode ||
      calendarData.subdistrictCode.trim() === ''
    ) {
      validationErrors.subdistrictCode = 'กรุณาเลือกตำบล';
    }

    if (!selectedProvince) {
      validationErrors.provinceCode = 'กรุณาเลือกจังหวัด';
    }

    if (!selectedDistrict) {
      validationErrors.districtCode = 'กรุณาเลือกอำเภอ';
    }

    if (!zipcode) {
      validationErrors.zipcode = 'กรุณากรอกรหัสไปรษณีย์';
    }

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    // 🎯 NEW: ฟังก์ชันเลือกพิกัดตามลำดับความสำคัญ
    const resolveFinalLatLng = (): { lat: string; lng: string } | null => {
      const rawLink =
        typeof calendarData.mapLink === 'string'
          ? calendarData.mapLink.trim()
          : calendarData.mapLink !== undefined && calendarData.mapLink !== null
            ? String(calendarData.mapLink).trim()
            : '';
      const linkCoords = extractLatLngFromGoogleMapsUrl(rawLink);

      if (
        rawLink &&
        linkCoords &&
        !isNaN(linkCoords.lat) &&
        !isNaN(linkCoords.lng)
      ) {
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
        s => s.code === calendarData.subdistrictCode
      );
      if (subdistrict && subdistrict.latitude && subdistrict.longitude) {
        return {
          lat: Number(subdistrict.latitude).toFixed(6),
          lng: Number(subdistrict.longitude).toFixed(6),
        };
      }

      return null;
    };

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
      const response = await createServiceCalendar(calendarToSubmit);
      console.log('Form submitted:', response);

      Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มข้อมูลปฏิทินให้บริการเรียบร้อยแล้ว',
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
        text: 'ไม่สามารถบันทึกข้อมูลปฏิทินให้บริการได้',
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
            <div className="card">
              <div className="card-header">
                <div className="card-title">พิกัดการให้บริการ</div>
              </div>
              <div className="card-body">
                {calendarData.subdistrictCode || calendarData.mapLink ? (
                  <LeafletMapMarker
                    center={defaultCenter}
                    onChange={setLocation}
                  />
                ) : (
                  <p>กรุณาเลือกตำบลหรือกรอกลิงก์แผนที่</p>
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
                  <h4 className="card-title">เพิ่มปฏิทินให้บริการ</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.list.color}
                    icon={B_LIST.list.icon}
                    link="/admin/service-calendar"
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
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
                    // const selectedValue = e.target.value;
                    // console.log("Selected busId:", selectedValue); // เพิ่มบรรทัดนี้เพื่อ debug
                    if (e.target.value) {
                      setCalendarData({
                        ...calendarData,
                        busId: parseInt(e.target.value),
                      });
                    }
                    setError({ ...error, busId: '' });
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
                  value={calendarData.date.toISOString().split('T')[0]} // แปลง date เป็น yyyy-mm-dd
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setCalendarData({
                      ...calendarData,
                      date: new Date(e.target.value),
                    });
                  }}
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
                    setError({ ...error, numberOfSamples: '' });
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
                    setError({ ...error, description: '' });
                  }}
                  errorMessage={error.description}
                />
                <GenFormSelect
                  isRequired
                  id="Province"
                  name="province"
                  label="จังหวัด"
                  options={[
                    { value: '', name: '--กรุณาเลือกจังหวัด--' },
                    ...provinceList.map(p => ({
                      value: p.code,
                      name: p.nameTh,
                    })),
                  ]}
                  value={selectedProvince}
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    setError({ ...error, provinceCode: '' });
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
                  label="เขต/อำเภอ"
                  options={districtOptions}
                  value={selectedDistrict}
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    setError({ ...error, districtCode: '' });
                    await handleDistrictChange(e);
                  }}
                  emptyMessage="-- กรุณาเลือกจังหวัดก่อนเลือกอำเภอ --"
                />
                {error.districtCode && (
                  <div className="text-danger ms-2">{error.districtCode}</div>
                )}

                <GenFormSelect
                  isRequired
                  id="subDistrict"
                  name="subDistrict"
                  label="แขวง/ตำบล"
                  options={subdistrictOptions}
                  value={calendarData.subdistrictCode?.toString() || ''}
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    setError({ ...error, subdistrictCode: '' });
                    await handleSubdistrictChange(e);
                  }}
                  emptyMessage="-- กรุณาเลือกอำเภอก่อนเลือกตำบล --"
                />
                {error.subdistrictCode && (
                  <div className="text-danger ms-2">
                    {error.subdistrictCode}
                  </div>
                )}

                <GenFormText1
                  isRequired={true}
                  id="zipcode"
                  name="zip-code"
                  label="รหัสไปรษณีย์"
                  placeholder="ระบุรหัสไปรษณีย์"
                  value={zipcode}
                  // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  //   setError({ ...error, zipcode: "" });
                  //   handleZipCodeChange(e);
                  // }}
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
                    setError({ ...error, village: '' });
                  }}
                  errorMessage={error.village}
                />
                <GenFormText1
                  label="ลิงก์ที่อยู่บนแผนที่"
                  value={calendarData.mapLink}
                  onChange={e =>
                    setCalendarData({
                      ...calendarData,
                      mapLink: e.target.value,
                    })
                  }
                  isRequired={false}
                  id="mapLink"
                  name="mapLink"
                  placeholder="ระบุลิงก์บนแผนที่ เช่น https://maps.app.goo.gl/imDu5B9Tfj9ZTP166"
                />
                <div className="card-action d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: '110px' }}
                    onClick={handleSubmit}
                  >
                    เพิ่มปฏิทิน
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
              : 'คุณต้องการยกเลิกการเพิ่มปฏิทินการให้บริการหรือไม่?'
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

export default CalendarAdd;
