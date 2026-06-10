const THEME_KEY = 'mordin-private-theme';

const widths = [72, 55, 68, 48, 75, 52, 62];

const getIsDark = () => {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark';
  } catch {
    return false;
  }
};

const light = {
  root: '#eeeeee',
  sidebar: '#ffffff',
  sidebarBorder: '#d6d6d6',
  card: '#fffdf8',
  cardBorder: '#d6d6d6',
  cardHeader: '#f2eee6',
  headerBorder: '#d6d6d6',
  text: '#2f3a4a',
  accent: 'rgba(0,80,146,0.18)',
};

const dark = {
  root: '#172033',
  sidebar: '#20293a',
  sidebarBorder: '#3d4a5f',
  card: '#20293a',
  cardBorder: '#3d4a5f',
  cardHeader: '#263247',
  headerBorder: '#3d4a5f',
  text: '#e6eaf0',
  accent: 'rgba(59,155,217,0.28)',
};

export const Loading = () => {
  const isDark = getIsDark();
  const c = isDark ? dark : light;

  return (
    <div
      className="d-flex"
      style={{ minHeight: '100vh', background: c.root, color: c.text }}
    >
      {/* Sidebar */}
      <div
        className="d-none d-lg-flex flex-column gap-2 p-4"
        style={{
          width: 260,
          background: c.sidebar,
          borderRight: `1px solid ${c.sidebarBorder}`,
          flexShrink: 0,
          color: c.text,
        }}
      >
        <div className="placeholder-glow mb-3">
          <span
            className="placeholder d-block rounded"
            style={{ height: 28, width: '65%' }}
          ></span>
        </div>
        {widths.map((w, i) => (
          <div key={i} className="placeholder-glow">
            <span
              className="placeholder d-block rounded"
              style={{ height: 14, width: `${w}%` }}
            ></span>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-grow-1" style={{ padding: '2.5rem' }}>
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between mb-5"
          style={{ borderBottom: `1px solid ${c.headerBorder}`, paddingBottom: '1rem' }}
        >
          <div className="placeholder-glow" style={{ width: 180 }}>
            <span
              className="placeholder d-block rounded"
              style={{ height: 28, width: '100%' }}
            ></span>
          </div>
          <div className="placeholder-glow" style={{ width: 110 }}>
            <span
              className="placeholder d-block rounded"
              style={{ height: 36, width: '100%' }}
            ></span>
          </div>
        </div>

        {/* KPI cards */}
        <div className="row g-3 mb-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="col-sm-6 col-lg-3">
              <div
                style={{
                  background: c.card,
                  border: `1px solid ${c.cardBorder}`,
                  borderLeft: `4px solid ${c.accent}`,
                  borderRadius: 8,
                  color: c.text,
                }}
              >
                <div className="card-body py-3 px-4">
                  <div className="placeholder-glow mb-2">
                    <span
                      className="placeholder d-block rounded"
                      style={{ height: 11, width: '65%' }}
                    ></span>
                  </div>
                  <div className="placeholder-glow">
                    <span
                      className="placeholder d-block rounded"
                      style={{ height: 32, width: '45%' }}
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content card */}
        <div
          style={{
            background: c.card,
            border: `1px solid ${c.cardBorder}`,
            borderRadius: 8,
            color: c.text,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: c.cardHeader,
              borderBottom: `1px solid ${c.cardBorder}`,
              padding: '0.75rem 1.25rem',
            }}
          >
            <div className="placeholder-glow" style={{ width: 200 }}>
              <span
                className="placeholder d-block rounded"
                style={{ height: 20, width: '100%' }}
              ></span>
            </div>
          </div>
          <div style={{ padding: '1.25rem' }}>
            {[80, 65, 72, 55, 68, 75].map((w, i) => (
              <div key={i} className="placeholder-glow mb-3">
                <span
                  className="placeholder d-block rounded"
                  style={{ height: 14, width: `${w}%` }}
                ></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
