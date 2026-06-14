import { useEffect, useState } from 'react';

import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import 'datatables.net-dt/js/dataTables.dataTables';
import '../../../../public/assets/css/table.css';
import { deleteFarmer, searchFarmers } from '../../../services/api/FarmerApi';
import { FarmerInfo, FarmerSearch } from '../../../types/Farmer';
import { TimeStampToDate } from '../../../utils/Date';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import FarmerCard from '@/components/pages/farmer/farmerCard';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';
import Swal from 'sweetalert2';
const FarmerManagement = () => {
  // const [farmers, setFarmers] = useState<FarmerInfo[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [searchForm] = useState<FarmerSearch>({
    search: '',
    page: 1,
    limit: 10,
    order: 'ASC',
  });

  useEffect(() => {
    const handleSearch = async () => {
      try {
        const dataResponse = await searchFarmers(searchForm);
        console.log('✅ API response: ', dataResponse.data);
        // setFarmers(dataResponse.data);
      } catch (error) {
        console.error('❌ Search error: ', error);
        // setFarmers([]);
      }
    };
    handleSearch();
  }, [searchForm]);

  // const totalFarmers = farmers.length;

  // const totalPlots = farmers?.reduce(
  //   (sum, farmer) => sum + (farmer.landCount ?? 0),
  //   0
  // );

  // const totalArea = farmers.reduce(
  //   (sum, farmer) => sum + (farmer.landSizeSummary ?? 0),
  //   0
  // );

  const handleDelete = async (id: number) => {
    try {
      await deleteFarmer(id);
      await Swal.fire('สำเร็จ', 'ลบข้อมูลเกษตรกรเรียบร้อยแล้ว', 'success');
      // setFarmers(prev => prev.filter(f => f.farmerId !== id));
      setDeleteTarget(null);
    } catch (error: any) {
      console.error(error);
      const message = error?.response?.data?.message || 'ไม่สามารถลบข้อมูลได้';
      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      await Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {/* Statistics Cards */}
      <div className="row">
        <FarmerCard />
      </div>

      {/* Farmers Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">Farmer Management</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    link="/admin/farmer/add"
                    className="mx-2"
                  />
                  <GenButtonCircle
                    color={B_LIST.land.color}
                    icon={B_LIST.land.icon}
                    link="/admin/land/add"
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <SearchAndPaginationTable<FarmerInfo>
                fetchData={searchFarmers}
                initialLimit={10}
                columns={[
                  {
                    header: 'ชื่อ นามสกุล',
                    accessor: farmer =>
                      `${farmer.firstName} ${farmer.lastName}`,
                    sortable: true,
                    sortKey: 'firstName',
                  },
                  {
                    header: 'ประเภทบัตร',
                    accessor: farmer =>
                      farmer.thaiNationalId ? 'บัตรประชาชน' : 'บัตรเกษตรกร',
                  },
                  {
                    header: 'หมายเลขบัตร',
                    accessor: farmer => {
                      if (farmer.thaiNationalId) {
                        try {
                          return formatThaiNationalId(farmer.thaiNationalId);
                        } catch (_) {
                          console.warn(
                            'Invalid Thai ID:',
                            farmer.thaiNationalId
                          );
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
                      `${farmer.factory.name} (${farmer.factory.initial}) `,
                    sortable: true,
                    sortKey: 'factoryName',
                  },
                  {
                    header: 'เขตพื้นที่',
                    accessor: farmer =>
                      `เขต ${farmer.serviceArea.code} ${farmer.serviceArea.name}`,
                    sortable: true,
                    sortKey: 'serviceAreaName',
                  },
                  {
                    header: 'จำนวนแปลง',
                    accessor: farmer => farmer.landCount,
                    sortable: true,
                    sortKey: 'landCount',
                  },
                  {
                    header: 'พื้นที่ไร่',
                    accessor: farmer => farmer.landSizeSummary,
                    sortable: true,
                    sortKey: 'landSizeSummary',
                  },
                  {
                    header: 'management',
                    accessor: farmer => (
                      <>
                        <GenButtonCircle
                          color={B_LIST.info.color}
                          icon={B_LIST.info.icon}
                          className="mx-2"
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
                    header: 'update',
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
      {/* confirm deletion */}
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
