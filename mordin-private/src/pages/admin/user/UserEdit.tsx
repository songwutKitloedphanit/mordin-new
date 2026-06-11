import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import {
  GenFormRadioGroup,
  GenFormSelect,
  GenFormText1,
} from '../../../components/gui/GuiForm';
import {
  getAllDepartment,
  getUserById,
  updateUser,
} from '../../../services/api/UserApi';
import { Department } from '../../../types/Department';
import { UserRole, UserUpdateInput } from '../../../types/User';

import { TableSkeleton } from '@/components/gui/Skeleton';
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

  const [selectUser, setSelectUser] = useState<UserUpdateInput>({
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
      <div className="private-card p-4">
        <TableSkeleton rows={6} cols={2} />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <UserManagementSummaryCard />

      <div className="row">
        <div className="col-md-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-user-pen me-2" />
                แก้ไขผู้ใช้งาน{selectUser.email ? ` — ${selectUser.email}` : ''}
              </h4>
              <GenButtonCircle
                color={B_LIST.list.color}
                icon={B_LIST.list.icon}
                link="/admin/user"
              />
            </div>

            <div className="private-card-body">
              <div className="col-md-6 mx-auto">
                <GenFormText1
                  id="user-email"
                  name="email"
                  label="อีเมล"
                  value={selectUser.email || ''}
                  onChange={handleChange}
                  isRequired
                  placeholder="อีเมลผู้ใช้งาน"
                  remark="ใช้เพื่อยืนยันตัวตน (แก้ไขไม่ได้)"
                  errorMessage={errors.email}
                  readOnly={true}
                />

                <GenFormText1
                  id="firstName"
                  name="firstName"
                  label="ชื่อ"
                  value={selectUser.firstName || ''}
                  onChange={handleChange}
                  isRequired
                  placeholder="ชื่อ"
                  errorMessage={errors.firstName}
                  readOnly={true}
                />

                <GenFormText1
                  id="lastName"
                  name="lastName"
                  label="นามสกุล"
                  value={selectUser.lastName || ''}
                  onChange={handleChange}
                  isRequired
                  placeholder="นามสกุล"
                  errorMessage={errors.lastName}
                  readOnly={true}
                />

                <GenFormSelect
                  id="department"
                  name="departmentId"
                  label="แผนก"
                  value={selectUser.departmentId?.toString() || ''}
                  options={departmentOptions}
                  onChange={handleSelectChange}
                  isRequired
                  disabled={true}
                />

                <GenFormRadioGroup
                  label="บทบาท / สิทธิ์การใช้งาน"
                  name="role"
                  options={roleOptions}
                  value={selectUser.role || ''}
                  onChange={handleRadioChange}
                  errorMessage={errors.role}
                />

                <div className="private-action-footer d-flex justify-content-between mt-4">
                  <button
                    className="btn btn-primary px-4"
                    onClick={handleSubmit}
                    type="button"
                  >
                    <i className="fas fa-save me-2" />
                    บันทึกการแก้ไข
                  </button>
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setShowConfirm({ type: 'cancel' })}
                    type="button"
                  >
                    <i className="fas fa-times me-2" />
                    ยกเลิก
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
