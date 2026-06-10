import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { GenFormText1 } from '@/components/gui/GuiForm';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { DASHBOARD_URL } from '@/utils/RoleToURL';

const Login = () => {
  const { user, login, error, isLoggedIn, isLoading } = useAuth();
  const assetBaseUrl = import.meta.env.BASE_URL;
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
    return <Navigate to={DASHBOARD_URL} replace />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main className="private-login-page">
      <style>{`
        .private-login-page {
          --mitr-blue: #005092;
          --mitr-blue-dark: #004a8f;
          --mitr-blue-hover: #0068b8;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background:
            radial-gradient(circle at 12% 16%, rgba(0, 80, 146, 0.12), transparent 30%),
            radial-gradient(circle at 86% 82%, rgba(0, 74, 143, 0.1), transparent 30%),
            linear-gradient(135deg, #f7f9fb 0%, #ffffff 48%, #f1f4f7 100%);
        }

        .private-login-shell {
          position: relative;
          width: min(100%, 1040px);
          min-height: 600px;
          display: grid;
          grid-template-columns: minmax(0, 600px) 440px;
          overflow: hidden;
          border: 1px solid rgba(0, 80, 146, 0.16);
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 24px 70px rgba(0, 74, 143, 0.16);
        }

        .private-login-shell::before {
          content: '';
          position: absolute;
          z-index: 2;
          top: 0;
          left: 0;
          right: auto;
          width: 600px;
          max-width: calc(100% - 440px);
          height: 6px;
          background: linear-gradient(90deg, var(--mitr-blue-dark) 0%, var(--mitr-blue) 100%);
        }

        .private-login-brand {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 42px;
          color: #ffffff;
          background:
            linear-gradient(135deg, rgba(0, 74, 143, 0.96) 0%, rgba(0, 80, 146, 0.9) 56%, rgba(0, 104, 184, 0.88) 100%),
            url('${assetBaseUrl}assets/img/mitrphol_research.webp') center / contain no-repeat;
        }

        .private-login-brand::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(0, 42, 88, 0.06), rgba(0, 42, 88, 0.38)),
            linear-gradient(90deg, rgba(255, 255, 255, 0.08), transparent 44%);
        }

        .private-login-brand > * {
          position: relative;
          z-index: 1;
        }

        .private-login-brand h1 {
          margin: 0 0 12px;
          font-size: clamp(2rem, 4vw, 3.25rem);
          line-height: 1.08;
          font-weight: 700;
          letter-spacing: 0;
          text-shadow: 0 2px 14px rgba(0, 42, 88, 0.34);
        }

        .private-login-brand p {
          max-width: 440px;
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          line-height: 1.7;
        }

        .private-login-form-panel {
          display: flex;
          align-items: center;
          padding: 48px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98)),
            #ffffff;
        }

        .private-login-form {
          width: 100%;
        }

        .private-login-form h2 {
          margin: 0;
          color: var(--mitr-blue);
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: 0;
        }

        .private-login-form .form-group {
          margin-bottom: 0;
        }

        .private-login-form label {
          margin-bottom: 8px;
          color: #1f3a5f !important;
          font-weight: 600;
        }

        .private-login-form .form-control {
          min-height: 48px;
          border: 1px solid #d6dde6;
          border-radius: 8px;
          background-color: #ffffff;
          color: #111827;
          font-size: 15px;
          transition:
            border-color 0.16s ease,
            box-shadow 0.16s ease;
        }

        .private-login-form .form-control:focus {
          border-color: var(--mitr-blue-hover);
          box-shadow: 0 0 0 3px rgba(0, 104, 184, 0.18) !important;
        }

        .private-login-form .alert {
          border-radius: 8px;
        }

        .private-login-submit {
          min-height: 52px;
          border: 0;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--mitr-blue) 0%, var(--mitr-blue-dark) 100%);
          color: #ffffff;
          font-weight: 700;
          transition:
            background-color 0.16s ease,
            transform 0.16s ease,
            box-shadow 0.16s ease;
        }

        .private-login-submit:hover,
        .private-login-submit:focus {
          background: linear-gradient(135deg, var(--mitr-blue-hover) 0%, var(--mitr-blue-dark) 100%);
          color: #ffffff;
          box-shadow: 0 12px 26px rgba(0, 80, 146, 0.24);
          transform: translateY(-1px);
        }

        @media (max-width: 991.98px) {
          .private-login-shell {
            max-width: 560px;
            min-height: auto;
            grid-template-columns: 1fr;
          }

          .private-login-brand {
            min-height: 240px;
            padding: 28px;
          }

          .private-login-shell::before {
            width: 100%;
            max-width: none;
          }

          .private-login-form-panel {
            padding: 36px 28px;
          }
        }

        @media (max-width: 575.98px) {
          .private-login-page {
            align-items: stretch;
            padding: 0;
          }

          .private-login-shell {
            width: 100%;
            min-height: 100vh;
            border: 0;
            border-radius: 0;
            box-shadow: none;
          }

          .private-login-brand {
            min-height: 200px;
            padding: 24px;
          }

          .private-login-form-panel {
            align-items: flex-start;
            padding: 28px 20px 36px;
          }
        }
      `}</style>

      <section className="private-login-shell" aria-label="เข้าสู่ระบบ">
        <aside className="private-login-brand">
          <div>
            <h1>MITR PHOL-SOIL</h1>
            <p>ระบบจัดการข้อมูลดินและรายงานภายในสำหรับผู้ปฏิบัติงาน</p>
          </div>
        </aside>

        <div className="private-login-form-panel">
          <div className="private-login-form">
            <div className="mb-4">
              <h2>เข้าสู่ระบบ</h2>
              <p className="mb-0 mt-2 text-muted">
                ใช้บัญชีผู้ใช้งานที่ได้รับสิทธิ์เพื่อเข้าถึงระบบ
              </p>
            </div>

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

              <button type="submit" className="private-login-submit w-100">
                เข้าสู่ระบบ
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
