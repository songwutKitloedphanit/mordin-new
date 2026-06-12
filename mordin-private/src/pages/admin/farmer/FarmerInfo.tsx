// eslint-disable-next-line import/order
import React, { useEffect, useState } from 'react';

import 'datatables.net-bs5';
import { useParams } from 'react-router-dom';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { DataTableFilter } from '../../../components/gui/DataTableFilter';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { getFarmerById } from '../../../services/api/FarmerApi';
import { deleteLandById } from '../../../services/api/LandApi';
import type { FarmerInfo } from '../../../types/Farmer';

import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import FarmerCard from '@/components/pages/farmer/farmerCard';
import { LandInfoInterface } from '@/types/Land';
import { formatThaiDateWithOutWeekly } from '@/utils/Date';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';
import { swalSuccessTimer, swalError } from '@/utils/swal';

const FarmerInfo: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const farmerId = id ? parseInt(id, 10) : undefined;
  const [deleteLandId, setDeleteLandId] = useState<number | null>(null);
  const [farmerInfo, setFarmerInfo] = useState<FarmerInfo>({} as FarmerInfo);
  // const [allFarmers, setAllFarmers] = useState([]);
  const [allLocation, setAllLocation] = useState<MapMarkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!farmerId) {
      setIsLoading(false);
      return;
    }

    const fetchFarmerData = async () => {
      try {
        setIsLoading(true);
        const data = await getFarmerById(farmerId);
        if (!data) {
          setIsLoading(false);
          return;
        }

        setAllLocation(
          (data.lands ?? []).map((land: LandInfoInterface) => ({
            id: land.landId,
            lat: Number(land.latitude),
            lng: Number(land.longitude),
          }))
        );

        setFarmerInfo(data || {});
      } catch (err) {
        console.error('Error fetching farmer data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmerData();
  }, [farmerId]);

  // const [allFarmers, setAllFarmers] = useState([]);
  return (
    <div>
      {/* Statistics Cards */}
      <div className="row">
        <FarmerCard />
      </div>
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
                    ข้อมูลเกษตรกร({farmerInfo.phone})
                  </h4>
                </div>
                <div
                  className="col-md-6 col-sm-4 col-4 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.list.color}
                    icon={B_LIST.list.icon}
                    link="/admin/farmer"
                    className="mx-1"
                  />
                  <GenButtonCircle
                    color={B_LIST.edit.color}
                    icon={B_LIST.edit.icon}
                    link={`/admin/farmer/${farmerInfo.farmerId}/edit`}
                  />
                </div>
              </div>
            </div>
            <div className="private-card-body">
              <div className="col-md-12 ms-auto me-auto">
                <div className="row p-4">
                  {isLoading ? (
                    <div className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="col-md-8">
                        <table style={{ minHeight: '245px' }}>
                          <tbody>
                            <tr>
                              <th>ประเภทบัตร</th>
                              <td>
                                {farmerInfo.thaiNationalId
                                  ? 'บัตรประชาชน'
                                  : 'บัตรเกษตรกร'}
                              </td>
                            </tr>
                            <tr>
                              <th>หมายเลขบัตร</th>
                              <td>
                                {farmerInfo.thaiNationalId
                                  ? formatThaiNationalId(
                                      farmerInfo.thaiNationalId
                                    )
                                  : farmerInfo.thaiFarmerId}
                              </td>
                            </tr>
                            <tr>
                              <th>ชื่อ นามสกุล</th>
                              <td>
                                {farmerInfo.firstName} {farmerInfo.lastName}
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={2}>&nbsp;</td>
                            </tr>
                            <tr>
                              <th>โทรศัพท์</th>
                              <td>{farmerInfo.phone}</td>
                            </tr>
                            <tr>
                              <th>วันเดือนปีเกิด</th>
                              <td>
                                {farmerInfo.birthDate
                                  ? formatThaiDateWithOutWeekly(
                                      farmerInfo.birthDate
                                    )
                                  : '-'}
                              </td>
                            </tr>
                            <tr>
                              <th>Line ID</th>
                              <td>{farmerInfo.phone}</td>
                            </tr>
                            <tr>
                              <td colSpan={2}>&nbsp;</td>
                            </tr>
                            <tr>
                              <th>โรงงาน</th>
                              <td>{farmerInfo.factory?.name}</td>
                            </tr>
                            <tr>
                              <th>เขตพื้นที่</th>
                              <td>
                                {farmerInfo.serviceArea?.code}{' '}
                                {farmerInfo.serviceArea?.name}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="col-md-4">
                        <table>
                          <tbody>
                            <tr>
                              <th>จำนวนแปลงรวม</th>
                              <td>&nbsp;{farmerInfo.landCount} แปลง</td>
                            </tr>
                            <tr>
                              <th>รวมพื้นที่</th>
                              <td>{farmerInfo.landSizeSummary} ไร่</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="private-card">
            <div className="private-card-header">
              <div className="private-card-title">พิกัดแปลง</div>
            </div>
            <div className="private-card-body">
              <LeafletMap markers={allLocation} />
            </div>
          </div>
        </div>
      </div>
      {/* Plots Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="private-card">
            <div className="private-card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="private-card-title">ข้อมูลแปลง</h4>
                <GenButtonCircle
                  color={B_LIST.add.color}
                  icon={B_LIST.add.icon}
                  link="/admin/land/add"
                />
              </div>
            </div>
            <div className="private-card-body">
              <div className="table-responsive">
                {isLoading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <table
                    id="multi-filter-select"
                    className="table table-striped table-hover"
                  >
                    <thead>
                      <tr>
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
                      {farmerInfo.lands?.map(land => (
                        <tr key={land.landId}>
                          <td>{land.quotaCode}</td>
                          <td>{land.landCode}</td>
                          <td>{land.name}</td>
                          <td>
                            {land.subdistrict?.district?.province?.nameTh}
                          </td>
                          <td>{land.subdistrict?.district?.nameTh}</td>
                          <td>{land.subdistrict?.nameTh}</td>
                          <td>
                            {land.updatedAt && !isNaN(Number(land.updatedAt))
                              ? new Date(Number(land.updatedAt))
                                  .toISOString()
                                  .split('T')[0]
                              : '-'}
                          </td>
                          <td></td>
                          <td>
                            <GenButtonCircle
                              icon={B_LIST.location.icon}
                              color={B_LIST.location.color}
                              className="mx-3"
                              onClick={() => {
                                const lat = land.latitude;
                                const lng = land.longitude;
                                const googleMapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                                window.open(googleMapUrl, '_blank'); // เปิดในแท็บใหม่
                              }}
                            />
                          </td>
                          <td>
                            <GenButtonCircle
                              icon={B_LIST.info.icon}
                              color={B_LIST.info.color}
                              link={`/admin/land/${land.landId}`}
                              className="mx-3"
                            />
                            <GenButtonCircle
                              icon={B_LIST.del.icon}
                              color={B_LIST.del.color}
                              onClick={() => setDeleteLandId(land.landId)}
                            />
                          </td>
                          {/* showConfirm was previously inside Map, moved outside */}
                          <td>
                            {land.updatedAt && !isNaN(Number(land.updatedAt))
                              ? new Date(Number(land.updatedAt))
                                  .toISOString()
                                  .split('T')[0]
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <DataTableFilter
                  tableId="multi-filter-select"
                  loading={false}
                />
              </div>
            </div>
          </div>
        </div>
        {deleteLandId && (
          <ConfirmAlert
            title={'ยืนยันการลบ'}
            text={`คุณต้องการลบแปลงนี้หรือไม่`}
            action={'delete'}
            onConfirm={async () => {
              if (deleteLandId) {
                try {
                  await deleteLandById(deleteLandId);
                  setFarmerInfo(prev => ({
                    ...prev,
                    lands: prev.lands.filter(l => l.landId !== deleteLandId),
                  }));
                  setDeleteLandId(null);
                  swalSuccessTimer('สำเร็จ!', 'ลบแปลงสำเร็จแล้ว', 2000);
                } catch (error: unknown) {
                  const err = error as {
                    response?: { data?: { message?: string } };
                  };
                  const message =
                    err?.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ';
                  swalError('เกิดข้อผิดพลาด', message);
                  setDeleteLandId(null);
                }
              }
            }}
            onCancel={() => setDeleteLandId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default FarmerInfo;
