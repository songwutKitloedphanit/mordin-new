import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import React, { useMemo, useState } from 'react';

import { GenButtonCircle, B_LIST } from '@/components/gui/GuiButton';
import { QrCodeInfo, QrCodeTypeEnum } from '@/types/qr-code/QrCode';
import { TimeStampToDate } from '@/utils/Date';

interface QrCodeTableProps {
  qrCodes: QrCodeInfo[];
  onPrintSingle: (qr: QrCodeInfo) => void;
  onDelete?: (qrCode: string) => void;
  _mode?: 'admin' | 'officer';
}

const typeLabels: Record<QrCodeTypeEnum, string> = {
  [QrCodeTypeEnum.Booking]: 'จอง',
  [QrCodeTypeEnum.Walkin]: 'Walk-in',
  [QrCodeTypeEnum.Spread]: 'กระจาย',
};

export const QrCodeTable: React.FC<QrCodeTableProps> = ({
  qrCodes,
  onPrintSingle,
  onDelete,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');

  const data = useMemo(() => qrCodes, [qrCodes]);

  const columns = useMemo<ColumnDef<QrCodeInfo>[]>(() => {
    const baseColumns: ColumnDef<QrCodeInfo>[] = [
      {
        accessorKey: 'qrCode',
        header: 'QR Code',
        enableSorting: true,
      },
      {
        id: 'createdUser',
        accessorFn: row => row.createdUser?.firstName || '-',
        header: 'พนักงาน',
        enableSorting: true,
      },
      {
        id: 'createdAt',
        accessorFn: row => TimeStampToDate(row.createdAt),
        header: 'วันที่',
        enableSorting: true,
      },
      {
        id: 'type',
        accessorFn: row => typeLabels[row.type],
        header: 'ประเภท',
        enableSorting: true,
      },
      {
        id: 'booking',
        accessorFn: () => '',
        header: 'จอง',
        enableSorting: false,
      },
      {
        id: 'analyzed',
        accessorFn: () => '',
        header: 'วิเคราะห์',
        enableSorting: false,
      },
      {
        id: 'factory',
        accessorFn: row => row.serviceArea?.factory?.name || '-',
        header: 'โรงงาน',
        enableSorting: true,
      },
      {
        id: 'area',
        accessorFn: row => row.serviceArea?.name || '-',
        header: 'เขตส่งเสริม',
        enableSorting: true,
      },
      {
        id: 'management',
        header: 'จัดการ',
        cell: ({ row }) => (
          <>
            <GenButtonCircle
              icon={B_LIST.print.icon}
              color={B_LIST.print.color}
              onClick={() => onPrintSingle(row.original)}
              className="mx-1"
            />
            {onDelete && (
              <GenButtonCircle
                icon={B_LIST.del.icon}
                color={B_LIST.del.color}
                onClick={() => onDelete(row.original.qrCode)}
                className="mx-1"
              />
            )}
          </>
        ),
        enableSorting: false,
      },
      {
        id: 'updatedAt',
        accessorFn: row => TimeStampToDate(row.createdAt),
        header: 'Update',
        enableSorting: true,
      },
    ];

    return baseColumns;
  }, [onPrintSingle, onDelete]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    enableSorting: true,
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  const pages = useMemo(() => {
    const delta = 2;
    const current = pageIndex + 1;
    const total = pageCount;
    const range: (number | string)[] = [];
    const left = Math.max(1, current - delta);
    const right = Math.min(total, current + delta);

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= left && i <= right)) {
        range.push(i);
      }
    }

    const pagesWithDots: (number | string)[] = [];
    let last = 0;
    for (const i of range) {
      if (last + 1 !== Number(i)) {
        pagesWithDots.push('...');
      }
      pagesWithDots.push(i);
      last = Number(i);
    }
    return pagesWithDots;
  }, [pageIndex, pageCount]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
        >
          {[10, 25, 50, 100].map(size => (
            <option key={size} value={size}>
              {size} แถว
            </option>
          ))}
        </select>
        <input
          type="text"
          className="form-control w-25"
          placeholder="ค้นหาทั้งตาราง..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`dt-orderable-asc dt-orderable-desc ${
                      header.column.getIsSorted() === 'asc'
                        ? 'dt-ordering-asc'
                        : header.column.getIsSorted() === 'desc'
                          ? 'dt-ordering-desc'
                          : ''
                    }`}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <span className="dt-column-order" />
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tfoot>
            {table.getFooterGroups().map(footerGroup => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map(header => (
                  <td key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tfoot>

          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={i % 2 === 0 ? 'table-light' : 'table-white'}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <span>
          Showing {pageIndex + 1} to {pageCount} | Total rows:{' '}
          {table.getFilteredRowModel().rows.length}
        </span>
        <ul className="pagination mb-0">
          <li className={`page-item ${pageIndex === 0 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              type="button"
              onClick={() => table.setPageIndex(0)}
            >
              &laquo;
            </button>
          </li>
          <li className={`page-item ${pageIndex === 0 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              type="button"
              onClick={() => table.previousPage()}
            >
              &lsaquo;
            </button>
          </li>
          {pages.map(p => (
            <li
              key={String(p)}
              className={`page-item ${p === pageIndex + 1 ? 'active' : ''} ${p === '...' ? 'disabled' : ''}`}
            >
              <button
                className="page-link"
                type="button"
                onClick={() =>
                  typeof p === 'number' && table.setPageIndex(p - 1)
                }
              >
                {p}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${!table.getCanNextPage() ? 'disabled' : ''}`}
          >
            <button
              className="page-link"
              type="button"
              onClick={() => table.nextPage()}
            >
              &rsaquo;
            </button>
          </li>
          <li
            className={`page-item ${!table.getCanNextPage() ? 'disabled' : ''}`}
          >
            <button
              className="page-link"
              type="button"
              onClick={() => table.setPageIndex(pageCount - 1)}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};
