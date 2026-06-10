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
      nextErrors.firstName = 'เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเธทเนเธญ';
    }
    if (!normalizedProfile.lastName) {
      nextErrors.lastName = 'เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเธฒเธกเธชเธเธธเธฅ';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedProfile.email)) {
      nextErrors.email = 'เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธญเธตเน€เธกเธฅเนเธซเนเธ–เธนเธเธ•เนเธญเธ';
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
        title: 'เธเธฑเธเธ—เธถเธเนเธเธฃเนเธเธฅเนเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง',
        icon: 'success',
        confirmButtonText: 'เธ•เธเธฅเธ',
      });
    } catch {
      await Swal.fire({
        title: 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธเธฑเธเธ—เธถเธเนเธเธฃเนเธเธฅเนเนเธ”เน',
        text: 'เธเธฃเธธเธ“เธฒเธ•เธฃเธงเธเธชเธญเธเธเนเธญเธกเธนเธฅเนเธฅเนเธงเธฅเธญเธเนเธซเธกเนเธญเธตเธเธเธฃเธฑเนเธ',
        icon: 'error',
        confirmButtonText: 'เธ•เธเธฅเธ',
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
              <h4 className="private-card-title mb-1">เธเธฑเธ”เธเธฒเธฃเนเธเธฃเนเธเธฅเน</h4>
              <p className="text-muted mb-0">
                เนเธเนเนเธเธเนเธญเธกเธนเธฅเธชเนเธงเธเธ•เธฑเธงเธชเธณเธซเธฃเธฑเธเธเธฑเธเธเธตเธ—เธตเนเธเธณเธฅเธฑเธเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="private-card-body">
                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-username">
                    เธเธทเนเธญเธเธนเนเนเธเน
                  </label>
                  <input
                    id="profile-username"
                    className="form-control"
                    value={user?.username || ''}
                    readOnly
                  />
                  <div className="form-text">เธเธทเนเธญเธเธนเนเนเธเนเนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธเนเนเธเนเธ”เน</div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-first-name">
                    เธเธทเนเธญ
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
                    เธเธฒเธกเธชเธเธธเธฅ
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
                    เธญเธตเน€เธกเธฅ
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
                  {isSaving ? 'เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธ...' : 'เธเธฑเธเธ—เธถเธเธเธฒเธฃเน€เธเธฅเธตเนเธขเธเนเธเธฅเธ'}
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

