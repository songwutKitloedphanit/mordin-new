import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { getCalendarById } from '../../../services/api/ServiceCalendarApi';
import { CalendarInfoInterface } from '../../../types/ServiceCalendar';
import { formatThaiDate } from '../../../utils/Date';

import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import ServiceCalenderCard from '@/components/pages/service-calender/ServiceCalendarCard';

const CalendarInfo = () => {
  const { id } = useParams();
  const calendarId = Number(id);
  const [calendar, setCalendar] = useState<CalendarInfoInterface>(
    {} as CalendarInfoInterface
  );
  const [location, setLocation] = useState<MapMarkerData[]>([]);

  useEffect(() => {
    const fetchCalendar = async () => {
      const data: CalendarInfoInterface = await getCalendarById(calendarId);
      setCalendar(data);

      setLocation([
        {
          id: 0,
          lat: Number(data.latitude),
          lng: Number(data.longitude),
        },
      ]);
    };
    fetchCalendar();
  }, [calendarId]);

  console.log(calendar);

  return (
    <>
      {/* Statistics Cards */}
      <div className="row">
        <ServiceCalenderCard />
      </div>

      {/* Info and Map */}
      <div className="row">
        <div className="col-md-6">
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-6 col-sm-8 col-8"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="private-card-title">
                    ข้อมูลการให้บริการ(
                    {calendar.bus?.busNumber + ' : ' + calendar.date})
                  </h4>
                </div>
                <div
                  className="col-md-6 col-sm-4 col-4 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.list.color}
                    icon={B_LIST.list.icon}
                    link="/admin/service-calendar"
                    className="mx-1"
                  />
                  <GenButtonCircle
                    color={B_LIST.edit.color}
                    icon={B_LIST.edit.icon}
                    link={`/admin/service-calendar/${calendarId}/edit`}
                  />
                </div>
              </div>
            </div>
            <div className="private-card-body">
              <div className="col-md-12 ms-auto me-auto">
                <div className="row p-4" style={{ minHeight: '285px' }}>
                  <table>
                    <tbody>
                      <tr>
                        <th>หมายเลขรถ</th>
                        <td>{calendar.bus?.busNumber}</td>
                      </tr>
                      <tr>
                        <th>ชื่อรถ</th>
                        <td>{calendar.bus?.busName}</td>
                      </tr>
                      <tr>
                        <th>วันที่ให้บริการ</th>
                        <td colSpan={7}>{formatThaiDate(calendar.date)}</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <th>สถานที่ให้บริการ</th>
                        <td colSpan={7}>
                          {calendar.village}{' '}
                          {calendar.subdistrict?.nameTh + ' '}
                          {calendar.subdistrict?.district?.nameTh}{' '}
                          {calendar.subdistrict?.district?.province?.nameTh}
                        </td>
                      </tr>
                      <tr>
                        <th>ตำบล</th>
                        <td>{calendar.subdistrict?.nameTh}</td>
                      </tr>
                      <tr>
                        <th>อำเภอ</th>
                        <td>{calendar.subdistrict?.district?.nameTh}</td>
                      </tr>
                      <tr>
                        <th>จังหวัด</th>
                        <td>
                          {calendar.subdistrict?.district?.province?.nameTh}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="private-card">
            <div className="private-card-header">
              <div className="private-card-title">พิกัดให้บริการ</div>
            </div>
            <div className="private-card-body">
              <LeafletMap markers={location} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarInfo;
