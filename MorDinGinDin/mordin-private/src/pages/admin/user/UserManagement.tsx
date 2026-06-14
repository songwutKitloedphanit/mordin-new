import { useEffect, useState } from 'react';


import { DataTableFilter } from '../../../components/gui/DataTableFilter';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import 'datatables.net-bs5';
import { getAllDepartment, getUsers } from '../../../services/api/UserApi';
import { User, UserRole } from '../../../types/User';

import UserManagementSummaryCard from '@/components/pages/user/UserManagementSummaryCard';
import { Department } from '@/types/Department';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<Department[]>([]);

  useEffect(() => {
    // จำลองการดึงข้อมูลจาก API
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        const departments = await getAllDepartment();

        // อัพเดต state หรือตัวแปรสำหรับ GenCard1
        setUsers(users);
        setDepartmentData(departments);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);





  return (
    <>
      {/* Statistics Cards */}
      <UserManagementSummaryCard />

      {/* Users Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">User Management</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >

                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <table
                    id="multi-filter-select"
                    className="display table table-striped table-hover"
                  >
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Admin</th>
                        <th>Staff</th>
                        <th>Executive</th>
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tfoot>
                      <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Admin</th>
                        <th>Staff</th>
                        <th>Executive</th>
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </tfoot>
                    <tbody>
                      {users.map(user => {
                        const department = departmentData.find(
                          d => d.departmentId === user.departmentId
                        );

                        return (
                          <tr key={user.userId}>
                            <td>{user.email}</td>
                            <td>
                              {user.firstName} {user.lastName}
                            </td>
                            <td>{department?.name || '-'}</td>
                            <td>
                              {user.role === UserRole.Admin ? 'Admin' : ''}
                            </td>
                            <td>
                              {user.role === UserRole.Staff ? 'Staff' : ''}
                            </td>
                            <td>
                              {user.role === UserRole.Executive
                                ? 'Executive'
                                : ''}
                            </td>
                            <td>
                              <GenButtonCircle
                                color={B_LIST.edit.color}
                                icon={B_LIST.edit.icon}
                                link={`/admin/user/${user.userId}/edit`}
                                className="mx-3"
                              />

                            </td>
                            <td>
                              {
                                new Date(Number(user.updatedAt))
                                  .toISOString()
                                  .split('T')[0]
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                <DataTableFilter
                  tableId="multi-filter-select"
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default UserManagement;
