import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import {
  deleteLaboratory,
  getAllLaboratories,
} from '@/services/api/laboratory/LaboratoryApi';
import { LaboratoryInfoInterface } from '@/types/Laboratory';

const KPI_CONFIG = [
  {
    key: 'total' as const,
    label: 'ค่าวิเคราะห์ทั้งหมด',
    icon: 'fas fa-flask',
    accent: '#31CE36',
    unit: 'รายการ',
  },
  {
    key: 'main' as const,
    label: 'ค่าหลัก',
    icon: 'fas fa-star',
    accent: '#337AB7',
    unit: 'รายการ',
  },
  {
    key: 'minor' as const,
    label: 'ค่ารอง',
    icon: 'fas fa-vial',
    accent: '#F39C12',
    unit: 'รายการ',
  },
];

const formatDate = (val: number | string | Date) =>
  new Date(Number(val)).toISOString().split('T')[0];

const Laboratory = () => {
  const [kpi, setKpi] = useState({ total: 0, main: 0, minor: 0 });
  const [kpiLoading, setKpiLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setKpiLoading(true);
    getAllLaboratories()
      .then((data: LaboratoryInfoInterface[]) => {
        setKpi({
          total: data.length,
          main: data.filter(p => p.isMain).length,
          minor: data.filter(p => !p.isMain).length,
        });
      })
      .catch(console.error)
      .finally(() => setKpiLoading(false));
  }, [refreshKey]);

  const fetchMainLabs = useCallback(async () => {
    const data: LaboratoryInfoInterface[] = await getAllLaboratories();
    const filtered = data.filter(p => p.isMain);
    return { data: filtered, total: filtered.length, totalPages: 1 };
  }, []);

  const fetchMinorLabs = useCallback(async () => {
    const data: LaboratoryInfoInterface[] = await getAllLaboratories();
    const filtered = data.filter(p => !p.isMain);
    return { data: filtered, total: filtered.length, totalPages: 1 };
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteLaboratory(id);
      await Swal.fire('สำเร็จ', 'ลบข้อมูลเรียบร้อยแล้ว', 'success');
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

  const sharedColumns = [
    {
      header: 'รหัส',
      accessor: 'laboratoryCode' as keyof LaboratoryInfoInterface,
      sortable: true,
      sortKey: 'laboratoryCode',
    },
    {
      header: 'ตัวย่อก่อน',
      accessor: 'shortNameBefore' as keyof LaboratoryInfoInterface,
      sortable: true,
      sortKey: 'shortNameBefore',
    },
    {
      header: 'ตัวย่อหลัง',
      accessor: 'shortNameAfter' as keyof LaboratoryInfoInterface,
      sortable: true,
      sortKey: 'shortNameAfter',
    },
    {
      header: 'ชื่อ',
      accessor: 'name' as keyof LaboratoryInfoInterface,
      sortable: true,
      sortKey: 'name',
    },
    {
      header: 'หน่วยก่อน',
      accessor: 'unitBefore' as keyof LaboratoryInfoInterface,
    },
    {
      header: 'หน่วยหลัง',
      accessor: 'unitAfter' as keyof LaboratoryInfoInterface,
    },
    {
      header: 'ประเภทเครื่อง',
      accessor: (p: LaboratoryInfoInterface) => p.machineType.name,
      sortable: true,
      sortKey: 'machineType',
      filterable: true,
    },
    {
      header: 'ค่าต่ำสุด',
      accessor: 'rangeMin' as keyof LaboratoryInfoInterface,
    },
    {
      header: 'ค่าสูงสุด',
      accessor: 'rangeMax' as keyof LaboratoryInfoInterface,
    },
    {
      header: 'แก้ไขล่าสุด',
      accessor: (p: LaboratoryInfoInterface) => formatDate(p.updatedAt),
      sortable: true,
      sortKey: 'updatedAt',
    },
  ];

  return (
    <>
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {KPI_CONFIG.map(cfg => {
          const value = kpi[cfg.key];
          return (
            <div key={cfg.key} className="col-sm-6 col-lg-4">
              {kpiLoading ? (
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

      {/* Main Labs Table */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-star me-2" />
                ค่าวิเคราะห์หลัก
              </h4>
            </div>
            <div className="private-card-body">
              <SearchAndPaginationTable<LaboratoryInfoInterface>
                fetchData={fetchMainLabs}
                initialLimit={10}
                refreshKey={refreshKey}
                clientSideFilters
                columns={[
                  ...sharedColumns,
                  {
                    header: 'จัดการ',
                    accessor: (p: LaboratoryInfoInterface) => (
                      <GenButtonCircle
                        color={B_LIST.info.color}
                        icon={B_LIST.info.icon}
                        link={`/admin/laboratory/${p.laboratoryId}`}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Minor Labs Table */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-vial me-2" />
                ค่าวิเคราะห์รอง
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle
                  color={B_LIST.add.color}
                  icon={B_LIST.add.icon}
                  link="/admin/laboratory/add"
                />
              </div>
            </div>
            <div className="private-card-body">
              <SearchAndPaginationTable<LaboratoryInfoInterface>
                fetchData={fetchMinorLabs}
                initialLimit={10}
                refreshKey={refreshKey}
                clientSideFilters
                columns={[
                  ...sharedColumns,
                  {
                    header: 'จัดการ',
                    accessor: (p: LaboratoryInfoInterface) => (
                      <>
                        <GenButtonCircle
                          color={B_LIST.info.color}
                          icon={B_LIST.info.icon}
                          link={`/admin/laboratory/${p.laboratoryId}`}
                          className="mx-1"
                        />
                        <GenButtonCircle
                          icon={B_LIST.del.icon}
                          color={B_LIST.del.color}
                          onClick={() =>
                            setDeleteTarget({
                              id: p.laboratoryId,
                              name: p.shortNameBefore,
                            })
                          }
                        />
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmAlert
          title="ยืนยันการลบข้อมูล"
          text={`คุณต้องการลบ ${deleteTarget.name} หรือไม่?`}
          action="delete"
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
};

export default Laboratory;

