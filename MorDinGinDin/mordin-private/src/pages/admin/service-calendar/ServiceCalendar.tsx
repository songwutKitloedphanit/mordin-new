import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import {
  deleteServiceCalendar,
  searchServiceCalendars,
} from '../../../services/api/ServiceCalendarApi';
import {
  CalendarInfoInterface,
  CalendarSearch,
} from '../../../types/ServiceCalendar';
import { TimeStampToDate } from '../../../utils/Date';

import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import ServiceCalendarCard from '@/components/pages/service-calender/ServiceCalendarCard';

const ServiceCalendar = () => {
  const [calendars, setCalendars] = useState<CalendarInfoInterface[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectCalendar, setSelectCalendar] = useState<CalendarInfoInterface>();
  const [location, setLocation] = useState<MapMarkerData[]>([]);
  const [searchForm, setSearchForm] = useState<CalendarSearch>({
    search: '',
    page: 1,
    limit: 10,
    year: new Date().getFullYear(), // Default to current year (2025)
    month: new Date().getMonth() + 1, // Default to current month (June = 6), +1 because getMonth() is 0-based
    order: 'ASC',
  });
  const months = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฏาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];

  console.log('searchForm', searchForm);

  useEffect(() => {
    const handleSearch = async () => {
      try {
        setLocation([]);

        const dataResponse = await searchServiceCalendars({
          search: '',
          page: 1,
          limit: 1000,
          year: searchForm.year,
          month: searchForm.month,
        });
        console.log('✅ API response: ', dataResponse.data);
        setCalendars(dataResponse.data || []);
        setLocation(
          dataResponse.data
            .filter(
              (res: CalendarInfoInterface) =>
                res.latitude &&
                res.longitude &&
                !isNaN(res.latitude) &&
                !isNaN(res.longitude)
            )
            .map((res: CalendarInfoInterface) => ({
              id: res.serviceCalendarId,
              lat: res.latitude,
              lng: res.longitude,
            }))
        );
      } catch (error) {
        console.error('❌ Search error: ', error);
        setCalendars([]);
        setLocation([]);
      }
    };
    handleSearch();
  }, [searchForm.year, searchForm.month]);

  const fetchData = async ({
    search = '',
    page = 1,
    limit = 10,
    sortBy = '',
    order = 'ASC',
  }: Partial<CalendarSearch> = {}) => {
    try {
      const response = await searchServiceCalendars({
        search,
        page,
        limit,
        sortBy,
        order,
        year: searchForm.year,
        month: searchForm.month,
      });
      return {
        data: response.data || [],
        total: response.total || 0,
        totalPages:
          response.totalPages || Math.ceil((response.total || 0) / limit),
      };
    } catch (error) {
      console.error('❌ Fetch error: ', error);
      return { data: [], total: 0, totalPages: 0 };
    }
  };

  const handleYearClick = (year: string) => {
    const newYear = parseInt(year);
    if (newYear !== searchForm.year) {
      setSearchForm(prev => ({ ...prev, year: newYear }));
    }
  };

  const handleMonthClick = (monthIndex: number) => {
    const newMonth = monthIndex + 1;
    if (newMonth !== searchForm.month) {
      setSearchForm(prev => ({ ...prev, month: newMonth, page: 1 }));
    }
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteServiceCalendar(deleteId);
        Swal.fire({
          icon: 'success',
          title: 'ลบข้อมูลสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        });
        // วิธีที่ 1: อัปเดต state โดยตรง
        setCalendars(
          calendars.filter(calendar => calendar.serviceCalendarId !== deleteId)
        );
        // วิธีที่ 2: หรือใช้ฟังก์ชันรูปแบบ callback เพื่อความแน่นอน
        // setBusData(prevData => prevData.filter(bus => bus.busId !== selectedBusId));
        setShowDeleteModal(false);
      } catch (error: any) {
        console.error('Error deleting service calendar:', error);
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถลบได้',
          text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบปฏิทิน',
        });
        setShowDeleteModal(false);
      }
    }
  };

  // const allBooking = calendars.reduce(
  //   (sum, calendar) => sum + (calendar.numberOfBookings ?? 0),
  //   0
  // );
  // const allExam = calendars.reduce(
  //   (sum, calendar) => sum + (calendar.numberOfExaminations ?? 0),
  //   0
  // );
  // const allSample = calendars.reduce(
  //   (sum, calendar) => sum + (calendar.numberOfSamples ?? 0),
  //   0
  // );

  // const avialable = allSample - allBooking;
  // const finishSample = allSample - allExam;

  // const getPercent = (x: number, all: number) => {
  //   const percent = (x / all) * 100;
  //   return percent;
  // };

  return (
    <>
      {/* Google Maps */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="card-title">พิกัดให้บริการ</div>
            </div>
            <div className="card-body">
              <LeafletMap markers={location} />
            </div>
          </div>
        </div>
      </div>

      {/* Year and Month Tabs */}
      <div className="row mb-4 d-flex justify-content-between">
        <div
          className="col-md-4 col-sm-12 col-12"
          style={{ textAlign: 'left' }}
        >
          <div className="card-tools">
            <ul
              className="nav nav-pills nav-secondary"
              id="pills-tab"
              role="tablist"
            >
              {['2025', '2026', '2027'].map((year, index) => (
                <li className="nav-item" key={year}>
                  <a
                    className={`nav-link ${parseInt(year) === searchForm.year ? 'active' : ''}`}
                    id={`pills-${year}-tab`}
                    onClick={() => handleYearClick(year)}
                    role="tab"
                    aria-controls="pills-home"
                    aria-selected={index === 0}
                  >
                    {year}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          className="col-md-8 col-sm-12 col-12 ms-auto"
          style={{ textAlign: 'right' }}
        >
          <div className="card-tools d-flex justify-content-end">
            <ul
              className="nav nav-pills nav-secondary"
              id="pills-tab"
              role="tablist"
            >
              {[
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ].map((month, index) => (
                <li className="nav-item" key={month}>
                  <a
                    className={`nav-link ${index + 1 === searchForm.month ? 'active' : ''}`}
                    id={`pills-${month}-tab`}
                    onClick={() => handleMonthClick(index)}
                    role="tab"
                    aria-controls="pills-home"
                    aria-selected={index === 0}
                  >
                    {month}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row">
        <ServiceCalendarCard year={searchForm.year} month={searchForm.month} />
      </div>

      {/* Calendar Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">
                    ปฏิทินให้บริการเดือน{months[(searchForm.month ?? 1) - 1]}
                  </h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    link="/admin/service-calendar/add"
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <SearchAndPaginationTable<CalendarInfoInterface>
                fetchData={fetchData}
                initialLimit={10}
                columns={[
                  {
                    header: 'รถ',
                    accessor: calendar => `${calendar.bus.busName}`,
                    sortable: true,
                    sortKey: 'busName',
                  },
                  {
                    header: 'วันที่',
                    accessor: calendar => `${calendar.date}`,
                    sortable: true,
                    sortKey: 'date',
                  },
                  {
                    header: 'จังหวัด',
                    accessor: calendar =>
                      `${calendar.subdistrict.district?.province?.nameTh}`,
                    sortable: true,
                    sortKey: 'provinceName',
                  },
                  {
                    header: 'อำเภอ',
                    accessor: calendar =>
                      `${calendar.subdistrict.district?.nameTh}`,
                    sortable: true,
                    sortKey: 'districtName',
                  },
                  {
                    header: 'ตำบล',
                    accessor: calendar => `${calendar.subdistrict.nameTh}`,
                    sortable: true,
                    sortKey: 'subdistrictName',
                  },
                  {
                    header: 'หมู่บ้าน',
                    accessor: calendar => `${calendar.village}`,
                    sortable: true,
                    sortKey: 'village',
                  },
                  {
                    header: 'สถานที่ให้บริการ',
                    accessor: calendar => `${calendar.description}`,
                    sortable: true,
                    sortKey: 'description',
                  },
                  {
                    header: 'จำนวนการจอง',
                    accessor: calendar => `${calendar.numberOfBookings}`,
                    sortable: true,
                    sortKey: 'booking',
                  },
                  {
                    header: 'จำนวนการตรวจ',
                    accessor: calendar => `${calendar.numberOfExaminations}`,
                    sortable: true,
                    sortKey: 'examination',
                  },
                  {
                    header: 'จำนวนทั้งหมด',
                    accessor: calendar => `${calendar.numberOfSamples}`,
                    sortable: true,
                    sortKey: 'sample',
                  },
                  {
                    header: 'Management',
                    accessor: calendar => (
                      <>
                        <GenButtonCircle
                          color={B_LIST.location.color}
                          icon={B_LIST.location.icon}
                          onClick={() => {
                            window.open(
                              `https://www.google.com/maps?q=${calendar.latitude},${calendar.longitude}`,
                              '_blank'
                            );
                          }}
                        />
                        <GenButtonCircle
                          color={B_LIST.info.color}
                          icon={B_LIST.info.icon}
                          link={`/admin/service-calendar/${calendar?.serviceCalendarId}`}
                          className="mx-1"
                        />
                        <GenButtonCircle
                          color={B_LIST.del.color}
                          icon={B_LIST.del.icon}
                          onClick={() => {
                            setDeleteId(calendar.serviceCalendarId);
                            setSelectCalendar(calendar);
                            setShowDeleteModal(true);
                          }}
                        />
                      </>
                    ),
                  },
                  {
                    header: 'Update',
                    accessor: row => TimeStampToDate(row.updatedAt),
                    sortable: true,
                    sortKey: 'updateAt',
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal && deleteId !== null && (
        <ConfirmAlert
          title="ยืนยันการลบข้อมูล"
          text={`คุณแน่ใจหรือไม่ที่จะลบรายการ 
            ${selectCalendar?.bus.busName} วันที่ ${selectCalendar?.date}?`}
          action="delete"
          onConfirm={() => handleDelete()}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
        />
      )}
    </>
  );
};

export default ServiceCalendar;
