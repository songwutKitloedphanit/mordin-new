import React, { useEffect, useState } from 'react';
import { useLocation, NavLink, Outlet } from 'react-router-dom';

import Footer from '../components/layout/admin/Footer';
import Header from '../components/layout/admin/Header';
import Sidebar from '../components/layout/admin/Sidebar';

type PrivateTheme = 'light' | 'dark';

const PRIVATE_THEME_STORAGE_KEY = 'mordin-private-theme';

// ป้าย breadcrumb/ชื่อหน้า — ภาษาไทยให้ตรงกับเมนู Sidebar (แสดงผลเท่านั้น ไม่กระทบ route)
const breadcrumbNames: { [key: string]: string } = {
  admin: 'ผู้ดูแลระบบ',
  officer: 'เจ้าหน้าที่',
  executive: 'ผู้บริหาร',
  dashboard: 'แดชบอร์ด',
  user: 'ผู้ใช้งานระบบ',
  bus: 'รถบัส',
  'service-area': 'โรงงาน & เขตส่งเสริม',
  land: 'แปลงที่ดิน',
  farmer: 'ชาวไร่',
  shop: 'ร้านค้า',
  'service-calendar': 'ปฏิทินรอบบริการ',
  laboratory: 'ห้องปฏิบัติการ',
  'service-type': 'ประเภทบริการ',
  'fertilizer-prices': 'ราคาปุ๋ย',
  'fertilizer-usages': 'สูตรการใช้ปุ๋ย',
  standard: 'เกณฑ์มาตรฐาน',
  qrcode: 'QR Code',
  'qrcode-officer': 'สร้าง QR Code',
  'sample-receiving': 'รับตัวอย่างดิน',
  'analysis-setting': 'ตั้งค่าการวิเคราะห์',
  'add-pt-sample': 'เพิ่มเกณฑ์มาตรฐาน',
  'edit-pt-sample': 'แก้ไขเกณฑ์มาตรฐาน',
  'lab-result': 'บันทึกผลแล็บ',
  'add-21': 'บันทึกผล',
  'add-22': 'บันทึกผล',
  'add-23': 'บันทึกผล',
  'analysis-report': 'รายงานวิเคราะห์',
  report: 'รายงานผู้บริหาร',
  charts: 'กราฟ',
  profile: 'จัดการโปรไฟล์',
  'add-major': 'เพิ่มปุ๋ยหลัก',
  'add-minor': 'เพิ่มสารปรับปรุงดิน',
  'edit-major': 'แก้ไขปุ๋ยหลัก',
  'edit-minor': 'แก้ไขสารปรับปรุงดิน',
  'edit-score': 'แก้ไขคะแนน',
  'edit-result-grade': 'แก้ไขเกณฑ์ผลวิเคราะห์',
  'edit-working-standard': 'แก้ไข Working Standard',
  'input-result': 'กรอกผล',
  edit: 'แก้ไข',
  info: 'ข้อมูล',
  add: 'เพิ่ม',
};

const moduleLabelNames: { [key: string]: string } = {
  laboratory: 'ห้องปฏิบัติการ',
  'service-type': 'ประเภทบริการ',
  'service-area': 'โรงงาน & เขตส่งเสริม',
  'service-calendar': 'ปฏิทินรอบบริการ',
  'fertilizer-prices': 'ราคาปุ๋ย',
  'fertilizer-usages': 'สูตรการใช้ปุ๋ย',
};

const getInitialTheme = (): PrivateTheme => {
  try {
    const storedTheme = localStorage.getItem(PRIVATE_THEME_STORAGE_KEY);
    return storedTheme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<PrivateTheme>(getInitialTheme);
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.key]);

  useEffect(() => {
    try {
      localStorage.setItem(PRIVATE_THEME_STORAGE_KEY, theme);
    } catch {
      // Theme persistence is best-effort and should not block private layout rendering.
    }
  }, [theme]);

  useEffect(() => {
    document.body.setAttribute(
      'data-swal2-theme',
      isDarkMode ? 'dark' : 'light'
    );

    return () => {
      document.body.removeAttribute('data-swal2-theme');
    };
  }, [isDarkMode]);

  const generateBreadcrumbs = () => {
    const pathnamesRaw = location.pathname.split('/').filter(x => x);

    const pathnames: string[] = [];
    for (let i = 0; i < pathnamesRaw.length; i++) {
      const current = pathnamesRaw[i];
      if (
        (/^\d{2}[A-Z]{3,4}\d{1,2}$/.test(current) ||
          current.toLowerCase() === 'blank' ||
          current.toLowerCase() === 'pt-sample') &&
        i + 1 < pathnamesRaw.length &&
        /^\d+$/.test(pathnamesRaw[i + 1])
      ) {
        pathnames.push(`${current}/${pathnamesRaw[i + 1]}`);
        i++;
      } else {
        pathnames.push(current);
      }
    }

    const breadcrumbItems = [];

    breadcrumbItems.push(
      <li className="flex items-center" key="home">
        <NavLink
          to="/admin"
          className={`no-underline transition-colors ${
            isDarkMode
              ? 'text-[#AEB8C8] hover:text-[#E6EAF0]'
              : 'text-[#667085] hover:text-[#2F3A4A]'
          }`}
        >
          <i className="fa fa-home"></i>
        </NavLink>
      </li>
    );

    let url = '';
    const hasId = pathnames.some(
      name =>
        /^\d+$/.test(name) ||
        /^\d+-\d+/.test(name) ||
        /^\d{2}[A-Z]{3,4}\d{1,2}$/.test(name) ||
        /^\d{2}[A-Z]{3,4}\d{1,2}[-]\d+$/.test(name) ||
        /^\d{2}[A-Z]{3,4}\d{1,2}\/\d+$/.test(name) ||
        /^blank\/\d+$/.test(name) ||
        /^pt-sample\/\d+$/.test(name)
    );

    const filteredPathnames = pathnames.filter(
      name =>
        !/^\d+$/.test(name) &&
        !/^\d+-\d+/.test(name) &&
        !/^\d{2}[A-Z]{3,4}\d{1,2}$/.test(name) &&
        !/^\d{2}[A-Z]{3,4}\d{1,2}[-]\d+$/.test(name) &&
        !/^\d{2}[A-Z]{3,4}\d{1,2}\/\d+$/.test(name) &&
        !/^blank\/\d+$/.test(name) &&
        !/^pt-sample\/\d+$/.test(name)
    );

    if (pathnames.length === 1 && pathnames[0] === 'admin') {
      filteredPathnames.push('user');
    }

    const modulePath = pathnames[1] || 'user';
    const moduleFullName =
      breadcrumbNames[modulePath] ||
      modulePath.charAt(0).toUpperCase() + modulePath.slice(1);
    const moduleName =
      moduleLabelNames[modulePath] ??
      (modulePath.includes('-')
        ? moduleFullName
        : moduleFullName.split(' ')[0]);

    const categoryOnlyPaths = new Set(['admin', 'officer', 'executive']);

    const lastRenderableIndex = filteredPathnames.reduce(
      (acc, name, idx) => (!categoryOnlyPaths.has(name) ? idx : acc),
      -1
    );
    const willAddInfo = hasId && filteredPathnames.length === 2;
    const effectiveLastIndex = willAddInfo
      ? filteredPathnames.length
      : lastRenderableIndex;

    filteredPathnames.forEach((name, index) => {
      url += `/${name}`;

      if (categoryOnlyPaths.has(name)) return;

      const isLast = index === effectiveLastIndex;
      let displayName;

      const lastPath = filteredPathnames[filteredPathnames.length - 1];

      // หาใน map ก่อนเสมอ (ป้ายไทย) แล้วค่อย fallback เป็น capitalize จาก path
      displayName =
        breadcrumbNames[name] ??
        name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

      if (index === lastRenderableIndex) {
        if (lastPath in breadcrumbNames) {
          displayName = breadcrumbNames[lastPath];
        } else {
          displayName = lastPath
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }

        if (lastPath === 'add') {
          displayName = `${breadcrumbNames['add']} ${moduleName}`;
        } else if (hasId) {
          if (lastPath === 'info') {
            displayName = `${moduleName} ${breadcrumbNames['info']}`;
          } else if (lastPath === 'edit') {
            displayName = `${breadcrumbNames['edit']} ${moduleName}`;
          }
        }
      }

      const isEdit =
        displayName.includes('แก้ไข') ||
        displayName.toLowerCase().includes('edit');
      const separatorClasses = isDarkMode ? 'text-[#6F7B8E]' : 'text-[#94a3b8]';
      const currentClasses = isDarkMode
        ? 'text-[#E6EAF0] font-semibold'
        : 'text-[#2F3A4A] font-semibold';
      const linkClasses = `no-underline transition-colors ${
        isDarkMode
          ? 'text-[#AEB8C8] hover:text-[#E6EAF0]'
          : 'text-[#667085] hover:text-[#2F3A4A]'
      }`;

      breadcrumbItems.push(
        <li
          className={`flex items-center ${separatorClasses}`}
          key={`sep-${url}`}
        >
          <i className="fa fa-angle-right mx-1"></i>
        </li>,
        <li className="flex items-center" key={url}>
          {isLast || isEdit ? (
            <span className={currentClasses}>{displayName}</span>
          ) : (
            <NavLink to={url} className={linkClasses}>
              {displayName}
            </NavLink>
          )}
        </li>
      );
    });

    if (hasId && filteredPathnames.length === 2) {
      const infoUrl = `${location.pathname}`;
      const isCollectExam = filteredPathnames[1] === 'sample-receiving';
      const displayName = isCollectExam
        ? 'รับตัวอย่าง'
        : `${moduleName} ${breadcrumbNames['info']}`;

      breadcrumbItems.push(
        <li
          className={`flex items-center ${
            isDarkMode ? 'text-[#6F7B8E]' : 'text-[#94a3b8]'
          }`}
          key="sep-info"
        >
          <i className="fa fa-angle-right mx-1"></i>
        </li>,
        <li className="flex items-center" key={infoUrl}>
          <span
            className={
              isDarkMode
                ? 'text-[#E6EAF0] font-semibold'
                : 'text-[#2F3A4A] font-semibold'
            }
          >
            {displayName}
          </span>
        </li>
      );
    }

    return breadcrumbItems;
  };

  const getPageTitle = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    let lastKnownTitle = '';

    if (pathnames.length === 1) {
      const modulePath = pathnames[0];
      if (modulePath && breadcrumbNames[modulePath]) {
        lastKnownTitle = breadcrumbNames[modulePath];
      }
    } else {
      const modulePath = pathnames[1];
      if (modulePath && breadcrumbNames[modulePath]) {
        lastKnownTitle = breadcrumbNames[modulePath];
      }
    }

    return lastKnownTitle || 'แดชบอร์ด';
  };

  const pageTitle = getPageTitle();

  return (
    <div
      className={`private-layout-root flex h-screen overflow-hidden font-sans transition-colors ${
        isDarkMode
          ? 'private-layout-dark bg-[#172033] text-[#E6EAF0]'
          : 'bg-[#f3f5f8] text-[#2F3A4A]'
      }`}
    >
      <div
        onClick={() => setSidebarOpen(false)}
        aria-hidden
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity ${
          sidebarOpen ? '' : 'hidden'
        }`}
      />

      <Sidebar
        isOpen={sidebarOpen}
        isDarkMode={isDarkMode}
        onClose={() => setSidebarOpen(false)}
      />

      <main
        className={`flex min-w-0 flex-1 flex-col overflow-y-auto transition-colors ${
          isDarkMode ? 'bg-[#172033]' : 'bg-[#f3f5f8]'
        }`}
      >
        {/* Topbar เต็มกว้าง sticky (mockup .topbar) — title ใหญ่ย้ายลงไปอยู่ในเนื้อหา */}
        <Header
          onMenuClick={() => setSidebarOpen(current => !current)}
          isSidebarOpen={sidebarOpen}
          isDarkMode={isDarkMode}
          onThemeToggle={() =>
            setTheme(current => (current === 'dark' ? 'light' : 'dark'))
          }
          breadcrumbs={generateBreadcrumbs()}
        />
        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:px-[26px] lg:py-6">
          <div className="private-page-head">
            <h1
              className={`private-page-title ${
                isDarkMode ? 'text-[#E6EAF0]' : 'text-[#16222f]'
              }`}
            >
              {pageTitle}
            </h1>
          </div>
          <div key={location.pathname} className="private-page-transition">
            <Outlet />
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default AdminLayout;
