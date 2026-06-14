/* eslint-disable react-x/no-array-index-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import '../../../public/assets/css/SearchAndPaginationTable.css';

interface Column<T> {
  header: string | React.ReactNode;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
}

interface FetchParams<TSearchParams = Record<string, any>> {
  searchKeys?: TSearchParams;
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

type Props<T, TSearchParams = Record<string, any>> = {
  columns: Column<T>[];
  fetchData: (params: FetchParams<TSearchParams>) => Promise<FetchResult<T>>;
  initialLimit?: number;
  limitOptions?: number[];
  initialSortBy?: string;
  initialOrder?: 'ASC' | 'DESC';
  searchKeys?: TSearchParams;
};

const DEFAULT_LIMIT_OPTIONS = [10, 25, 50, 100];
const DEFAULT_SEARCH_PARAMS = {};

export default function SearchAndPaginationWithSearchKey<T extends object>({
  columns,
  fetchData,
  initialLimit = 10,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  initialSortBy = '',
  initialOrder = 'ASC',
  searchKeys = DEFAULT_SEARCH_PARAMS,
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
  const [columnFilters, setColumnFilters] = useState<Record<number, string>>(
    {}
  );

  // Fetch page data
  useEffect(() => {
    if (!searchKeys) return;
    (async () => {
      setLoading(true);
      try {
        const params: FetchParams = {
          ...searchKeys,
          search: search.trim(),
          page,
          limit,
          sortBy,
          order,
        };
        const res = await fetchData(params);
        setData(res.data);
        setTotalEntries(res.total);
        setTotalPages(res.totalPages);
      } finally {
        setLoading(false);
      }
    })();
  }, [search, page, limit, sortBy, order, fetchData, searchKeys]);

  // Compute per-column filter options
  const columnOptions = useMemo(() => {
    const opts: Record<number, string[]> = {};
    columns.forEach((col, idx) => {
      const vals = new Set<string>();
      data.forEach(row => {
        let txt = '';
        if (typeof col.accessor === 'function') {
          const cell = col.accessor(row);
          if (['string', 'number'].includes(typeof cell))
            txt = String(cell).trim();
        } else {
          const cell = row[col.accessor];
          if (cell != null) txt = String(cell).trim();
        }
        if (txt) vals.add(txt);
      });
      opts[idx] = Array.from(vals).sort();
    });
    return opts;
  }, [data, columns]);

  // Filter loaded data by column filters
  const filteredData = useMemo(() => {
    return data.filter(row =>
      columns.every((col, idx) => {
        const filterVal = columnFilters[idx];
        if (!filterVal) return true;
        let txt = '';
        if (typeof col.accessor === 'function') {
          const cell = col.accessor(row);
          if (['string', 'number'].includes(typeof cell)) txt = String(cell);
        } else {
          const cell = row[col.accessor];
          if (cell != null) txt = String(cell);
        }
        return txt === filterVal;
      })
    );
  }, [data, columns, columnFilters]);

  // Sorting logic
  const handleSort = (col: Column<T>) => {
    const key =
      typeof col.accessor === 'string' ? col.accessor : col.sortKey || '';
    if (!key) return;
    if (sortBy === key) {
      const nextOrder = order === 'ASC' ? 'DESC' : 'ASC';
      setOrder(nextOrder);
    } else {
      setSortBy(key);
      setOrder('ASC');
    }
  };

  const startEntry = totalEntries > 0 ? (page - 1) * limit + 1 : 0;
  const endEntry = Math.min(page * limit, totalEntries);

  // Pagination array
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
        {/* Top controls */}
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

        {/* Table */}
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

                  // ถ้า header เป็น ReactNode ให้เรนเดอร์ตรงๆ
                  const headerContent = React.isValidElement(col.header) ? (
                    col.header
                  ) : (
                    <div className="dt-column-header">
                      <span className="dt-column-title">{col.header}</span>
                      {col.sortable && <span className="dt-column-order" />}
                    </div>
                  );

                  return (
                    <th
                      key={idx}
                      className={thClass}
                      onClick={() => col.sortable && handleSort(col)}
                      style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                    >
                      {headerContent}
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
              ) : filteredData.length ? (
                filteredData.map((row, i) => (
                  <tr key={i}>
                    {columns.map(col => (
                      <td key={col.header as string}>
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
            <tfoot>
              <tr>
                {columns.map((_col, idx) => {
                  const opts = columnOptions[idx] || [];
                  if (!opts.length) return <th key={idx}></th>;
                  return (
                    <th key={idx}>
                      <select
                        className="form-select form-select-sm"
                        value={columnFilters[idx] || ''}
                        onChange={e =>
                          setColumnFilters(prev => ({
                            ...prev,
                            [idx]: e.target.value,
                          }))
                        }
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

        {/* Pagination */}
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
                  key={idx}
                  className={`page-item ${p === page ? 'active' : ''} ${p === '...' ? 'disabled' : ''}`}
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
