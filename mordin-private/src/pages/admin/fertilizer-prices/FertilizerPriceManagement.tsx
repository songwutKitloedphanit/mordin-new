import 'datatables.net-bs5';

import $ from 'jquery';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import SearchAndPaginationTable from '../../../components/gui/SearchAndPaginationTable';
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
import { TimeStampToDate } from '../../../utils/Date';

import FertilizerPriceSummaryCard from '@/components/pages/fertilizer-prices/FertilizerPriceSummaryCard.tsx';

const MINOR_TABLE_ID = 'fertilizer-minor-table';

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
  const [secData, setSecData] = useState<FertilizerMinor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [majorRefreshKey, setMajorRefreshKey] = useState(0);

  const [minorSearch, setMinorSearch] = useState('');
  const [minorFilterType, setMinorFilterType] = useState('');
  const [minorFilterKey, setMinorFilterKey] = useState(0);
  const dtMinorRef = useRef<DataTables.Api | null>(null);

  type DeleteTarget =
    | { type: 'main'; id: number; name: string }
    | { type: 'sec'; id: number; name: string };

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [minors, unitData] = await Promise.all([
          getAllFertilizerMinors(),
          getAllUnits(),
        ]);
        setSecData(minors);
        setUnits(unitData);
      } catch (error) {
        console.error('Failed to load fertilizer data:', error);
      } finally {
        setLoaded(true);
      }
    };
    fetchAll();
  }, []);

  // Initialize minor table DataTables
  useEffect(() => {
    if (!loaded) return;

    const $table = $(`#${MINOR_TABLE_ID}`);
    if ($table.length === 0) return;

    if ($.fn.dataTable.isDataTable($table)) {
      ($table.DataTable() as DataTables.Api).destroy();
    }

    const dt = $table.DataTable({
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      searching: true,
      autoWidth: false,
      dom:
        "<'dt-top d-flex justify-content-end align-items-center mb-2'l>" +
        "<'row'<'col-12 table-responsive't>>" +
        "<'dt-bottom d-flex flex-column align-items-center gap-2 mt-3'ip>",
      language: {
        emptyTable: 'ไม่มีข้อมูลในตาราง',
        zeroRecords: 'ไม่พบข้อมูลที่ตรงกับเงื่อนไข',
        lengthMenu: 'แสดง _MENU_ รายการ',
        info: 'แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ',
        paginate: { first: '«', last: '»', next: '›', previous: '‹' },
      },
      columnDefs: [{ targets: -2, orderable: false }],
    }) as DataTables.Api;

    dtMinorRef.current = dt;

    return () => {
      try {
        dtMinorRef.current?.destroy(false);
        dtMinorRef.current = null;
      } catch {
        // ignore
      }
    };
  }, [loaded, minorFilterKey]);

  // Apply minor search via DataTables API
  useEffect(() => {
    const dt = dtMinorRef.current;
    if (!dt) return;
    dt.search(minorSearch).draw();
  }, [minorSearch]);

  const filteredMinors =
    minorFilterType === ''
      ? secData
      : secData.filter(item => item.name === minorFilterType);

  const minorTypeOptions = [
    ...new Set(secData.map(item => item.name).filter(Boolean)),
  ];

  const hasMinorFilter = minorSearch || minorFilterType;

  const clearMinorFilters = useCallback(() => {
    setMinorSearch('');
    setMinorFilterType('');
    setMinorFilterKey(k => k + 1);
  }, []);

  const handleMinorTypeChange = (val: string) => {
    setMinorFilterType(val);
    setMinorFilterKey(k => k + 1);
  };

  function getUnitLabel(unitId: number) {
    const u = units.find(x => x.unitId === unitId);
    return u ? u.initial : '-';
  }

  return (
    <>
      {/* KPI Summary */}
      <FertilizerPriceSummaryCard />

      {/* ปุ๋ยหลัก */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-seedling me-2" />
                ปุ๋ยหลัก
              </h4>
              <GenButtonCircle
                color={B_LIST.add.color}
                icon={B_LIST.add.icon}
                link="/admin/fertilizer-prices/add-major"
              />
            </div>
            <div className="private-card-body table-responsive">
              <SearchAndPaginationTable<FertilizerMajorInfo>
                fetchData={getFertilizerMajors}
                refreshKey={majorRefreshKey}
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
                    header: 'จัดการ',
                    accessor: row => (
                      <>
                        <GenButtonCircle
                          color={B_LIST.edit.color}
                          icon={B_LIST.edit.icon}
                          className="mx-1"
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

      {/* ธาตุอาหารรอง */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-leaf me-2" />
                ธาตุอาหารรอง
              </h4>
              <GenButtonCircle
                color={B_LIST.add.color}
                icon={B_LIST.add.icon}
                link="/admin/fertilizer-prices/add-minor"
              />
            </div>

            {/* Filter Bar */}
            <div className="px-4 pt-3 pb-2 d-flex flex-wrap gap-2 align-items-center border-bottom">
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ maxWidth: 220 }}
                placeholder="ค้นหาชื่อธาตุอาหาร"
                value={minorSearch}
                onChange={e => setMinorSearch(e.target.value)}
              />
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: 180 }}
                value={minorFilterType}
                onChange={e => handleMinorTypeChange(e.target.value)}
              >
                <option value="">ทุกชนิด</option>
                {minorTypeOptions.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {hasMinorFilter && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={clearMinorFilters}
                >
                  <i className="fas fa-times me-1" />
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            <div className="private-card-body">
              <div className="table-responsive">
                <table
                  id={MINOR_TABLE_ID}
                  key={minorFilterKey}
                  className="table table-striped table-hover"
                >
                  <thead>
                    <tr>
                      <th>ชนิด</th>
                      <th>ราคาต่อหน่วย</th>
                      <th>หน่วย</th>
                      <th>ประโยชน์</th>
                      <th>หมายเหตุ</th>
                      <th className="text-center">จัดการ</th>
                      <th>แก้ไขล่าสุด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMinors.map(item => (
                      <tr key={item.fertilizerMinorId}>
                        <td>{item.name}</td>
                        <td>{item.pricePerUnit.toFixed(2)}</td>
                        <td>{getUnitLabel(item.unitId)}</td>
                        <td>{item.benefit}</td>
                        <td>{item.note}</td>
                        <td className="text-center">
                          <GenButtonCircle
                            color={B_LIST.edit.color}
                            icon={B_LIST.edit.icon}
                            className="mx-1"
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete */}
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
                setMajorRefreshKey(prev => prev + 1);
              } catch (err: any) {
                Swal.fire({
                  icon: 'error',
                  title: 'ไม่สามารถลบได้',
                  text:
                    err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบปุ๋ย',
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
                  text:
                    err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบปุ๋ย',
                });
              }
            }
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
};

export default FertilizerPricesManagement;
