import { useCallback, useEffect, useState } from 'react';
import { swalSuccessTimer, swalError } from '@/utils/swal';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import {
  deleteLandById,
  getAllLands,
  getLandSummary,
} from '@/services/api/LandApi';
import { LandInfoInterface, LandSummary } from '@/types/Land';
import { TimeStampToDate } from '@/utils/Date';

const KPI_CONFIG = [
  {
    key: 'totalLands' as keyof LandSummary,
    label: 'แปลงทั้งหมด',
    icon: 'fas fa-map-marked',
    accent: '#18a05c',
    unit: 'แปลง',
  },
  {
    key: 'needsImprovementCount' as keyof LandSummary,
    label: 'ดินต้องปรับปรุง',
    icon: 'fas fa-exclamation-triangle',
    accent: '#E7505A',
    unit: 'แปลง',
  },
  {
    key: 'normalSoilCount' as keyof LandSummary,
    label: 'ดินปกติ',
    icon: 'fas fa-check-circle',
    accent: '#3b9bd9',
    unit: 'แปลง',
  },
  {
    key: 'fertileSoilCount' as keyof LandSummary,
    label: 'ดินสมบูรณ์',
    icon: 'fas fa-leaf',
    accent: '#2fb380',
    unit: 'แปลง',
  },
];

const getFarmerName = (land: LandInfoInterface) =>
  [land.farmer?.firstName, land.farmer?.lastName].filter(Boolean).join(' ') ||
  '-';

const hasValidCoordinate = (
  latitude?: string | number,
  longitude?: string | number
) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng);
};

const LandManagement = () => {
  const [summary, setSummary] = useState<LandSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [landMarkers, setLandMarkers] = useState<MapMarkerData[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setSummaryLoading(true);
    getLandSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    getAllLands()
      .then((data: LandInfoInterface[]) =>
        setLandMarkers(
          data
            .filter(l => hasValidCoordinate(l.latitude, l.longitude))
            .map(l => ({
              id: l.landId,
              lat: Number(l.latitude),
              lng: Number(l.longitude),
              title: l.name,
              subtitle: getFarmerName(l),
            }))
        )
      )
      .catch(console.error);
  }, [refreshKey]);

  const fetchLands = useCallback(async () => {
    const data: LandInfoInterface[] = await getAllLands();
    return { data, total: data.length, totalPages: 1 };
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteLandById(id);
      await swalSuccessTimer('สำเร็จ', 'ลบแปลงเรียบร้อยแล้ว');
      setDeleteTarget(null);
      setRefreshKey(prev => prev + 1);
    } catch (error: unknown) {
      console.error(error);
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message = err?.response?.data?.message || 'ไม่สามารถลบข้อมูลได้';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await swalError('เกิดข้อผิดพลาด', errorMessage);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {KPI_CONFIG.map(cfg => {
          const value = summary?.[cfg.key] ?? 0;
          return (
            <div key={cfg.key} className="col-sm-6 col-lg-3">
              {summaryLoading ? (
                <div
                  className="private-metric-card h-100"
                  style={{ borderLeft: '4px solid rgba(128,128,128,0.2)' }}
                >
                  <div className="private-card-body py-3 px-4">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="flex-fill">
                        <div className="placeholder-glow mb-2">
                          <span
                            className="placeholder d-block rounded"
                            style={{ height: 11, width: '55%' }}
                          />
                        </div>
                        <div className="placeholder-glow">
                          <span
                            className="placeholder d-block rounded"
                            style={{ height: 40, width: '45%' }}
                          />
                        </div>
                      </div>
                      <div
                        className="rounded-circle flex-shrink-0"
                        style={{
                          width: 64,
                          height: 64,
                          backgroundColor: 'rgba(128,128,128,0.1)',
                        }}
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
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div
                          className="text-muted fw-semibold text-uppercase mb-2"
                          style={{
                            fontSize: '0.85rem',
                            letterSpacing: '0.6px',
                          }}
                        >
                          {cfg.label}
                        </div>
                        <div className="d-flex align-items-baseline gap-1">
                          <span
                            className="fw-bold"
                            style={{ fontSize: '3.5rem', lineHeight: 1 }}
                          >
                            {value}
                          </span>
                          <span
                            className="text-muted"
                            style={{ fontSize: '1rem' }}
                          >
                            {cfg.unit}
                          </span>
                        </div>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: 64,
                          height: 64,
                          backgroundColor: `${cfg.accent}1a`,
                        }}
                      >
                        <i
                          className={cfg.icon}
                          style={{ color: cfg.accent, fontSize: '1.8rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Map Card */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-map-marker-alt me-2" />
                ตำแหน่งแปลง
              </h4>
            </div>
            <div className="private-card-body">
              <LeafletMap markers={landMarkers} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-map-marked me-2" />
                จัดการแปลง
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle
                  color={B_LIST.add.color}
                  icon={B_LIST.add.icon}
                  link="/admin/land/add"
                />
                <GenButtonCircle
                  color={B_LIST['farmer-add'].color}
                  icon={B_LIST['farmer-add'].icon}
                  link="/admin/farmer/add"
                />
              </div>
            </div>
            <div className="private-card-body">
              <SearchAndPaginationTable<LandInfoInterface>
                fetchData={fetchLands}
                initialLimit={10}
                refreshKey={refreshKey}
                clientSideFilters
                columns={[
                  {
                    header: 'ชื่อ นามสกุล',
                    accessor: land => getFarmerName(land),
                    sortable: true,
                    sortKey: 'farmer.firstName',
                  },
                  {
                    header: 'รหัสโคต้าอ้อย',
                    accessor: 'quotaCode',
                    sortable: true,
                    sortKey: 'quotaCode',
                  },
                  {
                    header: 'หมายเลขแปลง',
                    accessor: 'landCode',
                    sortable: true,
                    sortKey: 'landCode',
                  },
                  {
                    header: 'ชื่อแปลง',
                    accessor: 'name',
                    sortable: true,
                    sortKey: 'name',
                  },
                  {
                    header: 'จังหวัด',
                    accessor: land =>
                      land?.subdistrict?.district?.province?.nameTh ?? '-',
                    sortable: true,
                    sortKey: 'province',
                    filterable: true,
                  },
                  {
                    header: 'อำเภอ',
                    accessor: land =>
                      land?.subdistrict?.district?.nameTh ?? '-',
                    sortable: true,
                    sortKey: 'district',
                    filterable: true,
                  },
                  {
                    header: 'พื้นที่ (ไร่)',
                    accessor: 'areaSize',
                    sortable: true,
                    sortKey: 'areaSize',
                  },
                  {
                    header: 'ลิงก์',
                    accessor: land => (
                      <>
                        {hasValidCoordinate(land.latitude, land.longitude) && (
                          <GenButtonCircle
                            icon={B_LIST.location.icon}
                            color={B_LIST.location.color}
                            link={`https://www.google.com/maps?q=${land.latitude},${land.longitude}`}
                            isExternal
                          />
                        )}
                        {land.farmer?.farmerId && (
                          <GenButtonCircle
                            color={B_LIST.farmer.color}
                            icon={B_LIST.farmer.icon}
                            link={`/admin/farmer/${land.farmer.farmerId}`}
                            className="mx-1"
                          />
                        )}
                      </>
                    ),
                  },
                  {
                    header: 'จัดการ',
                    accessor: land => (
                      <>
                        <GenButtonCircle
                          color={B_LIST.info.color}
                          icon={B_LIST.info.icon}
                          link={`/admin/land/${land.landId}`}
                          className="mx-1"
                        />
                        <GenButtonCircle
                          color={B_LIST.del.color}
                          icon={B_LIST.del.icon}
                          onClick={() =>
                            setDeleteTarget({
                              id: land.landId,
                              name: land.name,
                            })
                          }
                        />
                      </>
                    ),
                  },
                  {
                    header: 'แก้ไขล่าสุด',
                    accessor: land => TimeStampToDate(Number(land.updatedAt)),
                    sortable: true,
                    sortKey: 'updatedAt',
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmAlert
          title="ยืนยันการลบ"
          text={`คุณต้องการลบแปลง ${deleteTarget.name} หรือไม่?`}
          action="delete"
          onConfirm={() => {
            handleDelete(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
};

export default LandManagement;
