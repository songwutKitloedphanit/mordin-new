import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { TableSkeleton } from '@/components/gui/Skeleton';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
  filterable?: boolean; // แสดง dropdown filter ใน filter bar
}

interface FetchParams {
  search: string;
  page: number;
  limit: number;
  all?: boolean;
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
  refreshKey?: number | string;
  clientSideFilters?: boolean;
}

const DEFAULT_LIMIT_OPTIONS = [10, 25, 50, 100];

function SearchAndPaginationTable<T extends object>({
  columns,
  fetchData,
  initialLimit = 10,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  initialSortBy = '',
  initialOrder = 'ASC',
  refreshKey,
  clientSideFilters = false,
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
  const [columnFilters, setColumnFilters] = useState<Record<number, string>>({});
  const fetchPage = clientSideFilters ? 1 : page;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const q: Partial<FetchParams> = {
          page: fetchPage,
          limit,
          order,
        };
        if (clientSideFilters) q.all = true;
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
  }, [search, fetchPage, limit, sortBy, order, fetchData, refreshKey, clientSideFilters]);

  // unique dropdown options for filterable columns only
  const columnOptions = useMemo(() => {
    const opts: Record<number, string[]> = {};
    columns.forEach((col, idx) => {
      if (!col.filterable) return;
      const setVals = new Set<string>();
      data.forEach(row => {
        let txt = '';
        if (typeof col.accessor === 'function') {
          const cell = col.accessor(row);
          if (typeof cell === 'string' || typeof cell === 'number') txt = String(cell).trim();
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

  // client-side filter: text search + column dropdowns
  const filteredData = useMemo(() => {
    const needle = clientSideFilters ? search.trim().toLowerCase() : '';
    return data.filter(row => {
      // text search across all columns
      if (needle) {
        const rowText = columns
          .map(col => {
            if (typeof col.accessor === 'function') {
              const cell = col.accessor(row);
              return typeof cell === 'string' || typeof cell === 'number'
                ? String(cell)
                : '';
            }
            const cell = row[col.accessor];
            return cell != null ? String(cell) : '';
          })
          .join(' ')
          .toLowerCase();
        if (!rowText.includes(needle)) return false;
      }
      // column dropdown filters
      return columns.every((col, idx) => {
        const val = columnFilters[idx];
        if (!val) return true;
        let txt = '';
        if (typeof col.accessor === 'function') {
          const cell = col.accessor(row);
          if (typeof cell === 'string' || typeof cell === 'number') txt = String(cell);
        } else {
          const cell = row[col.accessor];
          txt = cell != null ? String(cell) : '';
        }
        return txt === val;
      });
    });
  }, [data, columns, columnFilters, search, clientSideFilters]);

  const pageData = useMemo(() => {
    if (!clientSideFilters) return filteredData;
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [clientSideFilters, filteredData, limit, page]);

  const effectiveTotalEntries = clientSideFilters ? filteredData.length : totalEntries;
  const effectiveTotalPages = clientSideFilters
    ? Math.ceil(filteredData.length / limit)
    : totalPages;

  useEffect(() => {
    if (page > 1 && effectiveTotalPages > 0 && page > effectiveTotalPages) {
      setPage(effectiveTotalPages);
    }
  }, [effectiveTotalPages, page]);

  const handleSort = (col: Column<T>) => {
    const key = typeof col.accessor === 'string' ? col.accessor : col.sortKey || '';
    if (!key) return;
    if (sortBy === key) {
      setOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
      if (order === 'DESC') { setSortBy(''); setOrder('ASC'); }
    } else {
      setSortBy(key);
      setOrder('ASC');
    }
    setPage(1);
  };

  const hasFilter = search || Object.values(columnFilters).some(v => v);

  const clearFilters = useCallback(() => {
    setSearch('');
    setColumnFilters({});
    setPage(1);
  }, []);

  const startEntry = effectiveTotalEntries > 0 ? (page - 1) * limit + 1 : 0;
  const endEntry = Math.min(page * limit, effectiveTotalEntries);

  const pages = useMemo<(number | string)[]>(() => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(effectiveTotalPages - 1, page + delta);
    if (effectiveTotalPages < 1) return [];
    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < effectiveTotalPages - 1) range.push('...');
    if (effectiveTotalPages > 1) range.push(effectiveTotalPages);
    return range;
  }, [effectiveTotalPages, page]);

  const filterableColumns = columns
    .map((col, idx) => ({ col, idx }))
    .filter(({ col }) => col.filterable);

  return (
    <div className="spt-wrapper">

      {/* Filter bar */}
      <div className="spt-filter-bar d-flex flex-wrap gap-2 align-items-center pb-3 mb-3 border-bottom">
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ maxWidth: 220 }}
          placeholder="ค้นหา..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        {filterableColumns.map(({ col, idx }) => {
          const opts = columnOptions[idx] || [];
          return (
            <select
              key={idx}
              className="form-select form-select-sm"
              style={{ maxWidth: 180 }}
              value={columnFilters[idx] || ''}
              onChange={e => {
                setColumnFilters(prev => ({ ...prev, [idx]: e.target.value }));
                setPage(1);
              }}
            >
              <option value="">ทุก{col.header}</option>
              {opts.map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          );
        })}
        {hasFilter && (
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
            <i className="fas fa-times me-1" />
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* Length selector */}
      <div className="d-flex justify-content-end align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted text-nowrap" style={{ fontSize: '0.82rem' }}>แสดง</span>
          <select
            className="form-select form-select-sm w-auto"
            value={limit}
            onChange={e => { setLimit(+e.target.value); setPage(1); }}
          >
            {limitOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="text-muted text-nowrap" style={{ fontSize: '0.82rem' }}>รายการ</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const key = typeof col.accessor === 'string' ? col.accessor : col.sortKey;
                const isSorted = key === sortBy;
                const thClass = [
                  col.sortable ? 'dt-orderable dt-orderable-asc dt-orderable-desc' : '',
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
                <td colSpan={columns.length} style={{ padding: 0, border: 'none' }}>
                  <TableSkeleton rows={5} cols={columns.length} />
                </td>
              </tr>
            ) : pageData.length > 0 ? (
              pageData.map((row, i) => (
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
                <td colSpan={columns.length} className="text-center py-4 text-muted">
                  ไม่มีข้อมูลในตาราง
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom: info + pagination centered */}
      <div className="spt-bottom d-flex flex-column align-items-center gap-2 mt-3 pb-1">
        <div className="spt-info">
          แสดง {startEntry} ถึง {endEntry} จาก {effectiveTotalEntries} รายการ
        </div>
        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPage(1)}>&laquo;</button>
            </li>
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPage(page - 1)}>&lsaquo;</button>
            </li>
            {pages.map((p, idx) => (
              <li
                // eslint-disable-next-line react-x/no-array-index-key
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
            <li className={`page-item ${page === effectiveTotalPages || effectiveTotalPages < 1 ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPage(page + 1)}>&rsaquo;</button>
            </li>
            <li className={`page-item ${page === effectiveTotalPages || effectiveTotalPages < 1 ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPage(effectiveTotalPages)}>&raquo;</button>
            </li>
          </ul>
        </nav>
      </div>

    </div>
  );
}

export default SearchAndPaginationTable;
