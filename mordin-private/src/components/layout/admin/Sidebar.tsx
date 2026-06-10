import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/User';
import { DASHBOARD_URL } from '@/utils/RoleToURL';

type GroupKey = 'home' | 'management' | 'operations' | 'system-settings';

type SubItem = {
  to: string;
  label: string;
  icon: string;
  allowedRoles: UserRole[];
};

type NavGroup = {
  key: GroupKey;
  title: string;
  icon: string;
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
    title: 'HOME',
    icon: 'fas fa-home',
    items: [
      {
        to: DASHBOARD_URL,
        label: 'DASHBOARD',
        icon: 'fas fa-chart-line',
        allowedRoles: EXECUTIVE_ROLES,
      },
      {
        to: '/executive/report',
        label: 'REPORT',
        icon: 'fas fa-chart-bar',
        allowedRoles: EXECUTIVE_ROLES,
      },
    ],
  },
  {
    key: 'management',
    title: 'MANAGEMENT',
    icon: 'fas fa-layer-group',
    items: [
      {
        to: '/admin/user',
        label: 'USER',
        icon: 'fas fa-users',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/farmer',
        label: 'FARMER',
        icon: 'fas fa-seedling',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/bus',
        label: 'BUS',
        icon: 'fas fa-bus',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/shop',
        label: 'SHOP',
        icon: 'fas fa-store',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/land',
        label: 'LAND',
        icon: 'fas fa-map',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/laboratory',
        label: 'LABORATORIES',
        icon: 'fas fa-flask',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/service-area',
        label: 'FACTORIES & ZONES',
        icon: 'fas fa-map-marker-alt',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/qrcode',
        label: 'QRCODE',
        icon: 'fas fa-qrcode',
        allowedRoles: ADMIN_ROLES,
      },
    ],
  },
  {
    key: 'operations',
    title: 'OPERATIONS',
    icon: 'fas fa-tasks',
    items: [
      {
        to: '/officer/qrcode-officer',
        label: 'QRCODE CREATE',
        icon: 'fas fa-qrcode',
        allowedRoles: STAFF_ROLES,
      },
      {
        to: '/officer/sample-receiving',
        label: 'SAMPLE RECEIVING',
        icon: 'fas fa-box-open',
        allowedRoles: STAFF_ROLES,
      },
      {
        to: '/officer/lab-result',
        label: 'LAB RESULT',
        icon: 'fas fa-vial',
        allowedRoles: STAFF_ROLES,
      },
      {
        to: '/officer/analysis-report',
        label: 'ANALYSIS REPORT',
        icon: 'fas fa-file-alt',
        allowedRoles: STAFF_ROLES,
      },
    ],
  },
  {
    key: 'system-settings',
    title: 'SYSTEM SETTINGS',
    icon: 'fas fa-sliders-h',
    // จัดเรียงแบบ Operation-First: เรียงตามความถี่การใช้งานจริง (ใช้บ่อยสุดอยู่บนสุด)
    items: [
      // ใช้บ่อย: เปิดดู/บันทึกตามรอบงานประจำ
      {
        to: '/admin/service-calendar',
        label: 'SERVICE CALENDARS',
        icon: 'fas fa-calendar-alt',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/fertilizer-usages',
        label: 'FERTILIZER USAGES',
        icon: 'fas fa-leaf',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/fertilizer-prices',
        label: 'FERTILIZER PRICES',
        icon: 'fas fa-tag',
        allowedRoles: ADMIN_ROLES,
      },
      // ปรับเป็นครั้งคราว: เปลี่ยนตามฤดูกาล
      {
        to: '/officer/analysis-setting',
        label: 'ANALYSIS SETTING',
        icon: 'fas fa-cogs',
        allowedRoles: STAFF_ROLES,
      },
      // ตั้งค่าครั้งแรก / แทบไม่เปลี่ยนทั้งปี
      {
        to: '/admin/service-type',
        label: 'SERVICE TYPES',
        icon: 'fas fa-tags',
        allowedRoles: ADMIN_ROLES,
      },
      {
        to: '/admin/standard',
        label: 'STANDARDS',
        icon: 'fas fa-clipboard-check',
        allowedRoles: ADMIN_ROLES,
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isDarkMode, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role;

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

  const routeActiveGroup = useMemo(
    () =>
      visibleGroups.find(group =>
        group.items.some(item => isRouteMatch(item.to))
      )?.key ?? null,
    [isRouteMatch, visibleGroups]
  );

  const [openGroup, setOpenGroup] = useState<GroupKey | null>(routeActiveGroup);
  const [hasManualOpenGroup, setHasManualOpenGroup] = useState(false);

  useEffect(() => {
    if (!hasManualOpenGroup && routeActiveGroup) {
      setOpenGroup(routeActiveGroup);
    }
  }, [hasManualOpenGroup, routeActiveGroup]);

  const toggleGroup = (key: GroupKey) => {
    setHasManualOpenGroup(true);
    setOpenGroup(prev => (prev === key ? null : key));
  };

  const renderGroup = (group: NavGroup) => {
    const { key, title, icon, items } = group;
    const isOpenGroup = openGroup === key;

    const groupBg = isOpenGroup
      ? isDarkMode
        ? 'bg-[#1A2740]'
        : 'bg-[#F0F7FF]'
      : 'bg-transparent';

    const titleTextColor = isOpenGroup
      ? isDarkMode
        ? 'text-[#B9E5F5]'
        : 'text-[#005092]'
      : isDarkMode
        ? 'text-[#C8D6E8] hover:text-[#E6EAF0]'
        : 'text-[#CCE4F7] hover:text-white';

    const titleClasses = `flex w-full cursor-pointer appearance-none items-center justify-between border-0 bg-transparent px-4 py-4 text-left font-sans text-[15px] font-bold uppercase tracking-wide transition-colors ${titleTextColor}`;

    const submenuRowClasses = `grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
      isOpenGroup
        ? 'grid-rows-[1fr] opacity-100'
        : 'grid-rows-[0fr] opacity-0 pointer-events-none'
    }`;

    return (
      <li className="list-none w-full mb-1" key={key}>
        <div
          className={`overflow-hidden rounded-2xl transition-colors duration-300 ${groupBg}`}
        >
          <button
            type="button"
            onClick={() => toggleGroup(key)}
            aria-expanded={isOpenGroup}
            className={titleClasses}
          >
            <span className="flex items-center gap-2.5">
              <i className={`${icon} w-4 text-center text-[15px] opacity-80`} />
              <span>{title}</span>
            </span>
            <i
              className={`fas fa-chevron-right text-[14px] opacity-60 transition-transform duration-300 ${
                isOpenGroup ? 'rotate-90' : ''
              }`}
            />
          </button>

          <div className={submenuRowClasses}>
            <div className="min-h-0 overflow-hidden">
              <ul className="m-0 flex list-none flex-col gap-0.5 px-3 pb-3 pt-0.5">
                {items.map(item => (
                  <li key={item.to} className="list-none">
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={() => {
                        const active = isRouteMatch(item.to);
                        if (active) {
                          return isDarkMode
                            ? 'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-bold no-underline bg-[#005092] text-[#E6EAF0] shadow-sm'
                            : 'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-bold no-underline bg-[#005092] text-white shadow-sm';
                        }
                        return isDarkMode
                          ? 'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-semibold no-underline text-[#8FAFC8] hover:bg-[#243350] hover:text-[#D0E8F5] transition-colors'
                          : 'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-semibold no-underline text-[#3D7CB5] hover:bg-[#D6EDFA] hover:text-[#005092] transition-colors';
                      }}
                    >
                      <i
                        className={`${item.icon} w-4 text-center text-[13px] opacity-70`}
                      />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {!isOpenGroup && (
          <div
            className={`mx-4 border-b ${
              isDarkMode ? 'border-[#2A3850]' : 'border-white/20'
            }`}
          />
        )}
      </li>
    );
  };

  const sidebarBg = isDarkMode ? 'bg-[#172033]' : 'bg-[#005092]';
  const sidebarPosition = isOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <aside
      className={`private-layout-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] min-w-[260px] transform flex-col shadow-2xl transition-[transform,background-color] duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none ${sidebarBg} ${sidebarPosition}`}
    >
      {/* Logo */}
      <div
        className={`flex items-center justify-between px-5 py-5 ${
          isDarkMode ? 'border-b border-[#2A3850]' : 'border-b border-white/15'
        }`}
      >
        <NavLink
          to={DASHBOARD_URL}
          className="flex items-center gap-2.5 no-underline"
        >
          <img
            src="/private/assets/img/mitrphol_research.webp"
            alt="MITR PHOL Research"
            height={80}
            className="h-20 w-auto object-contain rounded-lg bg-white px-3 py-1.5"
          />
        </NavLink>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className={`rounded-lg border-0 bg-transparent p-1.5 transition-colors lg:hidden ${
            isDarkMode
              ? 'text-[#8FAFC8] hover:bg-[#243350] hover:text-[#E6EAF0]'
              : 'text-white/70 hover:bg-white/15 hover:text-white'
          }`}
        >
          <i className="fas fa-times text-lg" />
        </button>
      </div>

      {/* Nav */}
      <ul className="m-0 flex-1 list-none overflow-y-auto px-3 py-3 no-scrollbar">
        {visibleGroups.map(group => renderGroup(group))}
      </ul>
    </aside>
  );
};

export default Sidebar;
