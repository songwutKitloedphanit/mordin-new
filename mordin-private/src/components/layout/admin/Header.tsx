import React from 'react';

type HeaderProps = {
  breadcrumbs: React.ReactNode;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  onThemeToggle: () => void;
};

const Header: React.FC<HeaderProps> = ({
  breadcrumbs,
  onMenuClick,
  isSidebarOpen,
  isDarkMode,
  onThemeToggle,
}) => {
  return (
    <header
      className={`private-layout-header sticky top-0 z-40 flex h-[60px] shrink-0 items-center gap-3 border-b px-4 transition-colors lg:px-[26px] ${
        isDarkMode
          ? 'border-[#3D4A5F] bg-[#20293a]'
          : 'border-[#e6eaf0] bg-white'
      }`}
    >
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isSidebarOpen}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border transition-colors lg:hidden ${
          isDarkMode
            ? 'border-[#3D4A5F] bg-[#263247] text-[#E6EAF0] hover:bg-[#2F3B52]'
            : 'border-[#e6eaf0] bg-white text-[#51637a] hover:bg-[#f3f5f8]'
        }`}
      >
        <i className="fa fa-bars" />
      </button>

      {/* Breadcrumb — compact, current page bold (mockup .crumb) */}
      <ul
        className={`m-0 hidden min-w-0 list-none items-center gap-1 p-0 text-[12.5px] sm:flex ${
          isDarkMode ? 'text-[#AEB8C8]' : 'text-[#8b9bae]'
        }`}
      >
        {breadcrumbs}
      </ul>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onThemeToggle}
          aria-label={
            isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
          }
          className={`flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-[10px] border transition-colors ${
            isDarkMode
              ? 'border-[#3D4A5F] bg-[#263247] text-[#B9E5F5] hover:bg-[#2F3B52]'
              : 'border-[#e6eaf0] bg-white text-[#51637a] hover:bg-[#f3f5f8]'
          }`}
        >
          <i className={`fa ${isDarkMode ? 'fa-sun' : 'fa-moon'}`} />
        </button>
      </div>
    </header>
  );
};

export default Header;
