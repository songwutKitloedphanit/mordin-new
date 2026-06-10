import React, { useEffect, useState } from 'react';
import { useLocation, NavLink, Outlet } from 'react-router-dom';

import Footer from '../components/layout/admin/Footer';
import Header from '../components/layout/admin/Header';
import Sidebar from '../components/layout/admin/Sidebar';

type PrivateTheme = 'light' | 'dark';

const PRIVATE_THEME_STORAGE_KEY = 'mordin-private-theme';

const breadcrumbNames: { [key: string]: string } = {
  admin: 'Admin',
  officer: 'Officer',
  executive: 'Executive',
  dashboard: 'Dashboard',
  user: 'User Management',
  bus: 'Bus Management',
  'service-area': 'Factories & Promotion Zones',
  land: 'Land Management',
  farmer: 'Farmer Management',
  shop: 'Shop Management',
  'service-calendar': 'Service Calendars',
  laboratory: 'Laboratories',
  'service-type': 'Service Types',
  'fertilizer-prices': 'Fertilizer Prices',
  'fertilizer-usages': 'Fertilizer Usages',
  standard: 'Standard Management',
  qrcode: 'QR Code',
  'qrcode-officer': 'QR Code',
  'sample-receiving': 'Sample Receiving',
  'analysis-setting': 'Analysis Setting',
  'add-pt-sample': 'Add Standard',
  'edit-pt-sample': 'Edit Standard',
  'lab-result': 'Lab Result',
  'add-21': 'Get Result',
  'add-22': 'Get Result',
  'add-23': 'Get Result',
  'analysis-report': 'Analysis Report',
  report: 'Report',
  charts: 'Charts',
  profile: 'Profile Management',
  'add-major': 'Add (Major)',
  'add-minor': 'Add (Minor)',
  'edit-major': 'Edit (Major)',
  'edit-minor': 'Edit (Minor)',
  'edit-score': 'Edit Score',
  'edit-result-grade': 'Edit Result Grade',
  'edit-working-standard': 'Edit Working Standard',
  'input-result': 'Input Result',
  edit: 'Edit',
  info: 'Info',
  add: 'Add',
};

const moduleLabelNames: { [key: string]: string } = {
  laboratory: 'Laboratory',
  'service-type': 'Service Type',
  'service-area': 'Factory & Zone',
  'service-calendar': 'Service Calendar',
  'fertilizer-prices': 'Fertilizer Price',
  'fertilizer-usages': 'Fertilizer Usage',
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

      if (name.includes('-')) {
        displayName = name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      } else {
        displayName =
          breadcrumbNames[name] || name.charAt(0).toUpperCase() + name.slice(1);
      }

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

      const isEdit = displayName.toLowerCase().includes('edit');
      const separatorClasses = isDarkMode ? 'text-[#6F7B8E]' : 'text-[#A19A90]';
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
        ? 'Receiving'
        : `${moduleName} ${breadcrumbNames['info']}`;

      breadcrumbItems.push(
        <li
          className={`flex items-center ${
            isDarkMode ? 'text-[#6F7B8E]' : 'text-[#A19A90]'
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

    return lastKnownTitle || 'Dashboard';
  };

  const pageTitle = getPageTitle();

  return (
    <div
      className={`private-layout-root flex h-screen overflow-hidden font-sans transition-colors ${
        isDarkMode
          ? 'private-layout-dark bg-[#172033] text-[#E6EAF0]'
          : 'bg-[#eeeeee] text-[#2F3A4A]'
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
          isDarkMode ? 'bg-[#172033]' : 'bg-[#eeeeee]'
        }`}
      >
        <div className="min-w-0 flex-1 p-6 lg:p-10">
          <Header
            onMenuClick={() => setSidebarOpen(current => !current)}
            isSidebarOpen={sidebarOpen}
            isDarkMode={isDarkMode}
            onThemeToggle={() =>
              setTheme(current => (current === 'dark' ? 'light' : 'dark'))
            }
            pageTitle={pageTitle}
            breadcrumbs={generateBreadcrumbs()}
          />
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
