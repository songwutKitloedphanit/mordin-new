/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useLocation, NavLink, Outlet } from 'react-router-dom';

import Footer from '../components/layout/admin/Footer';
import Header from '../components/layout/admin/Header';
import Sidebar from '../components/layout/admin/Sidebar';

const breadcrumbNames: { [key: string]: string } = {
  admin: 'Admin',
  officer: 'Officer',
  executive: 'Executive',
  user: 'User Management',
  bus: 'Bus Management',
  'service-area': 'Service Area',
  land: 'Land Management',
  farmer: 'Farmer Management',
  shop: 'Shop Management',
  'service-calendar': 'Service Calendar',
  laboratory: 'Laboratories',
  'service-type': 'Service Types',
  'fertilizer-prices': 'Fertilizer Prices',
  'fertilizer-usages': 'Fertilizer Usages',
  standard: 'Standard Management',
  qrcode: 'QR code printing',
  'qrcode-officer': 'QR code printing',
  'sample-receiving': 'Sample Receiving',
  'analysis-setting': 'Analysis Setting',
  'add-pt-sample': 'Add Standard',
  'edit-pt-sample': 'Edit Standard',
  'lab-result': 'Lab Result',
  'add-21': 'Get Result',
  'add-22': 'Get Result',
  'add-23': 'Get Result',
  'analysis-report': 'Analysis Report',
  'report-1': 'Report 1',
  charts: 'Charts',

  edit: 'Edit',
  info: 'Info',
  add: 'Add',
};

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [outletKey, setOutletKey] = useState(location.key);

  useEffect(() => {
    const $ = (window as any).jQuery;
    if ($) {
      $('.sidebar .nav-item [data-bs-toggle="collapse"]').on(
        'click',
        function (this: HTMLElement) {
          $(this).parent().toggleClass('active submenu');
        }
      );
      $('.toggle-sidebar').on('click', function () {
        $('body').toggleClass('sidebar-mini');
      });
    }
  }, []);

  useEffect(() => {
    setOutletKey(location.key);
  }, [location.key]);

  const generateBreadcrumbs = () => {
    const pathnamesRaw = location.pathname.split('/').filter(x => x);

    // ปรับแต่ง pathnames ให้รวม 67JAN15/1, 67JAN1, blank/1 และ pt-sample/1 เป็นรหัสเดียว
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
      <li className="nav-home" key="home">
        <NavLink to="/admin">
          <i className="icon-home"></i>
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

    // ถ้า path เป็น /admin ให้เพิ่ม "user" เพื่อให้ Breadcrumbs แสดง "User Management"
    if (pathnames.length === 1 && pathnames[0] === 'admin') {
      filteredPathnames.push('user');
    }

    const modulePath = pathnames[1] || 'user';
    const moduleFullName =
      breadcrumbNames[modulePath] ||
      modulePath.charAt(0).toUpperCase() + modulePath.slice(1);
    const moduleName = modulePath.includes('-')
      ? moduleFullName
      : moduleFullName.split(' ')[0];

    const willAddInfo = hasId && filteredPathnames.length === 2;
    const effectiveLastIndex = willAddInfo
      ? filteredPathnames.length
      : filteredPathnames.length - 1;

    filteredPathnames.forEach((name, index) => {
      url += `/${name}`;
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

      if (index === filteredPathnames.length - 1) {
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

      breadcrumbItems.push(
        <li className="separator" key={`sep-${url}`}>
          <i className="icon-arrow-right"></i>
        </li>,
        <li className="nav-item" key={url}>
          {isLast || isEdit ? (
            <span>{displayName}</span>
          ) : (
            <NavLink to={url}>{displayName}</NavLink>
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
        <li className="separator" key="sep-info">
          <i className="icon-arrow-right"></i>
        </li>,
        <li className="nav-item" key={infoUrl}>
          <span>{displayName}</span>
        </li>
      );
    }

    return breadcrumbItems;
  };

  const getPageTitle = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    let lastKnownTitle = 'Admin';

    if (pathnames.length === 1) {
      const modulePath = pathnames[0];
      if (modulePath && breadcrumbNames[modulePath]) {
        lastKnownTitle = breadcrumbNames[modulePath];
      }
    } else {
      // ใช้ modulePath (pathnames[1]) เป็นหลักสำหรับ pageTitle
      const modulePath = pathnames[1];
      if (modulePath && breadcrumbNames[modulePath]) {
        lastKnownTitle = breadcrumbNames[modulePath];
      }
    }

    return lastKnownTitle;
  };

  const pageTitle = getPageTitle();

  return (
    <div className="wrapper">
      <Sidebar />
      <div className="main-panel">
        <Header />
        <div className="container">
          <div className="page-inner">
            <div className="page-header">
              <h3 className="fw-bold mb-3">{pageTitle}</h3>
              <ul className="breadcrumbs mb-3">{generateBreadcrumbs()}</ul>
            </div>
            <Outlet key={outletKey} />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
