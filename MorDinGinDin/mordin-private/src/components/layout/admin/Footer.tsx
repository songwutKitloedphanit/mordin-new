const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container-fluid d-flex justify-content-between">
        <nav className="pull-left">
          <ul className="nav">
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://www.mitrphol.com/home"
                target="_blank"
                rel="noopener noreferrer"
              >
                MITR PHOL
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://www.mitrphol.com/research.php"
                target="_blank"
                rel="noopener noreferrer"
              >
                MITR PHOL RESEARCH
              </a>
            </li>
          </ul>
        </nav>
        <div className="copyright">
          {currentYear}, made with{' '}
          <i className="fa fa-heart heart text-danger"></i> by
          <a href="http://www.mitrphol.com"> MITR PHOL-SOIL RESEARCH</a>
        </div>
        <div>
          Distributed by
          <a
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
