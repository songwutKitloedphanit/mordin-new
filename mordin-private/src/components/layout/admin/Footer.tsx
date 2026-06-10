const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="private-layout-footer border-t border-[#DED7CC] bg-[#FFFDF8] px-6 py-4 text-sm text-[#667085] transition-colors lg:px-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav>
          <ul className="m-0 flex list-none flex-wrap items-center gap-4 p-0">
            <li>
              <a
                className="font-semibold text-[#005092] no-underline hover:text-[#0A5F99]"
                href="https://www.mitrphol.com/home"
                target="_blank"
                rel="noopener noreferrer"
              >
                MITR PHOL
              </a>
            </li>
            <li>
              <a
                className="font-semibold text-[#005092] no-underline hover:text-[#0A5F99]"
                href="https://www.mitrphol.com/research.php"
                target="_blank"
                rel="noopener noreferrer"
              >
                MITR PHOL RESEARCH
              </a>
            </li>
          </ul>
        </nav>
        <div>
          {currentYear}, made with <i className="fa fa-heart text-red-600"></i>{' '}
          by
          <a
            className="text-[#005092] no-underline hover:text-[#0A5F99]"
            href="http://www.mitrphol.com"
          >
            {' '}
            MITR PHOL-SOIL RESEARCH
          </a>
        </div>
        <div>
          Distributed by
          <a
            className="text-[#005092] no-underline hover:text-[#0A5F99]"
            target="_blank"
            href="http://www.mitrphol.com"
            rel="noopener noreferrer"
          >
            {' '}
            MITR PHOL-SOIL RESEARCH
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
