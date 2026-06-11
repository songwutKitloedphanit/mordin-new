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

const shortMonths = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

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
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    order: 'ASC',
  });

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
        console.error('โ Search error: ', error);
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
      console.error('โ Fetch error: ', error);
      return { data: [], total: 0, totalPages: 0 };
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
        setCalendars(
          calendars.filter(calendar => calendar.serviceCalendarId !== deleteId)
        );
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

  return (
    <>
      {/* Map */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-map-marker-alt me-2" />
                พิกัดให้บริการ
              </h4>
            </div>
            <div className="private-card-body">
              <LeafletMap markers={location} />
            </div>
          </div>
        </div>
      </div>

      {/* Year / Month Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-calendar-alt me-2" />
                เลือกช่วงเวลา
              </h4>
            </div>
            <div className="private-card-body py-3">
              <div className="d-flex align-items-center gap-3">
                <select
                  className="form-select form-select-sm flex-shrink-0"
                  style={{ width: 100 }}
                  value={searchForm.year}
                  onChange={e =>
                    setSearchForm(prev => ({
                      ...prev,
                      year: parseInt(e.target.value),
                    }))
                  }
                >
                  {[2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="flex-fill d-flex justify-content-center">
                  <ul
                    className="nav nav-pills nav-secondary mb-0 flex-wrap justify-content-center"
                    role="tablist"
                  >
                    {shortMonths.map((month, index) => (
                      <li className="nav-item" key={month}>
                        <a
                          className={`nav-link ${index + 1 === searchForm.month ? 'active' : ''}`}
                          onClick={() => handleMonthClick(index)}
                          role="tab"
                          style={{ cursor: 'pointer' }}
                        >
                          {month}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <ServiceCalendarCard year={searchForm.year} month={searchForm.month} />

      {/* Calendar Table */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-calendar-alt me-2" />
                ปฏิทินให้บริการเดือน{months[(searchForm.month ?? 1) - 1]}
              </h4>
              <GenButtonCircle
                color={B_LIST.add.color}
                icon={B_LIST.add.icon}
                link="/admin/service-calendar/add"
              />
            </div>
            <div className="private-card-body">
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
                    header: 'จัดการ',
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
                    header: 'แก้ไขล่าสุด',
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
          text={`คุณแน่ใจหรือไม่ที่จะลบรายการ ${selectCalendar?.bus.busName} วันที่ ${selectCalendar?.date}?`}
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
