import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import { deleteBus, getAllBuses, getBusSummary } from '@/services/api/BusApi';
import { Bus, BusSummary } from '@/types/Bus';
import { TimeStampToDate } from '@/utils/Date';

const KPI_CONFIG = [
  { key: 'totalBuses' as keyof BusSummary, label: 'รถให้บริการ', icon: 'fas fa-bus-alt', accent: '#6861CE', unit: 'คัน' },
];

const BusManagement = () => {
  const [summary, setSummary] = useState<BusSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setSummaryLoading(true);
    getBusSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, [refreshKey]);

  const fetchBuses = useCallback(async () => {
    const data: Bus[] = await getAllBuses();
    return { data, total: data.length, totalPages: 1 };
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteBus(id);
      await Swal.fire('สำเร็จ', 'ลบข้อมูลรถเรียบร้อยแล้ว', 'success');
      setDeleteTarget(null);
      setRefreshKey(prev => prev + 1);
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const message = err?.response?.data?.message || 'ไม่สามารถลบข้อมูลได้';
      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      await Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
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
            <div key={cfg.key} className="col-sm-6 col-lg-4">
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
                          style={{ fontSize: '0.85rem', letterSpacing: '0.6px' }}
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

      {/* Table Card */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-bus-alt me-2" />
                จัดการรถ
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle color={B_LIST.add.color} icon={B_LIST.add.icon} link="/admin/bus/add" />
              </div>
            </div>
            <div className="private-card-body">
              <SearchAndPaginationTable<Bus>
                fetchData={fetchBuses}
                initialLimit={10}
                refreshKey={refreshKey}
                clientSideFilters
                columns={[
                  { header: 'รหัสรถ', accessor: 'busNumber', sortable: true, sortKey: 'busNumber' },
                  { header: 'ชื่อรถ', accessor: 'busName', sortable: true, sortKey: 'busName' },
                  { header: 'ทะเบียนรถ', accessor: 'licensePlate', sortable: true, sortKey: 'licensePlate' },
                  { header: 'พื้นที่ปฏิบัติงาน', accessor: 'workingArea', sortable: true, sortKey: 'workingArea', filterable: true },
                  { header: 'หมายเหตุ', accessor: 'note' },
                  {
                    header: 'จัดการ',
                    accessor: bus => (
                      <>
                        <GenButtonCircle
                          color={B_LIST.edit.color}
                          icon={B_LIST.edit.icon}
                          className="mx-1"
                          link={`/admin/bus/${bus.busId}/edit`}
                        />
                        <GenButtonCircle
                          color={B_LIST.del.color}
                          icon={B_LIST.del.icon}
                          onClick={() => setDeleteTarget({ id: bus.busId, name: bus.busNumber })}
                        />
                      </>
                    ),
                  },
                  {
                    header: 'แก้ไขล่าสุด',
                    accessor: bus => TimeStampToDate(bus.updatedAt),
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
          text={`คุณต้องการลบ ${deleteTarget.name} หรือไม่?`}
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

export default BusManagement;

