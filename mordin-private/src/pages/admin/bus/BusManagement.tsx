import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { ManagementKpiRow } from '@/components/gui/ManagementKpiCard';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import { deleteBus, getAllBuses, getBusSummary } from '@/services/api/BusApi';
import { Bus, BusSummary } from '@/types/Bus';
import { TimeStampToDate } from '@/utils/Date';

const KPI_CONFIG = [
  {
    key: 'totalBuses' as keyof BusSummary,
    label: 'รถให้บริการ',
    icon: 'fas fa-bus-alt',
    accentColor: '#7a5af5',
    unit: 'คัน',
  },
];

const BusManagement = () => {
  const [summary, setSummary] = useState<BusSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
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
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message = err?.response?.data?.message || 'ไม่สามารถลบข้อมูลได้';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {/* KPI Cards */}
      <ManagementKpiRow
        configs={KPI_CONFIG}
        data={summary as Record<keyof BusSummary, number>}
        loading={summaryLoading}
        colClass="col-sm-6 col-lg-3"
      />

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
                <GenButtonCircle
                  color={B_LIST.add.color}
                  icon={B_LIST.add.icon}
                  link="/admin/bus/add"
                />
              </div>
            </div>
            <div className="private-card-body">
              <SearchAndPaginationTable<Bus>
                fetchData={fetchBuses}
                initialLimit={10}
                refreshKey={refreshKey}
                clientSideFilters
                columns={[
                  {
                    header: 'รหัสรถ',
                    accessor: 'busNumber',
                    sortable: true,
                    sortKey: 'busNumber',
                  },
                  {
                    header: 'ชื่อรถ',
                    accessor: 'busName',
                    sortable: true,
                    sortKey: 'busName',
                  },
                  {
                    header: 'ทะเบียนรถ',
                    accessor: 'licensePlate',
                    sortable: true,
                    sortKey: 'licensePlate',
                  },
                  {
                    header: 'พื้นที่ปฏิบัติงาน',
                    accessor: 'workingArea',
                    sortable: true,
                    sortKey: 'workingArea',
                    filterable: true,
                  },
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
                          onClick={() =>
                            setDeleteTarget({
                              id: bus.busId,
                              name: bus.busNumber,
                            })
                          }
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
