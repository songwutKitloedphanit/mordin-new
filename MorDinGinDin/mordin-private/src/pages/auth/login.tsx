import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { GenFormText1 } from '@/components/gui/GuiForm';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { RoleToURL } from '@/utils/RoleToURL';

const Login = () => {
  const { user, login, error, isLoggedIn, isLoading } = useAuth();
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      username: loginForm.username,
      password: loginForm.password,
    });
  };

  if (isLoggedIn && user) {
    return <Navigate to={RoleToURL[user.role]} replace />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3"
      style={{ backgroundColor: '#f8f9fa' }}
    >
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
          <div className="card shadow-lg border-0">
            <div
              className="card-header text-white text-center py-4"
              style={{ backgroundColor: '#1a2035' }}
            >
              <h4 className="mb-0 fw-bold">เข้าสู่ระบบ</h4>
            </div>
            <div className="card-body p-4 p-sm-5">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <GenFormText1
                    id="username"
                    isRequired={true}
                    name="username"
                    label="ชื่อผู้ใช้ (อีเมล)"
                    placeholder="กรุณากรอกอีเมล"
                    value={loginForm.username}
                    onChange={handleChange}
                    type="text"
                  />
                </div>

                <div className="mb-4">
                  <GenFormText1
                    id="password"
                    isRequired={true}
                    name="password"
                    label="รหัสผ่าน"
                    placeholder="กรุณากรอกรหัสผ่าน"
                    value={loginForm.password}
                    onChange={handleChange}
                    type="password"
                  />
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-lg py-3 text-white fw-semibold"
                    style={{
                      backgroundColor: '#1a2035',
                      borderColor: '#1a2035',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#0d1421';
                      e.currentTarget.style.borderColor = '#0d1421';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#1a2035';
                      e.currentTarget.style.borderColor = '#1a2035';
                    }}
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
