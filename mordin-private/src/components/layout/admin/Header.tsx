import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

type HeaderProps = {
  pageTitle: string;
  breadcrumbs: React.ReactNode;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  onThemeToggle: () => void;
};

const Header: React.FC<HeaderProps> = ({
  pageTitle,
  breadcrumbs,
  onMenuClick,
  isSidebarOpen,
  isDarkMode,
  onThemeToggle,
}) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const displayName = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || user?.username || 'ผู้ใช้งาน';
  }, [user?.firstName, user?.lastName, user?.username]);

  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    void logout();
  };

  return (
    <header
      className={`private-layout-header mb-6 flex flex-col items-start justify-between gap-4 border-b pb-4 transition-colors lg:flex-row lg:items-center ${
        isDarkMode ? 'border-[#3D4A5F]' : 'border-[#D6D6D6]'
      }`}
    >
      <div className="flex w-full items-center gap-4 lg:w-auto">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={isSidebarOpen}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition-colors lg:hidden ${
            isDarkMode
              ? 'border-[#3D4A5F] bg-[#263247] text-[#E6EAF0] hover:bg-[#2F3B52]'
              : 'border-[#D6D6D6] bg-[#005092] text-[#F7F3EA] hover:bg-[#0A5F99]'
          }`}
        >
          <i className="fa fa-bars" />
        </button>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <h1
            className={`m-0 text-2xl font-bold uppercase ${
              isDarkMode ? 'text-[#E6EAF0]' : 'text-[#2F3A4A]'
            }`}
          >
            {pageTitle}
          </h1>
          <ul
            className={`m-0 hidden list-none items-center gap-1 p-0 text-sm sm:flex ${
              isDarkMode ? 'text-[#AEB8C8]' : 'text-[#667085]'
            }`}
          >
            {breadcrumbs}
          </ul>
        </div>
      </div>

      <div className="flex w-full items-center justify-end gap-3 lg:w-auto">
        <button
          type="button"
          onClick={onThemeToggle}
          aria-label={
            isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
          }
          className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-colors ${
            isDarkMode
              ? 'border-[#3D4A5F] bg-[#263247] text-[#B9E5F5] hover:bg-[#2F3B52]'
              : 'border-[#D6D6D6] bg-[#FFFDF8] text-[#005092] hover:bg-[#F2EEE6]'
          }`}
        >
          <i className={`fa ${isDarkMode ? 'fa-sun' : 'fa-moon'}`} />
        </button>

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(prev => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
            className={`flex max-w-[220px] cursor-pointer items-center gap-2 rounded-full border px-2.5 py-1.5 text-sm shadow-sm transition-colors sm:max-w-none ${
              isDarkMode
                ? 'border-[#3D4A5F] bg-[#263247] text-[#E6EAF0] hover:bg-[#2F3B52]'
                : 'border-[#D6D6D6] bg-[#FFFDF8] text-[#2F3A4A] hover:bg-[#F2EEE6]'
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#005092] text-sm font-bold text-[#F7F3EA]">
              {avatarInitial}
            </span>
            <span className="hidden min-w-0 max-w-[150px] truncate font-semibold sm:block">
              {displayName}
            </span>
            <i
              className={`fa fa-angle-down text-xs transition-transform ${
                isUserMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isUserMenuOpen && (
            <div
              role="menu"
              className={`private-topbar-user-menu absolute right-0 z-50 mt-2 w-56 rounded-xl border p-2 shadow-lg ${
                isDarkMode
                  ? 'border-[#3D4A5F] bg-[#263247] text-[#E6EAF0]'
                  : 'border-[#D6D6D6] bg-[#FFFDF8] text-[#2F3A4A]'
              }`}
            >
              <div
                className={`mb-1 border-b px-3 py-2 ${
                  isDarkMode ? 'border-[#3D4A5F]' : 'border-[#E8E0D4]'
                }`}
              >
                <p className="m-0 truncate text-sm font-semibold">
                  {displayName}
                </p>
                {user?.username && user.username !== displayName ? (
                  <p
                    className={`m-0 truncate text-xs ${
                      isDarkMode ? 'text-[#AEB8C8]' : 'text-[#667085]'
                    }`}
                  >
                    {user.username}
                  </p>
                ) : null}
              </div>
              <NavLink
                to="/profile"
                role="menuitem"
                onClick={() => setIsUserMenuOpen(false)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold no-underline transition-colors ${
                  isDarkMode
                    ? 'text-[#E6EAF0] hover:bg-[#2F3B52]'
                    : 'text-[#2F3A4A] hover:bg-[#F2EEE6] hover:text-[#005092]'
                }`}
              >
                <i className="fa fa-user-edit text-sm" />
                <span>จัดการโปรไฟล์</span>
              </NavLink>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className={`flex w-full items-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  isDarkMode
                    ? 'text-[#E6EAF0] hover:bg-[#2F3B52]'
                    : 'text-[#2F3A4A] hover:bg-[#F2EEE6] hover:text-[#005092]'
                }`}
              >
                <i className="fa fa-sign-out-alt text-sm" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
