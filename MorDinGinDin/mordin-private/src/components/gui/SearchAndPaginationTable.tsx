import React, { useState, useEffect, useMemo } from 'react';
import '../../../public/assets/css/SearchAndPaginationTable.css';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
}

interface FetchParams {
  search: string;
  page: number;
  limit: number;
  sortBy: string;
  order: 'ASC' | 'DESC';
}

interface FetchResult<T> {
  data: T[];
  total: number;
  totalPages: number;
}

interface Props<T> {
  columns: Column<T>[];
  fetchData: (params: FetchParams) => Promise<FetchResult<T>>;
  initialLimit?: number;
  limitOptions?: number[];
  initialSortBy?: string;
  initialOrder?: 'ASC' | 'DESC';
}

const DEFAULT_LIMIT_OPTIONS = [10, 25, 50, 100];

function SearchAndPaginationTable<T extends object>({
  columns,
  fetchData,
  initialLimit = 10,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  initialSortBy = '',
  initialOrder = 'ASC',
}: Props<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [order, setOrder] = useState(initialOrder);
  const [data, setData] = useState<T[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // per-column filter state keyed by column index
  const [columnFilters, setColumnFilters] = useState<Record<number, string>>(
    {}
  );

  // fetch page data from server
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const q: Partial<FetchParams> = { page, limit, order };
        if (search.trim()) q.search = search.trim();
        if (sortBy) q.sortBy = sortBy;
        const res = await fetchData(q as FetchParams);
        setData(res.data);
        setTotalEntries(res.total);
        setTotalPages(res.totalPages);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, page, limit, sortBy, order, fetchData]);

  // compute unique dropdown options for each column from this page's data
  const columnOptions = useMemo(() => {
    const opts: Record<number, string[]> = {};
    columns.forEach((col, idx) => {
      const setVals = new Set<string>();
      data.forEach(row => {
        let txt = '';
        if (typeof col.accessor === 'function') {
          const cell = col.accessor(row);
          if (typeof cell === 'string' || typeof cell === 'number') {
            txt = String(cell).trim();
          }
        } else {
          const cell = row[col.accessor];
          txt = cell != null ? String(cell).trim() : '';
        }
        if (txt) setVals.add(txt);
      });
      opts[idx] = Array.from(setVals).sort();
    });
    return opts;
  }, [data, columns]);

  // filter the loaded page's data by selected column dropdowns
  const filteredData = useMemo(() => {
    return data.filter(row =>
      columns.every((col, idx) => {
        const val = columnFilters[idx];
        if (!val) return true;
        let txt = '';
        if (typeof col.accessor === 'function') {
          const cell = col.accessor(row);
          if (typeof cell === 'string' || typeof cell === 'number') {
            txt = String(cell);
          }
        } else {
          const cell = row[col.accessor];
          txt = cell != null ? String(cell) : '';
        }
        return txt === val;
      })
    );
  }, [data, columns, columnFilters]);

  // sorting logic unchanged
  const handleSort = (col: Column<T>) => {
    const key =
      typeof col.accessor === 'string' ? col.accessor : col.sortKey || '';
    if (!key) return;
    if (sortBy === key) {
      setOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
      if (order === 'DESC') {
        setSortBy('');
        setOrder('ASC');
      }
    } else {
      setSortBy(key);
      setOrder('ASC');
    }
    setPage(1);
  };

  const startEntry = totalEntries > 0 ? (page - 1) * limit + 1 : 0;
  const endEntry = Math.min(page * limit, totalEntries);

  const pages = useMemo<(number | string)[]>(() => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);
    return range;
  }, [page, totalPages]);

  return (
    <div>
      <div className="card-body">
        {/* top controls */}
        <div className="d-flex mb-3 align-items-center">
          <label className="me-2">Show</label>
          <select
            className="form-select w-auto me-3"
            value={limit}
            onChange={e => {
              setLimit(+e.target.value);
              setPage(1);
            }}
          >
            {limitOptions.map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-control ms-auto w-auto"
            placeholder="Search..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* table */}
        <div className="table-responsive">
          <table className="table table-striped table-hover dataTable">
            <thead>
              <tr>
                {columns.map((col, idx) => {
                  const key =
                    typeof col.accessor === 'string'
                      ? col.accessor
                      : col.sortKey;
                  const isSorted = key === sortBy;
                  const thClass = [
                    col.sortable
                      ? 'dt-orderable dt-orderable-asc dt-orderable-desc'
                      : '',
                    isSorted ? `dt-ordering-${order.toLowerCase()}` : '',
                  ].join(' ');
                  return (
                    <th
                      // eslint-disable-next-line react-x/no-array-index-key
                      key={idx}
                      className={thClass}
                      onClick={() => col.sortable && handleSort(col)}
                      style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                    >
                      <div className="dt-column-header">
                        <span className="dt-column-title">{col.header}</span>
                        {col.sortable && <span className="dt-column-order" />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  // eslint-disable-next-line react-x/no-array-index-key
                  <tr key={i}>
                    {columns.map(col => (
                      <td key={col.header}>
                        {typeof col.accessor === 'function'
                          ? col.accessor(row)
                          : (row[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center">
                    ไม่มีข้อมูลในตาราง
                  </td>
                </tr>
              )}
            </tbody>

            {/* footer filters */}
            <tfoot>
              <tr>
                {columns.map((col, idx) => {
                  const opts = columnOptions[idx] || [];
                  if (opts.length === 0) {
                    return <th key={col.header}></th>;
                  }
                  return (
                    <th key={col.header}>
                      <select
                        className="form-select form-select-sm"
                        value={columnFilters[idx] || ''}
                        onChange={e => {
                          setColumnFilters(prev => ({
                            ...prev,
                            [idx]: e.target.value,
                          }));
                          //setPage(1);
                        }}
                      >
                        <option value="">All</option>
                        {opts.map(val => (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        ))}
                      </select>
                    </th>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Showing {startEntry} to {endEntry} of {totalEntries} entries
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPage(1)}
                >
                  &laquo;
                </button>
              </li>
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPage(page - 1)}
                >
                  &lsaquo;
                </button>
              </li>
              {pages.map((p, idx) => (
                <li
                  // eslint-disable-next-line react-x/no-array-index-key
                  key={idx}
                  className={`page-item ${
                    p === page ? 'active' : ''
                  } ${p === '...' ? 'disabled' : ''}`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => typeof p === 'number' && setPage(p)}
                  >
                    {p}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${page === totalPages ? 'disabled' : ''}`}
              >
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPage(page + 1)}
                >
                  &rsaquo;
                </button>
              </li>
              <li
                className={`page-item ${page === totalPages ? 'disabled' : ''}`}
              >
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPage(totalPages)}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default SearchAndPaginationTable;
