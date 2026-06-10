export const GenCard1Skeleton = () => (
  <div className="col-sm-6 col-lg-3">
    <div className="card p-3">
      <div className="d-flex align-items-center">
        <span className="stamp stamp-md bg-secondary me-3" style={{ opacity: 0.15 }}>
          <i className="fa fa-circle"></i>
        </span>
        <div className="flex-grow-1">
          <div className="placeholder-glow mb-2">
            <span className="placeholder col-5 d-block rounded" style={{ height: 18 }}></span>
          </div>
          <div className="placeholder-glow">
            <span className="placeholder col-8 d-block rounded" style={{ height: 12 }}></span>
          </div>
        </div>
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
              <span className="placeholder col-7 rounded" style={{ height: 14 }}></span>
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
                  style={{ height: 14, width: `${50 + ((r + c) * 13) % 40}%` }}
                ></span>
              </div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
