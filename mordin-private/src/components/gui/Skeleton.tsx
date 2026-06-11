export const GenCard1Skeleton = () => (
  <div className="col-sm-6 col-lg-3 mb-3">
    <div className="exec-kpi-card-skeleton h-100">
      <div className="placeholder-glow mb-3">
        <span
          className="placeholder d-block rounded"
          style={{ height: 13, width: '58%' }}
        ></span>
      </div>
      <div className="placeholder-glow">
        <span
          className="placeholder d-block rounded"
          style={{ height: 42, width: '46%' }}
        ></span>
      </div>
    </div>
  </div>
);

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export const TableSkeleton = ({ rows = 5, cols = 5 }: TableSkeletonProps) => (
  <table className="table">
    <thead>
      <tr>
        {Array.from({ length: cols }).map((_, i) => (
          <th key={i}>
            <div className="placeholder-glow">
              <span
                className="placeholder col-7 rounded"
                style={{ height: 14 }}
              ></span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c}>
              <div className="placeholder-glow">
                <span
                  className="placeholder rounded"
                  style={{
                    height: 14,
                    width: `${50 + (((r + c) * 13) % 40)}%`,
                  }}
                ></span>
              </div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
