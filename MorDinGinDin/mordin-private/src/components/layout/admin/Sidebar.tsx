import React, { useCallback, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/User';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const mainSection = pathSegments[0] || '';
  const subSection = pathSegments[1] || '';

  const isAdminActive = mainSection === 'admin' && subSection !== 'officer';
  const isOfficerActive = subSection === 'officer';
  const isExecutiveActive = subSection === 'executive';

  // State for toggling sidebar visibility
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Toggle function
  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  return (
    <div
      className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
      data-background-color="dark"
    >
      <div className="sidebar-logo">
        <div className="logo-header" data-background-color="dark">
          <NavLink to="/" className="logo ">
            <img
              src="/private/assets/img/mitrphol_research.webp"
              alt="navbar brand"
              className="navbar-brand"
              height="50"
              style={{
                // filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.3))',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
                objectFit: 'contain',
              }}
            />
          </NavLink>
          <div className="nav-toggle">
            <button
              className="btn btn-toggle toggle-sidebar"
              type="button"
              onClick={handleSidebarToggle}
            >
              <i className="gg-menu-right"></i>
            </button>
            <button
              className="btn btn-toggle sidenav-toggler"
              type="button"
              onClick={handleSidebarToggle}
            >
              <i className="gg-menu-left"></i>
            </button>
          </div>
          <button className="topbar-toggler more" type="button">
            <i className="gg-more-vertical-alt"></i>
          </button>
        </div>
        {/* End Logo Header */}
      </div>
      <div className="sidebar-wrapper scrollbar scrollbar-inner">
        <div className="sidebar-content">
          <ul className="nav nav-secondary">
            {/* Admin Section */}
            {user?.role === UserRole.Admin ? (
              <li
                className={`nav-item ${isAdminActive ? 'active submenu' : ''}`}
              >
                <a
                  data-bs-toggle="collapse"
                  href="#admin"
                  className={isAdminActive ? '' : 'collapsed'}
                  aria-expanded={isAdminActive}
                >
                  <i className="fas fa-home"></i>
                  <p>Admin</p>
                  <span className="caret"></span>
                </a>
                <div
                  className={`collapse ${isAdminActive ? 'show' : ''}`}
                  id="admin"
                >
                  <ul className="nav nav-collapse">
                    <li className={pathSegments[1] === 'user' ? 'active' : ''}>
                      <NavLink to="/admin/user">
                        <span className="sub-item">Users</span>
                      </NavLink>
                    </li>
                    <li className={pathSegments[1] === 'bus' ? 'active' : ''}>
                      <NavLink to="/admin/bus">
                        <span className="sub-item">Buses</span>
                      </NavLink>
                    </li>

                    <li className={pathSegments[1] === 'shop' ? 'active' : ''}>
                      <NavLink to="/admin/shop">
                        <span className="sub-item">Shops</span>
                      </NavLink>
                    </li>
                    <li
                      className={pathSegments[1] === 'farmer' ? 'active' : ''}
                    >
                      <NavLink to="/admin/farmer">
                        <span className="sub-item">Farmers</span>
                      </NavLink>
                    </li>
                    <li className={pathSegments[1] === 'land' ? 'active' : ''}>
                      <NavLink to="/admin/land">
                        <span className="sub-item">Lands</span>
                      </NavLink>
                    </li>
                    <li
                      className={
                        pathSegments[1] === 'service-area' ? 'active' : ''
                      }
                    >
                      <NavLink to="/admin/service-area">
                        <span className="sub-item">Service Areas</span>
                      </NavLink>
                    </li>
                    <li
                      className={
                        pathSegments[1] === 'service-calendar' ? 'active' : ''
                      }
                    >
                      <NavLink to="/admin/service-calendar">
                        <span className="sub-item">Service Calendars</span>
                      </NavLink>
                    </li>
                    <li
                      className={
                        pathSegments[1] === 'service-type' ? 'active' : ''
                      }
                    >
                      <NavLink to="/admin/service-type">
                        <span className="sub-item">Service Types</span>
                      </NavLink>
                    </li>
                    <li
                      className={
                        pathSegments[1] === 'laboratory' ? 'active' : ''
                      }
                    >
                      <NavLink to="/admin/laboratory">
                        <span className="sub-item">Laboratories</span>
                      </NavLink>
                    </li>
                    {/* <li
                    className={pathSegments[1] === "fertilizer" ? "active" : ""}
                  >
                    <NavLink to="/admin/fertilizer">
                      <span className="sub-item">Fertilizer</span>
                    </NavLink>
                  </li> */}
                    <li
                      className={
                        pathSegments[1] === 'fertilizer-prices' ? 'active' : ''
                      }
                    >
                      <NavLink to="/admin/fertilizer-prices">
                        <span className="sub-item">Fertilizer Prices</span>
                      </NavLink>
                    </li>
                    <li
                      className={
                        pathSegments[1] === 'fertilizer-usages' ? 'active' : ''
                      }
                    >
                      <NavLink to="/admin/fertilizer-usages">
                        <span className="sub-item">Fertilizer Usages</span>
                      </NavLink>
                    </li>

                    <li
                      className={pathSegments[1] === 'standard' ? 'active' : ''}
                    >
                      <NavLink to="/admin/standard">
                        <span className="sub-item">Standards</span>
                      </NavLink>
                    </li>

                    <li
                      className={pathSegments[1] === 'qrcode' ? 'active' : ''}
                    >
                      <NavLink to="/admin/qrcode">
                        <span className="sub-item">QR Codes</span>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </li>
            ) : (
              <></>
            )}

            {/* Officer Section */}
            {user?.role === UserRole.Staff || user?.role === UserRole.Admin ? (
              <li
                className={`nav-item ${isOfficerActive ? 'active submenu' : ''}`}
              >
                <a
                  data-bs-toggle="collapse"
                  href="#officer"
                  className={isOfficerActive ? '' : 'collapsed'}
                  aria-expanded={isOfficerActive}
                >
                  <i className="fas fa-home"></i>
                  <p>Officer</p>
                  <span className="caret"></span>
                </a>
                <div
                  className={`collapse ${isOfficerActive ? 'show' : ''}`}
                  id="officer"
                >
                  <ul className="nav nav-collapse">
                    <li
                      className={
                        pathSegments[1] === 'qrcode-officer' ? 'active' : ''
                      }
                    >
                      <NavLink to="/officer/qrcode-officer">
                        <span className="sub-item">Step1-QR code printing</span>
                      </NavLink>
                    </li>

                    <li
                      className={
                        pathSegments[1] === 'sample-receiving' ? 'active' : ''
                      }
                    >
                      <NavLink to="/officer/sample-receiving">
                        <span className="sub-item">Step2-Sample Receiving</span>
                      </NavLink>
                    </li>
                    <li
                      className={
                        pathSegments[1] === 'analysis-setting' ? 'active' : ''
                      }
                    >
                      <NavLink to="/officer/analysis-setting">
                        <span className="sub-item">Step3-Analysis Setting</span>
                      </NavLink>
                    </li>
                    <li
                      className={
                        pathSegments[1] === 'lab-result' ? 'active' : ''
                      }
                    >
                      <NavLink to="/officer/lab-result">
                        <span className="sub-item">Step4-Lab result</span>
                      </NavLink>
                    </li>
                    <li
                      className={
                        pathSegments[1] === 'analysis-report' ? 'active' : ''
                      }
                    >
                      <NavLink to="/officer/analysis-report">
                        <span className="sub-item">Step5-Analysis Report</span>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </li>
            ) : (
              <></>
            )}

            {/* Executive Section */}
            {user?.role === UserRole.Executive ||
            user?.role === UserRole.Staff ||
            user?.role === UserRole.Admin ? (
              <li
                className={`nav-item ${isExecutiveActive ? 'active submenu' : ''}`}
              >
                <a
                  data-bs-toggle="collapse"
                  href="#executive"
                  className={isExecutiveActive ? '' : 'collapsed'}
                  aria-expanded={isExecutiveActive}
                >
                  <i className="fas fa-home"></i>
                  <p>Executive</p>
                  <span className="caret"></span>
                </a>
                <div
                  className={`collapse ${isExecutiveActive ? 'show' : ''}`}
                  id="executive"
                >
                  <ul className="nav nav-collapse">
                    <li
                      className={
                        pathSegments[1] === 'dashboard' ? 'active' : ''
                      }
                    >
                      <NavLink to="/executive/dashboard">
                        <span className="sub-item">Dashboard</span>
                      </NavLink>
                    </li>
                    <li
                      className={pathSegments[1] === 'report-1' ? 'active' : ''}
                    >
                      <NavLink to="/executive/report-1">
                        <span className="sub-item">Report-1</span>
                      </NavLink>
                    </li>
                    {/* <li
                      className={pathSegments[1] === 'charts' ? 'active' : ''}
                    >
                      <NavLink to="/executive/charts">
                        <span className="sub-item">Report-exam</span>
                      </NavLink>
                    </li> */}
                  </ul>
                </div>
              </li>
            ) : (
              <></>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
