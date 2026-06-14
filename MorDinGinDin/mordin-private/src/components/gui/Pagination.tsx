import React, { useMemo } from 'react';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ page, totalPages, onPageChange }) => {
  // จำนวนหน้ารอบตัวเลขปัจจุบัน
  const delta = 2;

  // คำนวณ array ของเลขหน้า + ellipsis
  const pages = useMemo<(number | string)[]>(() => {
    const range: (number | string)[] = [];

    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    // แถวแรกคือหน้า 1 เสมอ
    range.push(1);

    // ถ้าหน้าซ้ายสุดห่างจาก 2 มาก ให้ใส่ '...'
    if (left > 2) {
      range.push('...');
    }

    // ใส่เลขระหว่างหน้า
    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    // ถ้าหน้าขวาสุดห่างจาก totalPages-1 มาก ให้ใส่ '...'
    if (right < totalPages - 1) {
      range.push('...');
    }

    // ใส่หน้า totalPages (ถ้ามากกว่า 1)
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  }, [page, totalPages]);

  return (
    <nav>
      <ul className="pagination mb-0">
        {/* First */}
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(1)}
          >
            &laquo;
          </button>
        </li>

        {/* Prev */}
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(page - 1)}
          >
            &lsaquo;
          </button>
        </li>

        {/* Pages */}
        {pages.map((p, idx) => (
          <li
            // eslint-disable-next-line react-x/no-array-index-key
            key={idx}
            className={`page-item ${p === page ? 'active' : ''} ${p === '...' ? 'disabled' : ''}`}
          >
            <button
              type="button"
              className="page-link"
              onClick={() => typeof p === 'number' && onPageChange(p)}
            >
              {p}
            </button>
          </li>
        ))}

        {/* Next */}
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(page + 1)}
          >
            &rsaquo;
          </button>
        </li>

        {/* Last */}
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(totalPages)}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
