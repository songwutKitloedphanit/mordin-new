import React, { useEffect, useState } from 'react';

// GUI components
import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { DataTableFilter } from '../../../components/gui/DataTableFilter.tsx';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import SearchAndPaginationTable from '../../../components/gui/SearchAndPaginationTable';
import Swal from 'sweetalert2';
//type
import {
  getFertilizerMajors,
  deleteFertilizerMajor,
} from '../../../services/api/fertilizer/FertilizerMajorApi';
import {
  getAllFertilizerMinors,
  deleteFertilizerMinor,
} from '../../../services/api/fertilizer/FertilizerMinorApi';
import { getAllUnits } from '../../../services/api/reference-data/UnitApi.ts';
import {
  FertilizerMajorInfo,
  FertilizerMajorTypes,
} from '../../../types/fertilizer/FertilizerMajor.ts';
import { FertilizerMinor } from '../../../types/fertilizer/FertilizerMinor.ts';
import { Unit } from '../../../types/reference-data/Units.ts';
//api
//utils
import { TimeStampToDate } from '../../../utils/Date';

import FertilizerPriceSummaryCard from '@/components/pages/fertilizer-prices/FertilizerPriceSummaryCard.tsx';

const fertilizerMajorTypeLabels: Record<FertilizerMajorTypes, string> = {
  [FertilizerMajorTypes.Foliar]: 'ปุ๋ยเกล็ด',
  [FertilizerMajorTypes.Liquid]: 'ปุ๋ยน้ำ',
  [FertilizerMajorTypes.Granular]: 'ปุ๋ยเม็ด',
  [FertilizerMajorTypes.Organic]: 'ปุ๋ยอินทรีย์',
};
function getFertilizerTypeLabel(type: FertilizerMajorTypes) {
  return fertilizerMajorTypeLabels[type] || type;
}

const FertilizerPricesManagement: React.FC = () => {
  // const [mainData, setMainData] = useState<FertilizerMajorInfo[]>([]);
  const [secData, setSecData] = useState<FertilizerMinor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loaded, setLoaded] = useState(false);

  type DeleteTarget =
    | { type: 'main'; id: number; name: string }
    | { type: 'sec'; id: number; name: string };

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  // ยังต้องใช้ useEffect เพื่อดึงข้อมูลธาตุอาหารรองและ unit ก่อนเพราะฝั่ง backend ยังไม่สามารถดึงข้อมูลที่มีการ SeachAndPaginationParams ได้
  useEffect(() => {
    const fetchSec = async () => {
      try {
        const data = await getAllFertilizerMinors();
        setSecData(data);
      } catch (error) {
        console.error('Failed to load soil amendments:', error);
      } finally {
        setLoaded(true);
      }
    };
    fetchSec();
    const fetchUnits = async () => {
      try {
        const data = await getAllUnits();
        setUnits(data);
      } catch (err) {
        console.error('Failed to load units:', err);
      }
    };
    fetchUnits();
  }, []);

  // const mainCount = mainData.length;
  // const secCount = secData.length;
  // const numericSec = secData.filter(
  //   item => typeof item.pricePerUnit === 'number'
  // );

  // const avgBagPrice = mainCount
  //   ? mainData.reduce((sum, item) => sum + item.price, 0) / mainCount
  //   : 0;

  // const avgSecPrice = numericSec.length
  //   ? numericSec.reduce((sum, item) => sum + item.pricePerUnit, 0) /
  //     numericSec.length
  //   : 0;

  // helper สำหรับแปลง unitId → ชื่อย่อ
  function getUnitLabel(unitId: number) {
    const u = units.find(x => x.unitId === unitId);
    return u ? u.initial : '-';
  }
  return (
    <div>
      {/* summary-cards */}
      <FertilizerPriceSummaryCard />
      {/* main fertilizers */}
      <div className="col-md-12 mb-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="card-title mb-0">ปุ๋ยหลัก</h4>
            <GenButtonCircle
              color={B_LIST.add.color}
              icon={B_LIST.add.icon}
              link="/admin/fertilizer-prices/add-major"
            />
          </div>
          <div className="card-body table-responsive">
            <SearchAndPaginationTable<FertilizerMajorInfo>
              key={loaded ? 'loaded' : 'loading'}
              fetchData={getFertilizerMajors}
              initialLimit={10}
              columns={[
                { header: 'สูตรปุ๋ย', accessor: 'formular', sortable: true },
                {
                  header: 'ประเภท',
                  accessor: row => getFertilizerTypeLabel(row.type),
                },
                { header: 'ปริมาณ', accessor: 'quantity', sortable: true },
                {
                  header: 'หน่วย',
                  accessor: row => getUnitLabel(row.unitId),
                },
                {
                  header: 'ราคา (บาท)',
                  accessor: row => row.price.toFixed(2),
                  sortable: true,
                  sortKey: 'price',
                },
                {
                  header: 'ราคาต่อหน่วย',
                  accessor: row => {
                    const ppu = (row.price / row.quantity).toFixed(2);
                    return `${ppu} บาทต่อ ${getUnitLabel(row.unitId)}`;
                  },
                  sortable: true,
                  sortKey: 'pricePerUnit',
                },
                { header: 'หมายเหตุ', accessor: 'note', sortable: true },
                {
                  header: 'management',
                  accessor: row => (
                    <>
                      <GenButtonCircle
                        color={B_LIST.edit.color}
                        icon={B_LIST.edit.icon}
                        className="mx-2"
                        link={`/admin/fertilizer-prices/${row.fertilizerMajorId}/edit-major`}
                      />
                      <GenButtonCircle
                        color={B_LIST.del.color}
                        icon={B_LIST.del.icon}
                        onClick={() =>
                          setDeleteTarget({
                            type: 'main',
                            id: row.fertilizerMajorId,
                            name: row.formular,
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
      {/* secondary fertilizers */}
      <div className="col-md-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="card-title mb-0">ธาตุอาหารรอง</h4>
            <GenButtonCircle
              color={B_LIST.add.color}
              icon={B_LIST.add.icon}
              link="/admin/fertilizer-prices/add-minor"
            />
          </div>
          <div className="card-body table-responsive">
            <table
              id="multi-filter-select2"
              className="table table-striped table-hover"
            >
              <thead>
                <tr>
                  <th>ประเภท</th>
                  <th>ราคาต่อหน่วย</th>
                  <th>หน่วย</th>
                  <th>ประโยชน์</th>
                  <th>หมายเหตุ</th>
                  <th>management</th>
                  <th>update</th>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <th>ประเภท</th>
                  <th>ราคาต่อหน่วย</th>
                  <th>หน่วย</th>
                  <th>ประโยชน์</th>
                  <th>หมายเหตุ</th>
                  <th>management</th>
                  <th>update</th>
                </tr>
              </tfoot>
              <tbody>
                {secData.map(item => (
                  <tr key={item.fertilizerMinorId}>
                    <td>{item.name}</td>
                    <td>{item.pricePerUnit.toFixed(2)}</td>
                    <td>{getUnitLabel(item.unitId)}</td>
                    <td>{item.benefit}</td>
                    <td>{item.note}</td>
                    <td>
                      <GenButtonCircle
                        color={B_LIST.edit.color}
                        icon={B_LIST.edit.icon}
                        className="mx-3"
                        link={`${item.fertilizerMinorId}/edit-minor`}
                      />
                      <GenButtonCircle
                        color={B_LIST.del.color}
                        icon={B_LIST.del.icon}
                        onClick={() =>
                          setDeleteTarget({
                            type: 'sec',
                            id: item.fertilizerMinorId,
                            name: item.name!,
                          })
                        }
                      />
                    </td>
                    <td>{TimeStampToDate(item.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <DataTableFilter tableId="multi-filter-select2" loading={!loaded} />
          </div>
        </div>
      </div>
      {/* confirm deletion */}
      {deleteTarget && (
        <ConfirmAlert
          title="ยืนยันการลบ"
          text={`คุณต้องการลบ ${deleteTarget.name} หรือไม่?`}
          action="delete"
          onConfirm={async () => {
            if (deleteTarget.type === 'main') {
              try {
                await deleteFertilizerMajor(deleteTarget.id);
                Swal.fire({
                  icon: 'success',
                  title: 'ลบข้อมูลสำเร็จ',
                  showConfirmButton: false,
                  timer: 1500,
                });
                setLoaded((prev) => !prev);
              } catch (err: any) {
                Swal.fire({
                  icon: 'error',
                  title: 'ไม่สามารถลบได้',
                  text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบปุ๋ย',
                });
              }
            } else {
              try {
                await deleteFertilizerMinor(deleteTarget.id);
                Swal.fire({
                  icon: 'success',
                  title: 'ลบข้อมูลสำเร็จ',
                  showConfirmButton: false,
                  timer: 1500,
                });
                const newData = await getAllFertilizerMinors();
                setSecData(newData);
              } catch (err: any) {
                Swal.fire({
                  icon: 'error',
                  title: 'ไม่สามารถลบได้',
                  text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบปุ๋ย',
                });
              }
            }
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default FertilizerPricesManagement;
