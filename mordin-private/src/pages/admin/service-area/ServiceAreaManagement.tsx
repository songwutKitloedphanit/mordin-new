import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import {
  deleteFactoryById,
  getAllFactoriesManagement,
  getFactorySummary,
} from '@/services/api/service-area/FactoryApi';
import {
  FactoryInfoInterface,
  FactorySummary,
} from '@/types/service-area/Factories';
import { TimeStampToDate } from '@/utils/Date';

const KPI_CONFIG = [
  {
    key: 'totalFactories' as keyof FactorySummary,
    label: 'โรงงานทั้งหมด',
    icon: 'fas fa-archway',
    accent: '#31CE36',
    unit: 'โรงงาน',
  },
  {
    key: 'totalServiceAres' as keyof FactorySummary,
    label: 'เขตส่งเสริมทั้งหมด',
    icon: 'fas fa-map-marker-alt',
    accent: '#337AB7',
    unit: 'เขต',
  },
];

const ServiceAreaManagement = () => {
  const [summary, setSummary] = useState<FactorySummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setSummaryLoading(true);
    getFactorySummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, [refreshKey]);

  const fetchFactories = useCallback(async () => {
    const data: FactoryInfoInterface[] = await getAllFactoriesManagement();
    return { data, total: data.length, totalPages: 1 };
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteFactoryById(id);
      await Swal.fire('สำเร็จ', 'ลบโรงงานเรียบร้อยแล้ว', 'success');
      setDeleteTarget(null);
      setRefreshKey(prev => prev + 1);
    } catch (error: unknown) {
      console.error(error);
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message = err?.response?.data?.message || 'ไม่สามารถลบโรงงานได้';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await Swal.fire('ไม่สามารถลบได้', errorMessage, 'warning');
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

      {/* Table Card */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-archway me-2" />
                โรงงานและเขตส่งเสริม
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle
                  color={B_LIST.add.color}
                  icon={B_LIST.add.icon}
                  link="/admin/service-area/add"
                />
              </div>
            </div>
            <div className="private-card-body">
              <SearchAndPaginationTable<FactoryInfoInterface>
                fetchData={fetchFactories}
                initialLimit={10}
                refreshKey={refreshKey}
                clientSideFilters
                columns={[
                  {
                    header: 'ชื่อย่อโรงงาน',
                    accessor: 'initial',
                    sortable: true,
                    sortKey: 'initial',
                  },
                  {
                    header: 'ชื่อโรงงาน',
                    accessor: 'name',
                    sortable: true,
                    sortKey: 'name',
                  },
                  {
                    header: 'จำนวนเขตส่งเสริม',
                    accessor: f => f.serviceAreaCount ?? 0,
                    sortable: true,
                    sortKey: 'serviceAreaCount',
                  },
                  {
                    header: 'หมายเหตุ',
                    accessor: f => f.note || '-',
                  },
                  {
                    header: 'จัดการ',
                    accessor: f => (
                      <>
                        <GenButtonCircle
                          color={B_LIST.edit.color}
                          icon={B_LIST.edit.icon}
                          link={`/admin/service-area/${f.factoryId}/edit`}
                          className="mx-1"
                        />
                        <GenButtonCircle
                          color={B_LIST.del.color}
                          icon={B_LIST.del.icon}
                          onClick={() =>
                            setDeleteTarget({ id: f.factoryId, name: f.name })
                          }
                        />
                      </>
                    ),
                  },
                  {
                    header: 'แก้ไขล่าสุด',
                    accessor: f => (f.updatedAt ? TimeStampToDate(f.updatedAt) : '-'),
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
          text={`คุณต้องการลบโรงงาน ${deleteTarget.name} หรือไม่?`}
          action="delete"
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
};

export default ServiceAreaManagement;

