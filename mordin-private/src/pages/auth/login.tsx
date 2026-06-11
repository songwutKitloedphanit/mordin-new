import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { GenFormText1 } from '@/components/gui/GuiForm';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { DASHBOARD_URL } from '@/utils/RoleToURL';

// จุดเด่นของระบบบน hero — ข้อความล้วน (ห้ามใส่ตัวเลขสถิติปลอม:
// login ยังไม่ auth จึงเรียก API summary ไม่ได้)
const HERO_FEATURES = [
  'ติดตามตัวอย่างดินครบวงจรด้วย QR Code ตั้งแต่เก็บถึงออกรายงาน',
  'ผลวิเคราะห์ดินและคำแนะนำปุ๋ยรายแปลงจากห้องปฏิบัติการ',
  'รายงานภาพรวมสำหรับผู้บริหารและทีมส่งเสริมภาคสนาม',
];

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
          --mitr-blue-hover: #0068b8;
          min-height: 100vh;
          display: flex;
          align-items: stretch;
          background: #ffffff;
        }

        /* ===== ฝั่งซ้าย: hero gradient (mockup .login-hero) ===== */
        .private-login-hero {
          flex: 1.15;
          position: relative;
          overflow: hidden;
          padding: 46px 52px;
          color: #ffffff;
          background:
            radial-gradient(900px 500px at 85% -10%, rgba(63, 161, 255, 0.25), transparent 60%),
            radial-gradient(700px 600px at -10% 110%, rgba(24, 160, 92, 0.25), transparent 55%),
            linear-gradient(160deg, #002b50 0%, #00457e 45%, #0068ba 130%);
        }

        .private-login-hero-logo {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 21, 45, 0.35);
          overflow: hidden;
        }

        .private-login-hero-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .private-login-hero-logo-white {
          width: 52px;
          height: auto;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .private-login-hero-logo-white img {
          width: 100%;
          height: auto;
          object-fit: contain;
        }

        .private-login-hero-brand {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .private-login-hero-brand-sub {
          font-size: 11px;
          letter-spacing: 0.8px;
          color: rgba(255, 255, 255, 0.55);
          text-transform: uppercase;
        }

        .private-login-hero h1 {
          max-width: 460px;
          margin: 0;
          font-size: clamp(26px, 2.6vw, 34px);
          font-weight: 800;
          line-height: 1.3;
          letter-spacing: -0.5px;
        }

        .private-login-hero-desc {
          max-width: 430px;
          margin: 14px 0 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14.5px;
          line-height: 1.7;
        }

        .private-login-hero-features {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .private-login-hero-features li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          max-width: 430px;
          color: rgba(255, 255, 255, 0.78);
          font-size: 13.5px;
          line-height: 1.55;
        }

        .private-login-hero-features i {
          margin-top: 3px;
          color: #7fd4a8;
        }

        /* ===== ฝั่งขวา: ฟอร์มเดิมทั้งก้อน ===== */
        .private-login-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: #ffffff;
        }

        .private-login-form {
          width: 100%;
          max-width: 380px;
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
          background: linear-gradient(135deg, var(--mitr-blue) 0%, #003e72 100%);
          color: #ffffff;
          font-weight: 700;
          transition:
            background-color 0.16s ease,
            transform 0.16s ease,
            box-shadow 0.16s ease;
        }

        .private-login-submit:hover,
        .private-login-submit:focus {
          background: linear-gradient(135deg, var(--mitr-blue-hover) 0%, var(--mitr-blue) 100%);
          color: #ffffff;
          box-shadow: 0 12px 26px rgba(0, 80, 146, 0.24);
          transform: translateY(-1px);
        }

        .private-login-footnote {
          margin-top: 24px;
          text-align: center;
          font-size: 11.5px;
          color: #8b9bae;
        }
      `}</style>

      {/* hero ซ่อนบนจอ < lg (เหลือฟอร์มเต็มจอ) */}
      <aside
        className="private-login-hero d-none d-lg-flex flex-column justify-content-between"
        aria-hidden="true"
      >
        <div className="d-flex align-items-center gap-3">
          <div className="private-login-hero-logo-white">
            <img
              src={`${assetBaseUrl}assets/img/logo-mitr-phol-white.png`}
              alt="Mitr Phol Research"
            />
          </div>
          <div>
            <div className="private-login-hero-brand">MITR PHOL-SOIL</div>
            <div className="private-login-hero-brand-sub">
              Soil Analysis Platform
            </div>
          </div>
        </div>

        <div>
          <h1>
            วิเคราะห์ดินแม่นยำ
            <br />
            เพื่อผลผลิตอ้อยที่ยั่งยืน
          </h1>
          <p className="private-login-hero-desc">
            แพลตฟอร์มบริหารจัดการการวิเคราะห์ดินครบวงจร ตั้งแต่เก็บตัวอย่างด้วย
            QR Code และรถวิเคราะห์เคลื่อนที่
            ไปจนถึงคำแนะนำปุ๋ยรายแปลงและรายงานสำหรับผู้บริหาร
          </p>
        </div>

        <ul className="private-login-hero-features">
          {HERO_FEATURES.map(feature => (
            <li key={feature}>
              <i className="fas fa-circle-check"></i>
              {feature}
            </li>
          ))}
        </ul>
      </aside>

      <div className="private-login-panel">
        <div className="private-login-form">
          {/* brand เล็กบนจอเล็ก (hero ถูกซ่อน) — กันหน้า login ไร้แบรนด์บนมือถือ */}
          <div className="d-flex d-lg-none align-items-center gap-3 mb-4">
            <div className="private-login-hero-logo">
              <img
                src={`${assetBaseUrl}assets/img/mitrphol_research.webp`}
                alt="Mitr Phol Research"
              />
            </div>
            <div>
              <div
                className="private-login-hero-brand"
                style={{ color: 'var(--mitr-blue)' }}
              >
                MITR PHOL-SOIL
              </div>
              <div
                className="private-login-hero-brand-sub"
                style={{ color: '#8b9bae' }}
              >
                Soil Analysis Platform
              </div>
            </div>
          </div>

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

          <div className="private-login-footnote">
            ระบบภายในสำหรับผู้ปฏิบัติงาน Mitr Phol Research
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
