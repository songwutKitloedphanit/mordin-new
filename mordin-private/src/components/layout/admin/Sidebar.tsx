import React, { useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/User';
import { DASHBOARD_URL } from '@/utils/RoleToURL';

type SubItem = {
  to: string;
  label: string;
  icon: string;
  allowedRoles: UserRole[];
};

type NavGroup = {
  key: string;
  title: string;
  items: SubItem[];
};

type SidebarProps = {
  isOpen: boolean;
  isDarkMode: boolean;
  onClose: () => void;
};

const ADMIN_ROLES = [UserRole.Admin];
const STAFF_ROLES = [UserRole.Admin, UserRole.Staff];
const EXECUTIVE_ROLES = [UserRole.Admin, UserRole.Staff, UserRole.Executive];

const NAV_GROUPS: NavGroup[] = [
  {
    key: 'home',
    title: 'หน้าหลัก',
    items: [
      {
        to: DASHBOARD_URL,
        label: 'แดชบอร์ด',
        icon: 'fas fa-chart-pie',
        allowedRoles: EXECUTIVE_ROLES,
      },
      {
        to: '/executive/report',
        label: 'รายงานผู้บริหาร',
        icon: 'fas fa-chart-bar',
        allowedRoles: EXECUTIVE_ROLES,
      },
    ],
  },
  {
    key: 'management',
    title: 'การจัดการข้อมูล',
    items: [
      {
        to: '/admin/user',
        label: 'ผู้ใช้งานระบบ',
        icon: 'fas fa-users',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/farmer',
        label: 'ชาวไร่',
        icon: 'fas fa-seedling',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/bus',
        label: 'รถบัส',
        icon: 'fas fa-bus',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/shop',
        label: 'ร้านค้า',
        icon: 'fas fa-store',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/land',
        label: 'แปลงที่ดิน',
        icon: 'fas fa-map',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/laboratory',
        label: 'ห้องปฏิบัติการ',
        icon: 'fas fa-flask',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/service-area',
        label: 'โรงงาน & เขตส่งเสริม',
        icon: 'fas fa-industry',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/qrcode',
        label: 'QR Code',
        icon: 'fas fa-qrcode',
        allowedRoles: ADMIN_ROLES,
      },
    ],
  },
  {
    key: 'operations',
    title: 'งานปฏิบัติการ',
    items: [
      {
        to: '/officer/qrcode-officer',
        label: 'สร้าง QR Code',
        icon: 'fas fa-qrcode',
        allowedRoles: STAFF_ROLES,
      },
      {
        to: '/officer/sample-receiving',
        label: 'รับตัวอย่างดิน',
        icon: 'fas fa-box-open',
        allowedRoles: STAFF_ROLES,
      },
      {
        to: '/officer/lab-result',
        label: 'บันทึกผลแล็บ',
        icon: 'fas fa-vial',
        allowedRoles: STAFF_ROLES,
      },
      {
        to: '/officer/analysis-report',
        label: 'รายงานวิเคราะห์',
        icon: 'fas fa-file-alt',
        allowedRoles: STAFF_ROLES,
      },
    ],
  },
  {
    key: 'system-settings',
    title: 'ตั้งค่าระบบ',
    // จัดเรียงแบบ Operation-First: เรียงตามความถี่การใช้งานจริง (ใช้บ่อยสุดอยู่บนสุด)
    items: [
      {
        to: '/admin/service-calendar',
        label: 'ปฏิทินรอบบริการ',
        icon: 'fas fa-calendar-alt',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/fertilizer-usages',
        label: 'สูตรการใช้ปุ๋ย',
        icon: 'fas fa-leaf',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/fertilizer-prices',
        label: 'ราคาปุ๋ย',
        icon: 'fas fa-tag',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/officer/analysis-setting',
        label: 'ตั้งค่าการวิเคราะห์',
        icon: 'fas fa-cogs',
        allowedRoles: STAFF_ROLES,
      },
      {
        to: '/admin/service-type',
        label: 'ประเภทบริการ',
        icon: 'fas fa-tags',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/standard',
        label: 'เกณฑ์มาตรฐาน',
        icon: 'fas fa-clipboard-check',
        allowedRoles: ADMIN_ROLES,
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isDarkMode, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const userRole = user?.role;

  const displayName = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || user?.username || 'ผู้ใช้งาน';
  }, [user?.firstName, user?.lastName, user?.username]);

  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'U';

  const canSeeItem = useCallback(
    (item: SubItem) =>
      Boolean(userRole && item.allowedRoles.includes(userRole)),
    [userRole]
  );

  const isRouteMatch = useCallback(
    (to: string) =>
      location.pathname === to || location.pathname.startsWith(`${to}/`),
    [location.pathname]
  );

  const visibleGroups = useMemo(
    () =>
      NAV_GROUPS.map(group => ({
        ...group,
        items: group.items.filter(canSeeItem),
      })).filter(group => group.items.length > 0),
    [canSeeItem]
  );

  const groupLabelClasses = isDarkMode
    ? 'px-3 pb-1.5 pt-4 text-[11px] font-bold uppercase tracking-[1.2px] text-[#5E7493]'
    : 'px-3 pb-1.5 pt-4 text-[11px] font-bold uppercase tracking-[1.2px] text-[#8FC0E6]';

  const itemClasses = (active: boolean) => {
    if (active) {
      return isDarkMode
        ? 'relative flex items-center gap-2.5 rounded-xl bg-[#005092] px-3 py-2.5 text-[14px] font-bold text-white no-underline shadow-sm'
        : 'relative flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-[14px] font-bold text-[#005092] no-underline shadow-md';
    }
    return isDarkMode
      ? 'relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-medium text-[#8FAFC8] no-underline transition-colors hover:bg-[#243350] hover:text-[#D0E8F5]'
      : 'relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-medium text-[#CCE4F7] no-underline transition-colors hover:bg-white/10 hover:text-white';
  };

  const sidebarBg = isDarkMode
    ? 'bg-[#172033] border-r border-[#2A3850]'
    : 'bg-gradient-to-b from-[#005A9E] via-[#005092] to-[#00396A]';
  const sidebarPosition = isOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <aside
      className={`private-layout-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] min-w-[260px] transform flex-col shadow-2xl transition-[transform,background-color] duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none ${sidebarBg} ${sidebarPosition}`}
    >
      {/* Logo */}
      <div
        className={`flex items-center justify-between px-4 py-4 ${
          isDarkMode ? 'border-b border-[#2A3850]' : 'border-b border-white/15'
        }`}
      >
        <NavLink
          to={DASHBOARD_URL}
          className="flex min-w-0 items-center gap-2.5 no-underline"
        >
          <img
            src="/private/assets/img/logo-mitr-phol-white.png"
            alt="MITR PHOL Research"
            className="h-10 w-auto object-contain"
          />
        </NavLink>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className={`flex h-11 w-11 items-center justify-center rounded-lg border-0 bg-transparent transition-colors lg:hidden ${
            isDarkMode
              ? 'text-[#8FAFC8] hover:bg-[#243350] hover:text-[#E6EAF0]'
              : 'text-white/70 hover:bg-white/15 hover:text-white'
          }`}
        >
          <i className="fas fa-times text-lg" />
        </button>
      </div>

      {/* Nav — flat groups, every menu visible without extra clicks */}
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4 pt-1">
        {visibleGroups.map(group => (
          <div key={group.key}>
            <div className={groupLabelClasses}>{group.title}</div>
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {group.items.map(item => {
                const active = isRouteMatch(item.to);
                return (
                  <li key={item.to} className="list-none">
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={itemClasses(active)}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute -left-3 bottom-1.5 top-1.5 w-1 rounded-r bg-[#FFD45E]"
                        />
                      )}
                      <i
                        className={`${item.icon} w-[18px] text-center text-[13px] ${
                          active ? 'opacity-100' : 'opacity-75'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer (sb-foot) */}
      <div
        className={`mt-auto flex items-center gap-2.5 px-4 py-3.5 border-t ${
          isDarkMode
            ? 'border-[#2A3850] bg-[#1a253b]'
            : 'border-white/14 bg-black/15'
        }`}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold"
          style={{ color: '#005092' }}
        >
          {avatarInitial}
        </div>
        <div className="min-w-0 flex-1 leading-normal">
          <div className="truncate text-[13px] font-bold text-white">
            {displayName}
          </div>
          <div className="truncate text-[11px] text-white/60">
            {userRole === UserRole.Admin
              ? 'ผู้ดูแลระบบ'
              : userRole === UserRole.Staff
                ? 'เจ้าหน้าที่'
                : 'ผู้บริหาร'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          title="ออกจากระบบ"
          className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-[#9cc6e8] hover:bg-white/10 hover:text-white transition-colors"
        >
          <i className="fas fa-right-from-bracket" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
