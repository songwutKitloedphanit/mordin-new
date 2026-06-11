import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import {
  deleteFactoryById,
  getAllFactoriesManagement,
  getFactorySummary,
} from '@/services/api/service-area/FactoryApi';
import { getAllServiceAreas } from '@/services/api/service-area/ServiceAreaApi';
import {
  FactoryInfoInterface,
  FactorySummary,
} from '@/types/service-area/Factories';

const KPI_CONFIG = [
  {
    key: 'totalFactories' as keyof FactorySummary,
    label: 'โรงงานทั้งหมด',
    icon: 'fas fa-archway',
    accent: '#18a05c',
    unit: 'โรงงาน',
  },
  {
    key: 'totalServiceAres' as keyof FactorySummary,
    label: 'เขตส่งเสริมทั้งหมด',
    icon: 'fas fa-map-marker-alt',
    accent: '#3b9bd9',
    unit: 'เขต',
  },
];

const ServiceAreaManagement = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<FactorySummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [factories, setFactories] = useState<FactoryInfoInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [factoriesData, serviceAreasData] = await Promise.all([
        getAllFactoriesManagement(),
        getAllServiceAreas(),
      ]);

      const mapped = factoriesData.map((factory: FactoryInfoInterface) => {
        const areas = serviceAreasData.filter(
          (area: any) => area.factoryId === factory.factoryId
        );
        return {
          ...factory,
          serviceAreas: areas,
          serviceAreaCount: areas.length,
        };
      });

      setFactories(mapped);
    } catch (error) {
      console.error('Failed to load factories and service areas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

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

  const filteredFactories = factories.filter(f => {
    const term = searchTerm.toLowerCase();
    return (
      f.name.toLowerCase().includes(term) ||
      f.initial.toLowerCase().includes(term) ||
      (f.note && f.note.toLowerCase().includes(term))
    );
  });

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

      {/* Toolbar / Search Bar */}
      <div className="private-card mb-4">
        <div className="private-card-body d-flex flex-wrap gap-3 align-items-center justify-content-between p-3">
          <div
            className="position-relative flex-grow-1"
            style={{ maxWidth: '300px' }}
          >
            <input
              type="text"
              className="form-control ps-5"
              placeholder="ค้นหาชื่อโรงงาน, ตัวย่อ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                borderRadius: '10px',
                paddingLeft: '38px',
                height: '42px',
              }}
            />
            <i
              className="fas fa-search text-muted position-absolute"
              style={{ left: '14px', top: '13px', fontSize: '14px' }}
            />
          </div>
          <div>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => navigate('/admin/service-area/add')}
              style={{ borderRadius: '10px', height: '42px', fontWeight: 600 }}
            >
              <i className="fas fa-plus" />
              เพิ่มโรงงาน
            </button>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="text-center p-5 my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      ) : (
        <>
          {filteredFactories.length === 0 ? (
            <div className="alert alert-light text-center shadow-sm py-5">
              <i className="fas fa-search-minus fs-2 mb-3 text-muted" />
              <p className="mb-0 text-muted">
                ไม่พบข้อมูลโรงงานตามเงื่อนไขที่ค้นหา
              </p>
            </div>
          ) : (
            <div className="row g-3 mb-5">
              {filteredFactories.map(f => {
                const firstThree = (f.serviceAreas ?? []).slice(0, 3);
                const remaining = (f.serviceAreas ?? []).length - 3;
                return (
                  <div key={f.factoryId} className="col-md-6 col-lg-4">
                    <div className="private-card h-100 d-flex flex-column">
                      <div className="private-card-body p-4 d-flex flex-column h-100">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: 44,
                                height: 44,
                                backgroundColor: '#0050921a',
                                color: '#005092',
                                fontSize: '18px',
                              }}
                            >
                              <i className="fas fa-industry" />
                            </div>
                            <div>
                              <h5
                                className="fw-bold mb-0 text-truncate"
                                style={{ maxWidth: '170px' }}
                              >
                                {f.name}
                              </h5>
                              <small className="text-muted">
                                รหัสย่อ {f.initial}
                              </small>
                            </div>
                          </div>
                          <div className="d-flex gap-1.5">
                            <GenButtonCircle
                              color={B_LIST.edit.color}
                              icon={B_LIST.edit.icon}
                              link={`/admin/service-area/${f.factoryId}/edit`}
                            />
                            <GenButtonCircle
                              color={B_LIST.del.color}
                              icon={B_LIST.del.icon}
                              onClick={() =>
                                setDeleteTarget({
                                  id: f.factoryId,
                                  name: f.name,
                                })
                              }
                            />
                          </div>
                        </div>

                        {/* Stats block */}
                        <div
                          className="d-flex gap-3 py-3 my-2 border-top border-bottom"
                          style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                        >
                          <div className="flex-fill">
                            <div className="text-muted small mb-1">
                              เขตส่งเสริม
                            </div>
                            <b className="fs-5">
                              {(f.serviceAreas ?? []).length}
                            </b>
                          </div>
                          <div className="flex-fill">
                            <div className="text-muted small mb-1">
                              หมายเหตุ
                            </div>
                            <div
                              className="small text-truncate"
                              style={{ maxWidth: '120px' }}
                            >
                              {f.note || '-'}
                            </div>
                          </div>
                        </div>

                        {/* Chips list */}
                        <div
                          className="d-flex gap-1.5 flex-wrap my-2 align-items-center"
                          style={{ minHeight: '30px' }}
                        >
                          {firstThree.length > 0 ? (
                            <>
                              {firstThree.map(area => (
                                <span
                                  key={area.serviceAreaId}
                                  className="badge bg-primary-subtle text-primary border border-primary-subtle"
                                  style={{
                                    fontSize: '11.5px',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                  }}
                                >
                                  {area.code}
                                </span>
                              ))}
                              {remaining > 0 && (
                                <span
                                  className="badge bg-light text-muted border"
                                  style={{
                                    fontSize: '11.5px',
                                    padding: '4px 8px',
                                    borderRadius: '20px',
                                  }}
                                >
                                  +{remaining}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted small italic">
                              ไม่มีเขตส่งเสริม
                            </span>
                          )}
                        </div>

                        {/* Bottom action button */}
                        <div className="mt-auto pt-3">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                            style={{
                              height: '40px',
                              borderRadius: '10px',
                              fontWeight: 600,
                            }}
                            onClick={() =>
                              navigate(
                                `/admin/service-area/${f.factoryId}/edit`
                              )
                            }
                          >
                            <i className="fas fa-pen" />
                            จัดการเขตส่งเสริม
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

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
