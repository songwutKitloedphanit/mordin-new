import 'datatables.net-bs5';

import $ from 'jquery';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import {
  getAllDepartment,
  getUsers,
  getUserSummary,
} from '../../../services/api/UserApi';
import { Department } from '../../../types/Department';
import { User, UserRole, UserSummary } from '../../../types/User';

import { ManagementKpiRow } from '@/components/gui/ManagementKpiCard';
import RowAvatar from '@/components/gui/RowAvatar';
import { TableSkeleton } from '@/components/gui/Skeleton';

const TABLE_ID = 'user-management-table';

const ROLE_BADGE: Record<UserRole, { label: string; cls: string }> = {
  [UserRole.Admin]: { label: 'Admin', cls: 'private-chip private-chip-red' },
  [UserRole.Staff]: { label: 'Staff', cls: 'private-chip private-chip-blue' },
  [UserRole.Executive]: {
    label: 'Executive',
    cls: 'private-chip private-chip-green',
  },
};

const KPI_CONFIG = [
  {
    key: 'totalUsers' as keyof UserSummary,
    label: 'ผู้ใช้ทั้งหมด',
    icon: 'fas fa-users',
    accentColor: '#3b9bd9',
    unit: 'คน',
  },
  {
    key: 'adminAmount' as keyof UserSummary,
    label: 'Admin',
    icon: 'fas fa-user-shield',
    accentColor: '#e05252',
    unit: 'คน',
  },
  {
    key: 'staffAmount' as keyof UserSummary,
    label: 'Staff',
    icon: 'fas fa-user-tie',
    accentColor: '#17a2b8',
    unit: 'คน',
  },
  {
    key: 'executiveAmount' as keyof UserSummary,
    label: 'Executive',
    icon: 'fas fa-user-check',
    accentColor: '#4caf7d',
    unit: 'คน',
  },
];

const formatDate = (ts: number | string | undefined) => {
  if (ts == null) return '-';
  const d = new Date(Number(ts));
  return isNaN(d.getTime()) ? '-' : d.toISOString().split('T')[0];
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDeptId, setFilterDeptId] = useState('');

  const dtRef = useRef<DataTables.Api | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [fetchedUsers, fetchedDepts, fetchedSummary] = await Promise.all([
          getUsers(),
          getAllDepartment(),
          getUserSummary(),
        ]);
        setUsers(fetchedUsers);
        setDepartments(fetchedDepts);
        setSummary(fetchedSummary);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Initialize DataTables after data is ready
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
        "<'row'<'col-12 table-responsive't>>" +
        "<'dt-bottom d-flex flex-column align-items-center gap-2 mt-3'ip>",
      language: {
        emptyTable: 'ไม่มีข้อมูลในตาราง',
        zeroRecords: 'ไม่พบข้อมูลที่ตรงกับเงื่อนไข',
        lengthMenu: 'แสดง _MENU_ รายการ',
        info: 'แสดง _START_ ถึง _END_ จาก _TOTAL_ รายการ',
        paginate: { first: '«', last: '»', next: '›', previous: '‹' },
      },
      columnDefs: [
        { targets: 0, width: '21%', className: 'private-user-table-email' },
        { targets: 1, width: '15%', className: 'private-user-table-name' },
        { targets: 2, width: '27%', className: 'private-user-table-dept' },
        { targets: 3, width: '11%', className: 'private-user-table-role' },
        {
          targets: 4,
          width: '10%',
          orderable: false,
          className: 'private-user-table-actions',
        },
        { targets: 5, width: '16%', className: 'private-user-table-date' },
      ],
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
  }, [loading]);

  // Apply filters to DataTables whenever filter state changes
  useEffect(() => {
    const dt = dtRef.current;
    if (!dt) return;

    // Column 0 = email, Column 1 = name โ’ global search covers both
    // Column 2 = department, Column 3 = role badge text
    dt.search(search);
    dt.column(3).search(filterRole || '', false, false);
    dt.column(2).search(
      filterDeptId ? (deptMap[Number(filterDeptId)] ?? '') : '',
      false,
      false
    );
    dt.draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterRole, filterDeptId]);

  const deptMap = useMemo(
    () => Object.fromEntries(departments.map(d => [d.departmentId, d.name])),
    [departments]
  );

  const hasFilter = search || filterRole || filterDeptId;

  const clearFilters = useCallback(() => {
    setSearch('');
    setFilterRole('');
    setFilterDeptId('');
  }, []);

  return (
    <>
      {/* KPI Cards */}
      <ManagementKpiRow
        configs={KPI_CONFIG}
        data={summary as Record<keyof UserSummary, number>}
        loading={loading}
        colClass="col-sm-6 col-lg-3"
      />

      {/* Table Card */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-users me-2" />
                จัดการผู้ใช้งาน
              </h4>
            </div>

            {/* Filter Bar */}
            <div className="px-4 pt-3 pb-2 d-flex flex-wrap gap-2 align-items-center border-bottom">
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ maxWidth: 220 }}
                placeholder="ค้นหาชื่อ / อีเมล"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: 160 }}
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
              >
                <option value="">ทุกสิทธิ์</option>
                <option value={UserRole.Admin}>Admin</option>
                <option value={UserRole.Staff}>Staff</option>
                <option value={UserRole.Executive}>Executive</option>
              </select>
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: 200 }}
                value={filterDeptId}
                onChange={e => setFilterDeptId(e.target.value)}
              >
                <option value="">ทุกแผนก</option>
                {departments.map(d => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.name}
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
              <div className="table-responsive private-user-table-wrap">
                {loading ? (
                  <TableSkeleton rows={6} cols={6} />
                ) : (
                  <table
                    id={TABLE_ID}
                    className="display table table-striped table-hover private-user-table"
                    style={{ width: '100%' }}
                  >
                    <thead>
                      <tr>
                        <th>อีเมล</th>
                        <th>ชื่อ - นามสกุล</th>
                        <th>แผนก</th>
                        <th>สิทธิ์</th>
                        <th>จัดการ</th>
                        <th>แก้ไขล่าสุด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => {
                        const badge = ROLE_BADGE[user.role];
                        return (
                          <tr key={user.userId}>
                            <td>{user.email}</td>
                            <td>
                              <RowAvatar
                                name={`${user.firstName} ${user.lastName}`.trim()}
                              />
                            </td>
                            <td>{deptMap[user.departmentId] ?? '-'}</td>
                            <td data-search={user.role}>
                              {badge && (
                                <span className={badge.cls}>{badge.label}</span>
                              )}
                            </td>
                            <td>
                              <GenButtonCircle
                                color={B_LIST.edit.color}
                                icon={B_LIST.edit.icon}
                                link={`/admin/user/${user.userId}/edit`}
                              />
                            </td>
                            <td>{formatDate(user.updatedAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserManagement;
