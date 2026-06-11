import { useEffect, useState } from 'react';
import { swalSuccessTimer, swalError } from '@/utils/swal';

import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import {
  deleteFarmer,
  getFarmerSummary,
  searchFarmers,
} from '../../../services/api/FarmerApi';
import { FarmerInfo, FarmerSummary } from '../../../types/Farmer';
import { TimeStampToDate } from '../../../utils/Date';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { ManagementKpiRow } from '@/components/gui/ManagementKpiCard';
import RowAvatar from '@/components/gui/RowAvatar';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';

const KPI_CONFIG = [
  {
    key: 'totalFarmers' as keyof FarmerSummary,
    label: 'เกษตรกรทั้งหมด',
    icon: 'fas fa-seedling',
    accentColor: '#3b9bd9',
    unit: 'คน',
  },
  {
    key: 'totalLands' as keyof FarmerSummary,
    label: 'จำนวนแปลง',
    icon: 'fas fa-map',
    accentColor: '#4caf7d',
    unit: 'แปลง',
  },
  {
    key: 'totalSpaces' as keyof FarmerSummary,
    label: 'พื้นที่ทั้งหมด',
    icon: 'fas fa-ruler-combined',
    accentColor: '#17a2b8',
    unit: 'ไร่',
  },
];

const FarmerManagement = () => {
  const [summary, setSummary] = useState<FarmerSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
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
      await swalSuccessTimer('สำเร็จ', 'ลบข้อมูลเกษตรกรเรียบร้อยแล้ว');
      setDeleteTarget(null);
      setRefreshKey(prev => prev + 1);
      loadSummary();
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
      <ManagementKpiRow
        configs={KPI_CONFIG}
        data={summary as Record<keyof FarmerSummary, number>}
        loading={summaryLoading}
        colClass="col-sm-6 col-lg-4"
      />

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
                <GenButtonCircle
                  color={B_LIST.add.color}
                  icon={B_LIST.add.icon}
                  link="/admin/farmer/add"
                />
                <GenButtonCircle
                  color={B_LIST.land.color}
                  icon={B_LIST.land.icon}
                  link="/admin/land/add"
                />
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
                    accessor: farmer => (
                      <RowAvatar
                        name={`${farmer.firstName} ${farmer.lastName}`}
                        hideAvatar
                      />
                    ),
                    searchText: farmer =>
                      `${farmer.firstName} ${farmer.lastName} ${farmer.phone ?? ''}`,
                    sortable: true,
                    sortKey: 'firstName',
                  },
                  {
                    header: 'ประเภทบัตร',
                    accessor: farmer =>
                      farmer.thaiNationalId ? 'บัตรประชาชน' : 'บัตรเกษตรกร',
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
                          color={B_LIST.edit.color}
                          icon={B_LIST.edit.icon}
                          className="mx-1"
                          link={`/admin/farmer/${farmer.farmerId}/edit`}
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
