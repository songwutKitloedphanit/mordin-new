import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/api/UserApi';
import { UserProfileUpdateInput } from '@/types/User';

type ProfileErrors = Partial<Record<keyof UserProfileUpdateInput, string>>;

const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfileUpdateInput>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setProfile({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    });
  }, [user]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as keyof UserProfileUpdateInput;
    setProfile(current => ({ ...current, [field]: event.target.value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: ProfileErrors = {};
    const normalizedProfile = {
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      email: profile.email.trim(),
    };

    if (!normalizedProfile.firstName) {
      nextErrors.firstName = 'กรุณากรอกชื่อ';
    }
    if (!normalizedProfile.lastName) {
      nextErrors.lastName = 'กรุณากรอกนามสกุล';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedProfile.email)) {
      nextErrors.email = 'กรุณากรอกอีเมลให้ถูกต้อง';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 ? normalizedProfile : null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedProfile = validate();
    if (!normalizedProfile) return;

    try {
      setIsSaving(true);
      await updateUserProfile(normalizedProfile);
      await refreshProfile();
      await Swal.fire({
        title: 'บันทึกโปรไฟล์เรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง',
      });
    } catch {
      await Swal.fire({
        title: 'ไม่สามารถบันทึกโปรไฟล์ได้',
        text: 'กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-xl-7 col-lg-8">
          <div className="private-card">
            <div className="private-card-header">
              <h4 className="private-card-title mb-1">จัดการโปรไฟล์</h4>
              <p className="text-muted mb-0">
                แก้ไขข้อมูลส่วนตัวสำหรับบัญชีที่กำลังเข้าสู่ระบบ
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="private-card-body">
                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-username">
                    ชื่อผู้ใช้
                  </label>
                  <input
                    id="profile-username"
                    className="form-control"
                    value={user?.username || ''}
                    readOnly
                  />
                  <div className="form-text">ชื่อผู้ใช้ไม่สามารถแก้ไขได้</div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-first-name">
                    ชื่อ
                  </label>
                  <input
                    id="profile-first-name"
                    name="firstName"
                    className={`form-control ${
                      errors.firstName ? 'is-invalid' : ''
                    }`}
                    value={profile.firstName}
                    onChange={handleChange}
                    maxLength={45}
                    required
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-last-name">
                    นามสกุล
                  </label>
                  <input
                    id="profile-last-name"
                    name="lastName"
                    className={`form-control ${
                      errors.lastName ? 'is-invalid' : ''
                    }`}
                    value={profile.lastName}
                    onChange={handleChange}
                    maxLength={45}
                    required
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-email">
                    อีเมล
                  </label>
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    className={`form-control ${
                      errors.email ? 'is-invalid' : ''
                    }`}
                    value={profile.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
              </div>

              <div className="private-card-footer d-flex justify-content-end">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
