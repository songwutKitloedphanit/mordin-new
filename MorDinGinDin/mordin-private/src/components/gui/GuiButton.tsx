/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { NavLink } from 'react-router-dom';

// ข้อมูลปุ่มทั้งหมดจาก gui_button.php
export const B_LIST = {
  add: { color: 'btn-success', icon: 'fa fa-plus', link: '#' },
  list: { color: 'btn-primary', icon: 'fas fa-clipboard-list', link: '#' },
  position: {
    color: 'btn-info',
    icon: 'fas fa-id-card',
    link: './user-dept.php',
  },
  department: { color: 'btn-secondary', icon: 'fas fa-building', link: '#' },
  land: { color: 'btn-info', icon: 'fas fa-map-marked', link: '#' },
  farmer: { color: 'btn-info', icon: 'fas fa-user', link: '#' },
  'farmer-add': {
    color: 'btn-primary',
    icon: 'fas fa-user-plus',
    link: './farmer-add.php',
  },
  info: { color: 'btn-info', icon: 'fa fa-info', link: '#' },
  edit: { color: 'btn-warning text-white', icon: 'fas fa-edit', link: '#' },
  del: { color: 'btn-danger', icon: 'fa fa-trash', link: '#' },
  line: { color: 'btn-success', icon: 'fab fa-line', link: '#' },
  fb: { color: 'btn-info', icon: 'fab fa-facebook-square', link: '#' },
  location: { color: 'btn-primary', icon: 'fas fa-map-marker-alt', link: '#' },
  image: { color: 'btn-success', icon: 'fa fa-image', link: '#' },
  eye: { color: 'btn-primary', icon: 'fa fa-eye', link: '#' },
  eyeClose: { color: 'btn-primary', icon: 'fa fa-eye-slash', link: '#' },
  print: { color: 'btn-primary', icon: 'fas fa-print', link: '#' },
};

// ฟังก์ชัน GenCard1
export const GenCard1: React.FC<{
  color: string;
  icon: string;
  num: string | number;
  name: string;
  desc: string;
}> = ({ color, icon, num, name, desc }) => (
  <div className="col-sm-6 col-lg-3">
    <div className="card p-3">
      <div className="d-flex align-items-center">
        <span className={`stamp stamp-md ${color} me-3`}>
          <i className={icon}></i>
        </span>
        <div>
          <h5 className="mb-1">
            <b>
              <a href="#">
                {num} <small>{name}</small>
              </a>
            </b>
          </h5>
          <small className="text-muted">{desc}</small>
        </div>
      </div>
    </div>
  </div>
);

// ฟังก์ชัน GenButtonCircle
export const GenButtonCircle: React.FC<{
  color?: string;
  icon?: string;
  link?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  isExternal?: boolean; // เพิ่ม prop สำหรับลิงก์ภายนอก
}> = ({ color, icon, link, className, onClick, children, isExternal }) => {
  const buttonClass =
    `btn btn-icon btn-round ${color || ''} ${className || ''}`.trim();

  if (link) {
    // ถ้าเป็น external link ใช้ <a> tag แทน NavLink
    if (isExternal) {
      return (
        <a href={link} className={buttonClass} target="_blank" rel="noopener noreferrer">
          {icon && <i className={icon}></i>}
          {children}
        </a>
      );
    }

    // Internal link ใช้ NavLink
    return (
      <NavLink to={link} className={buttonClass}>
        {icon && <i className={icon}></i>}
        {children}
      </NavLink>
    );
  }

  return (
    <button type="button" className={buttonClass} onClick={onClick}>
      {icon && <i className={icon}></i>}
      {children}
    </button>
  );
};

export const GenButtonSquare: React.FC<{
  changeIndex: React.Dispatch<React.SetStateAction<number>>;
  names?: string[];
  currentIndex: number;
}> = ({ changeIndex, names, currentIndex }) => {
  return (
    <div className="row mb-4">
      <div className="col-md-12 col-sm-12 col-12">
        <div className="card-tools">
          <ul
            className="nav nav-pills nav-secondary"
            id="pills-tab"
            role="tablist"
          >
            {names?.map((name, index) => (
              <li
                key={index}
                className="nav-item"
                role="presentation"
                onClick={() => changeIndex(index)}
              >
                <a
                  className={`nav-link ${index === currentIndex ? 'active' : ''}`}
                  id={`pills-tab-${index}`}
                  data-bs-toggle="pill"
                  href="#"
                  role="tab"
                  aria-selected={index === currentIndex}
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
