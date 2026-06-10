import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import {
  deleteFarmer,
  getFarmerSummary,
  searchFarmers,
} from '../../../services/api/FarmerApi';
import { FarmerInfo, FarmerSummary } from '../../../types/Farmer';
import { TimeStampToDate } from '../../../utils/Date';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';

const KPI_CONFIG = [
  { key: 'totalFarmers' as keyof FarmerSummary, label: 'เกษตรกรทั้งหมด', icon: 'fas fa-seedling', accent: '#3b9bd9', unit: 'คน' },
  { key: 'totalLands'   as keyof FarmerSummary, label: 'จำนวนแปลง',       icon: 'fas fa-map',      accent: '#4caf7d', unit: 'แปลง' },
  { key: 'totalSpaces'  as keyof FarmerSummary, label: 'พื้นที่ทั้งหมด',   icon: 'fas fa-ruler-combined', accent: '#17a2b8', unit: 'ไร่' },
];

const FarmerManagement = () => {
  const [summary, setSummary] = useState<FarmerSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSummary = () => {
    setSummaryLoading(true);
    getFarmerSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteFarmer(id);
      await Swal.fire('สำเร็จ', 'ลบข้อมูลเกษตรกรเรียบร้อยแล้ว', 'success');
      setDeleteTarget(null);
      setRefreshKey(prev => prev + 1);
      loadSummary();
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
                <i className="fas fa-seedling me-2" />
                จัดการเกษตรกร
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle color={B_LIST.add.color}  icon={B_LIST.add.icon}  link="/admin/farmer/add" />
                <GenButtonCircle color={B_LIST.land.color} icon={B_LIST.land.icon} link="/admin/land/add" />
              </div>
            </div>
            <div className="private-card-body">
              <SearchAndPaginationTable<FarmerInfo>
                fetchData={searchFarmers}
                initialLimit={10}
                refreshKey={refreshKey}
                clientSideFilters
                columns={[
                  {
                    header: 'ชื่อ นามสกุล',
                    accessor: farmer => `${farmer.firstName} ${farmer.lastName}`,
                    sortable: true,
                    sortKey: 'firstName',
                  },
                  {
                    header: 'ประเภทบัตร',
                    accessor: farmer => farmer.thaiNationalId ? 'บัตรประชาชน' : 'บัตรเกษตรกร',
                    filterable: true,
                  },
                  {
                    header: 'หมายเลขบัตร',
                    accessor: farmer => {
                      if (farmer.thaiNationalId) {
                        try {
                          return formatThaiNationalId(farmer.thaiNationalId);
                        } catch {
                          return farmer.thaiNationalId;
                        }
                      }
                      return farmer.thaiFarmerId ?? '-';
                    },
                    sortable: true,
                    sortKey: 'thaiNationalId',
                  },
                  {
                    header: 'โทรศัพท์',
                    accessor: farmer => farmer.phone,
                    sortable: true,
                    sortKey: 'phone',
                  },
                  {
                    header: 'โรงงาน',
                    accessor: farmer =>
                      farmer.factory?.name
                        ? `${farmer.factory.name} (${farmer.factory.initial})`
                        : '-',
                    sortable: true,
                    sortKey: 'factoryName',
                    filterable: true,
                  },
                  {
                    header: 'เขตพื้นที่',
                    accessor: farmer =>
                      farmer.serviceArea?.name
                        ? `เขต ${farmer.serviceArea.code} ${farmer.serviceArea.name}`
                        : '-',
                    sortable: true,
                    sortKey: 'serviceAreaName',
                    filterable: true,
                  },
                  {
                    header: 'จำนวนแปลง',
                    accessor: farmer => farmer.landCount,
                    sortable: true,
                    sortKey: 'landCount',
                  },
                  {
                    header: 'พื้นที่ (ไร่)',
                    accessor: farmer => farmer.landSizeSummary,
                    sortable: true,
                    sortKey: 'landSizeSummary',
                  },
                  {
                    header: 'จัดการ',
                    accessor: farmer => (
                      <>
                        <GenButtonCircle
                          color={B_LIST.info.color}
                          icon={B_LIST.info.icon}
                          className="mx-1"
                          link={`/admin/farmer/${farmer.farmerId}`}
                        />
                        <GenButtonCircle
                          color={B_LIST.del.color}
                          icon={B_LIST.del.icon}
                          onClick={() =>
                            setDeleteTarget({
                              id: farmer.farmerId,
                              name: `${farmer.firstName} ${farmer.lastName}`,
                            })
                          }
                        />
                      </>
                    ),
                  },
                  {
                    header: 'แก้ไขล่าสุด',
                    accessor: row => TimeStampToDate(row.updatedAt),
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

export default FarmerManagement;

