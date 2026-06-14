import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { DataTableFilter } from '../../../components/gui/DataTableFilter';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { deleteLandById, getAllLands } from '../../../services/api/LandApi';
import { LandInfoInterface } from '../../../types/Land';
import { TimeStampToDate } from '../../../utils/Date';

import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import LandCard from '@/components/pages/land/LandCard';

const LandManagement = () => {
  const [lands, setLands] = useState<LandInfoInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [landMarkers, setLandMarkers] = useState<MapMarkerData[]>([]);
  const [deleteLand, setDeleteLand] = useState<number | null>(null);
  useEffect(() => {
    const fetchLands = async () => {
      try {
        const data = await getAllLands();
        setLands(data);
        console.log(data);

        setLandMarkers(
          data.map((land: LandInfoInterface) => ({
            id: land.landId,
            lat: Number(land.latitude),
            lng: Number(land.longitude),
          }))
        );
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lands:', error);
        setLoading(false);
      }
    };

    fetchLands();
  }, []);

  // const poorSoilCount = lands.filter((land) => land.result === 'ต้องปรับปรุง').length;
  // const normalSoilCount = lands.filter((land) => land.result === 'ปกติ').length;
  // const fertileSoilCount = lands.filter((land) => land.result === 'สมบูรณ์').length;

  return (
    <>
      {/* Google Maps */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Land Location</div>
            </div>
            <div className="card-body">
              <LeafletMap markers={landMarkers} />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row">
        <LandCard />
      </div>

      {/* Lands Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">Land Management</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    link="/admin/land/add"
                    className="mx-1"
                  />
                  <GenButtonCircle
                    color={B_LIST['farmer-add'].color}
                    icon={B_LIST['farmer-add'].icon}
                    link="/admin/farmer/add"
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <table
                    id="my-table-id"
                    className="table table-striped table-hover"
                  >
                    <thead>
                      <tr>
                        <th>ชื่อ นามสกุล</th>
                        <th>รหัสโคต้าอ้อย</th>
                        <th>หมายเลขแปลง</th>
                        <th>ชื่อแปลง</th>
                        <th>จังหวัด</th>
                        <th>อำเภอ</th>
                        <th>พื้นที่ (ไร่)</th>
                        <th>ตรวจล่าสุด</th>
                        <th>ผลล่าสุด</th>
                        <th>Link</th>
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tfoot>
                      <tr>
                        <th>ชื่อ นามสกุล</th>
                        <th>รหัสโคต้าอ้อย</th>
                        <th>หมายเลขแปลง</th>
                        <th>ชื่อแปลง</th>
                        <th>จังหวัด</th>
                        <th>อำเภอ</th>
                        <th>พื้นที่ (ไร่)</th>
                        <th>ตรวจล่าสุด</th>
                        <th>ผลล่าสุด</th>
                        <th>Link</th>
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </tfoot>
                    <tbody>
                      {lands.map(land => (
                        <tr key={land.landId}>
                          <td>
                            {land.farmer.firstName} {land.farmer.lastName}
                          </td>
                          <td>{land.quotaCode}</td>
                          <td>{land.landCode}</td>
                          <td>{land.name}</td>
                          <td>
                            {land?.subdistrict?.district?.province?.nameTh ??
                              '-'}
                          </td>
                          <td>{land?.subdistrict?.district?.nameTh ?? '-'}</td>
                          <td>{land.areaSize}</td>
                          <td>{TimeStampToDate(Number(land.updatedAt))}</td>
                          <td>{''}</td>
                          <td>
                            <GenButtonCircle
                              icon={B_LIST.location.icon}
                              color={B_LIST.location.color}
                              onClick={() => {
                                const lat = land.latitude;
                                const lng = land.longitude;
                                const googleMapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                                window.open(googleMapUrl, '_blank'); // เปิดในแท็บใหม่
                              }}
                            />
                            <GenButtonCircle
                              color={B_LIST.farmer.color}
                              icon={B_LIST.farmer.icon}
                              link={`/admin/farmer/${land.farmer.farmerId}`}
                            />
                          </td>
                          <td>
                            <GenButtonCircle
                              color={B_LIST.info.color}
                              icon={B_LIST.info.icon}
                              link={`/admin/land/${land.landId}`}
                              className="mx-3"
                            />
                            <GenButtonCircle
                              color={B_LIST.del.color}
                              icon={B_LIST.del.icon}
                              onClick={() => setDeleteLand(land.landId)}
                            />
                          </td>
                          <td>{TimeStampToDate(Number(land.updatedAt))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <DataTableFilter tableId="my-table-id" loading={loading} />
              </div>
            </div>
          </div>
        </div>
        {deleteLand !== null && (
          <ConfirmAlert
            title="ยืนยันการลบแปลง"
            text={`คุณแน่ใจหรือไม่ที่จะลบแปลงหมายเลข ${deleteLand} ?`}
            action="delete"
            onConfirm={async () => {
              if (deleteLand) {
                try {
                  await deleteLandById(deleteLand);
                  setLands(prev => prev.filter(l => l.landId !== deleteLand));
                  setDeleteLand(null);
                  Swal.fire({
                    title: 'สำเร็จ!',
                    text: 'ลบแปลงสำเร็จแล้ว',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                  });
                } catch (error: any) {
                  const message =
                    error?.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ';
                  Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: message,
                    icon: 'error',
                    confirmButtonText: 'ตกลง',
                  });
                  setDeleteLand(null);
                }
              }
            }}
            onCancel={() => setDeleteLand(null)}
          />
        )}
      </div>
    </>
  );
};

export default LandManagement;
