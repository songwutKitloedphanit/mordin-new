import React from 'react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="main-header">
      <div className="main-header-logo">
        <div className="logo-header" data-background-color="dark">
          <NavLink to="/" className="logo">
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
            <button className="btn btn-toggle toggle-sidebar" type="button">
              <i className="gg-menu-right"></i>
            </button>
            <button className="btn btn-toggle sidenav-toggler" type="button">
              <i className="gg-menu-left"></i>
            </button>
          </div>
          <button className="topbar-toggler more" type="button">
            <i className="gg-more-vertical-alt"></i>
          </button>
        </div>
      </div>
      <nav className="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom">
        <div className="container-fluid">
          {/* <nav className="navbar navbar-header-left navbar-expand-lg navbar-form nav-search p-0 d-none d-lg-flex">
            <div className="input-group">
              <div className="input-group-prepend">
                <button type="submit" className="btn btn-search pe-1">
                  <i className="fa fa-search search-icon"></i>
                </button>
              </div>
              <input
                type="text"
                placeholder="Search ..."
                className="form-control"
              />
            </div>
          </nav> */}

          <ul className="navbar-nav topbar-nav ms-md-auto align-items-center">
            {/* Search Icon (Mobile) */}
            {/* <li className="nav-item topbar-icon dropdown hidden-caret d-flex d-lg-none">
              <a
                className="nav-link dropdown-toggle"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <i className="fa fa-search"></i>
              </a>
              <ul className="dropdown-menu dropdown-search animated fadeIn">
                <form className="navbar-left navbar-form nav-search">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Search ..."
                      className="form-control"
                    />
                  </div>
                </form>
              </ul>
            </li> */}

            {/* Messages Dropdown */}
            {/* <li className="nav-item topbar-icon dropdown hidden-caret">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="messageDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="fa fa-envelope"></i>
              </a>
              <ul
                className="dropdown-menu messages-notif-box animated fadeIn"
                aria-labelledby="messageDropdown"
              >
                <li>
                  <div className="dropdown-title d-flex justify-content-between align-items-center">
                    Messages
                    <a href="#" className="small">
                      Mark all as read
                    </a>
                  </div>
                </li>
                <li>
                  <div className="message-notif-scroll scrollbar-outer">
                    <div className="notif-center">
                      <a href="#">
                        <div className="notif-img">
                          <img
                            src="/private/assets/img/jm_denis.jpg"
                            alt="Img Profile"
                          />
                        </div>
                        <div className="notif-content">
                          <span className="subject">Jimmy Denis</span>
                          <span className="block">How are you ?</span>
                          <span className="time">5 minutes ago</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </li>
                <li>
                  <a
                    className="see-all"
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                    }}
                  >
                    See all messages<i className="fa fa-angle-right"></i>
                  </a>
                </li>
              </ul>
            </li> */}

            {/* Notifications Dropdown */}
            {/* <li className="nav-item topbar-icon dropdown hidden-caret">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="notifDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="fa fa-bell"></i>
                <span className="notification">4</span>
              </a>
              <ul
                className="dropdown-menu notif-box animated fadeIn"
                aria-labelledby="notifDropdown"
              >
                <li>
                  <div className="dropdown-title">
                    You have 4 new notification
                  </div>
                </li>
                <li>
                  <div className="notif-scroll scrollbar-outer">
                    <div className="notif-center">
                      <a href="#">
                        <div className="notif-icon notif-primary">
                          <i className="fa fa-user-plus"></i>
                        </div>
                        <div className="notif-content">
                          <span className="block">New user registered</span>
                          <span className="time">5 minutes ago</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </li>
                <li>
                  <a
                    className="see-all"
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                    }}
                  >
                    See all notifications<i className="fa fa-angle-right"></i>
                  </a>
                </li>
              </ul>
            </li> */}

            {/* Quick Actions Dropdown */}
            {/* <li className="nav-item topbar-icon dropdown hidden-caret">
              <a
                className="nav-link"
                data-bs-toggle="dropdown"
                href="#"
                aria-expanded="false"
              >
                <i className="fas fa-layer-group"></i>
              </a>
              <div className="dropdown-menu quick-actions animated fadeIn">
                <div className="quick-actions-header">
                  <span className="title mb-1">Quick Actions</span>
                  <span className="subtitle op-7">Shortcuts</span>
                </div>
                <div className="quick-actions-scroll scrollbar-outer">
                  <div className="quick-actions-items">
                    <div className="row m-0">
                      <a className="col-6 col-md-4 p-0" href="#">
                        <div className="quick-actions-item">
                          <div className="avatar-item bg-danger rounded-circle">
                            <i className="far fa-calendar-alt"></i>
                          </div>
                          <span className="text">Calendar</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li> */}

            {/* User Profile Dropdown */}
            <li className="nav-item topbar-user dropdown hidden-caret">
              <a
                className="dropdown-toggle profile-pic"
                data-bs-toggle="dropdown"
                href="#"
                aria-expanded="false"
              >
                {/* <div className="avatar-sm">
                  <img
                    src="/private/assets/img/profile.jpg"
                    alt="..."
                    className="avatar-img rounded-circle"
                  />
                </div> */}
                <span className="profile-username">
                  <span className="op-7">Hi,</span>
                  <span className="fw-bold">{user?.username}</span>
                </span>
              </a>
              <ul className="dropdown-menu dropdown-user animated fadeIn">
                <div className="dropdown-user-scroll scrollbar-outer">
                  {/* <li>
                    <div className="user-box">
                      <div className="avatar-lg">
                        <img
                          src="/private/assets/img/profile.jpg"
                          alt="image profile"
                          className="avatar-img rounded"
                        />
                      </div>
                      <div className="u-text">
                        <h4>{user?.username}</h4>
                        <p className="text-muted">{user?.email}</p>
                        <NavLink
                          to="/profile"
                          className="btn btn-xs btn-secondary btn-sm"
                        >
                          View Profile
                        </NavLink>
                      </div>
                    </div>
                  </li> */}
                  <li>
                    {/* <div className="dropdown-divider"></div>
                    <NavLink className="dropdown-item" to="/profile">
                      My Profile
                    </NavLink>
                    <NavLink className="dropdown-item" to="/balance">
                      My Balance
                    </NavLink>
                    <NavLink className="dropdown-item" to="/inbox">
                      Inbox
                    </NavLink>
                    <div className="dropdown-divider"></div>
                    <NavLink className="dropdown-item" to="/settings">
                      Account Setting
                    </NavLink>
                    <div className="dropdown-divider"></div> */}
                    <NavLink className="dropdown-item" to="/logout">
                      Logout
                    </NavLink>
                  </li>
                </div>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Header;
