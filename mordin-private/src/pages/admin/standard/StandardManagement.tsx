import 'datatables.net-bs5';

import $ from 'jquery';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { TableSkeleton } from '@/components/gui/Skeleton';
import { getAllLaboratories } from '@/services/api/laboratory/LaboratoryApi';
import {
  getAllStandard,
  deleteStandard,
} from '@/services/api/standard/StandardApi';
import { Laboratory } from '@/types/Laboratory';
import { StandardInfo } from '@/types/Standard';
import { TimeStampToDate } from '@/utils/Date';

const TABLE_ID = 'standard-table';

const KPI_CONFIG = [
  {
    key: 'standards' as const,
    label: 'มาตรฐานทั้งหมด',
    icon: 'fas fa-certificate',
    accent: '#3b9bd9',
    unit: 'รายการ',
  },
  {
    key: 'laboratories' as const,
    label: 'ค่าวิเคราะห์',
    icon: 'fas fa-flask',
    accent: '#31CE36',
    unit: 'รายการ',
  },
];

const Standard = () => {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [standards, setStandards] = useState<StandardInfo[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedStandardId, setSelectedStandardId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLabId, setFilterLabId] = useState(0);
  const [labFilterKey, setLabFilterKey] = useState(0);

  const dtRef = useRef<DataTables.Api | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labData, standardsData] = await Promise.all([
          getAllLaboratories(),
          getAllStandard(),
        ]);
        setLaboratories(labData || []);
        setStandards(standardsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setStandards([]);
        setLaboratories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Initialize DataTables after data loads, or when lab filter changes
  useEffect(() => {
    if (loading) return;

    const $table = $(`#${TABLE_ID}`);
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
        "<'row'<'col-12't>>" +
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

    dtRef.current = dt;

    return () => {
      try {
        dtRef.current?.destroy(false);
        dtRef.current = null;
      } catch {
        // ignore
      }
    };
  }, [loading, labFilterKey]);

  // Apply name search via DataTables API
  useEffect(() => {
    const dt = dtRef.current;
    if (!dt) return;
    dt.search(search).draw();
  }, [search]);

  const filteredStandards =
    filterLabId === 0
      ? standards
      : standards.filter(s =>
          s.standardCertificates.some(
            c => c.laboratoryId === filterLabId && c.certificateValue != null
          )
        );

  const hasFilter = search || filterLabId !== 0;

  const clearFilters = useCallback(() => {
    setSearch('');
    setFilterLabId(0);
    setLabFilterKey(k => k + 1);
  }, []);

  const handleLabFilterChange = (labId: number) => {
    setFilterLabId(labId);
    setLabFilterKey(k => k + 1);
  };

  const setConfirmDelete = (standardId: number) => () => {
    setSelectedStandardId(standardId);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (selectedStandardId) {
      try {
        await deleteStandard(selectedStandardId);
        Swal.fire({
          icon: 'success',
          title: 'ลบข้อมูลสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        });
        setStandards(
          standards.filter(std => std.standardId !== selectedStandardId)
        );
        setShowConfirm(false);
        setSelectedStandardId(null);
      } catch (error: any) {
        console.error('Error deleting standard:', error);
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถลบได้',
          text:
            error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ Standard',
        });
        setShowConfirm(false);
      }
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedStandardId(null);
  };

  const kpi = { standards: standards.length, laboratories: laboratories.length };

  return (
    <>
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {KPI_CONFIG.map(cfg => (
          <div key={cfg.key} className="col-sm-6">
            {loading ? (
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
                          {kpi[cfg.key]}
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
        ))}
      </div>

      {/* Table Card */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-certificate me-2" />
                Standard Management
              </h4>
              <GenButtonCircle
                color={B_LIST.add.color}
                icon={B_LIST.add.icon}
                link="/admin/standard/add"
              />
            </div>

            {/* Filter Bar */}
            <div className="px-4 pt-3 pb-2 d-flex flex-wrap gap-2 align-items-center border-bottom">
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ maxWidth: 220 }}
                placeholder="ค้นหาชื่อมาตรฐาน"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: 180 }}
                value={filterLabId}
                onChange={e => handleLabFilterChange(Number(e.target.value))}
              >
                <option value={0}>ทุกค่าวิเคราะห์</option>
                {laboratories.map(lab => (
                  <option key={lab.laboratoryId} value={lab.laboratoryId}>
                    {lab.shortNameAfter || lab.name}
                  </option>
                ))}
              </select>
              {hasFilter && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={clearFilters}
                >
                  <i className="fas fa-times me-1" />
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            <div className="private-card-body">
              {loading ? (
                <TableSkeleton rows={5} cols={5} />
              ) : (
                <div className="table-responsive">
                  <table
                    id={TABLE_ID}
                    key={labFilterKey}
                    className="table table-striped table-hover"
                  >
                    <thead>
                      <tr>
                        <th>ชื่อ</th>
                        {laboratories.map(laboratory => (
                          <th key={laboratory.laboratoryId}>
                            {laboratory.shortNameAfter
                              ? laboratory.unitAfter
                                ? `${laboratory.shortNameAfter}(${laboratory.unitAfter})`
                                : laboratory.shortNameAfter
                              : ''}
                          </th>
                        ))}
                        <th className="text-center">จัดการ</th>
                        <th>แก้ไขล่าสุด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStandards.map(standard => (
                        <tr key={standard.standardId}>
                          <td>{standard.standardName}</td>
                          {laboratories.map(laboratory => {
                            const certificate =
                              standard.standardCertificates.find(
                                cert =>
                                  cert.laboratoryId === laboratory.laboratoryId
                              );
                            return (
                              <td
                                className="text-end"
                                key={laboratory.laboratoryId}
                              >
                                {certificate ? certificate.certificateValue : ''}
                              </td>
                            );
                          })}
                          <td className="text-center">
                            <GenButtonCircle
                              color={B_LIST.edit.color}
                              icon={B_LIST.edit.icon}
                              link={`/admin/standard/${standard.standardId}/edit`}
                              className="mx-1"
                            />
                            <GenButtonCircle
                              color={B_LIST.del.color}
                              icon={B_LIST.del.icon}
                              onClick={setConfirmDelete(standard.standardId)}
                            />
                          </td>
                          <td>{TimeStampToDate(standard.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th>ชื่อ</th>
                        {laboratories.map(laboratory => (
                          <th key={laboratory.laboratoryId}>
                            {laboratory.shortNameAfter
                              ? laboratory.unitAfter
                                ? `${laboratory.shortNameAfter}(${laboratory.unitAfter})`
                                : laboratory.shortNameAfter
                              : ''}
                          </th>
                        ))}
                        <th className="text-center">จัดการ</th>
                        <th>แก้ไขล่าสุด</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ต้องการลบข้อมูล?"
          text={`คุณแน่ใจหรือไม่ว่าต้องการลบ ${standards.find(standard => standard.standardId === selectedStandardId)?.standardName}?`}
          action="delete"
          onConfirm={handleDelete}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default Standard;

