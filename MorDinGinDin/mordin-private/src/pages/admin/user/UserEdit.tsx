import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import {
  GenFormText1,
  GenFormSelect,
  GenFormRadioGroup,
} from '../../../components/gui/GuiForm';
import {
  getAllDepartment,
  getUserById,
  updateUser,
} from '../../../services/api/UserApi';
import { Department } from '../../../types/Department';
import { UserCreateInput, UserRole } from '../../../types/User';

import UserManagementSummaryCard from '@/components/pages/user/UserManagementSummaryCard';

const roleOptions = Object.values(UserRole).map(role => ({
  value: role,
  label: role,
}));

const UserEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState<null | {
    type: 'delete' | 'cancel';
    index?: number;
  }>(null);

  const [selectUser, setSelectUser] = useState<UserCreateInput>({
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.Staff,
    departmentId: 0,
  });

  const [departmentOptions, setDepartmentOptions] = useState<
    { value: number; name: string }[]
  >([]);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  }>({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = Number(id);
        const [departments, user] = await Promise.all([
          getAllDepartment(),
          getUserById(userId),
        ]);

        setDepartmentOptions(
          (departments as Department[]).map(d => ({
            value: d.departmentId,
            name: d.name,
          }))
        );

        setSelectUser({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          role: (user.role as UserRole) || UserRole.Staff,
          departmentId: user.departmentId ?? 0,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSelectUser(prev => ({ ...prev, [name]: value }));

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name as keyof typeof errors];
      return newErrors;
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectUser(prev => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name as keyof typeof errors];
      return newErrors;
    });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectUser(prev => ({
      ...prev,
      role: e.target.value as UserRole,
    }));

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.role;
      return newErrors;
    });
  };

  const handleSubmit = async () => {
    setErrors({});
    const newErrors: typeof errors = {};

    if (!selectUser.firstName) newErrors.firstName = 'กรุณากรอกชื่อ';
    if (!selectUser.lastName) newErrors.lastName = 'กรุณากรอกนามสกุล';
    if (!selectUser.email || !selectUser.email.endsWith('.com'))
      newErrors.email = 'กรุณากรอกอีเมลที่ถูกต้อง (ต้องจบด้วย .com)';
    if (!selectUser.role) newErrors.role = 'กรุณาเลือกบทบาท';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await updateUser(Number(id), selectUser);
      await Swal.fire({
        title: 'แก้ไขผู้ใช้สำเร็จ',
        icon: 'success',
        confirmButtonText: 'ตกลง',
      });
      navigate('/admin/user');
    } catch (error) {
      console.error('Error updating user:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถแก้ไขข้อมูลผู้ใช้ได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  const handleCancel = () => {
    navigate('/admin/user');
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <UserManagementSummaryCard />

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">
                    Edit User ({selectUser.email || '-'})
                  </h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.list.color}
                    icon={B_LIST.list.icon}
                    link="/admin/user"
                  />
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    link="/admin/user/add"
                    className="mx-1"
                  />
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="col-md-6 mx-auto">
                <GenFormText1
                  id="user-email"
                  name="email"
                  label="Email Address"
                  value={selectUser.email || ''}
                  onChange={handleChange}
                  isRequired
                  placeholder="Enter Address (email)"
                  remark="ใช้เพื่อยืนยันตัวตน"
                  errorMessage={errors.email}
                  readOnly={true}
                />

                <GenFormText1
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={selectUser.firstName || ''}
                  onChange={handleChange}
                  isRequired
                  placeholder="Enter First Name"
                  errorMessage={errors.firstName}
                  readOnly={true}
                />

                <GenFormText1
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={selectUser.lastName || ''}
                  onChange={handleChange}
                  isRequired
                  placeholder="Enter Last Name"
                  errorMessage={errors.lastName}
                  readOnly={true}
                />

                <GenFormSelect
                  id="department"
                  name="departmentId"
                  label="Department"
                  value={selectUser.departmentId?.toString() || ''}
                  options={departmentOptions}
                  onChange={handleSelectChange}
                  isRequired
                  disabled={true}
                />

                <GenFormRadioGroup
                  label="Roles"
                  name="role"
                  options={roleOptions}
                  value={selectUser.role || ''}
                  onChange={handleRadioChange}
                  errorMessage={errors.role}
                />

                <div className="card-action d-flex justify-content-between mt-4">
                  <button
                    className="btn btn-success"
                    style={{ width: '150px' }}
                    onClick={handleSubmit}
                    type="button"
                  >
                    Edit User
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ width: '150px' }}
                    onClick={() => setShowConfirm({ type: 'cancel' })}
                    type="button"
                  >
                    Cancel
                  </button>
                  {showConfirm && (
                    <ConfirmAlert
                      title="ยืนยันการยกเลิก"
                      text="คุณต้องการยกเลิกการแก้ไขหรือไม่?"
                      action={showConfirm.type}
                      onConfirm={handleCancel}
                      onCancel={() => setShowConfirm(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEdit;
