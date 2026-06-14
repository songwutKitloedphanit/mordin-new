import type { Api, ApiColumnMethods } from 'datatables.net';
import $ from 'jquery';
import React, { useEffect, useRef, useMemo } from 'react';
import 'datatables.net-dt/js/dataTables.dataTables';

interface DataTableWrapperProps {
  tableId: string;
  loading: boolean;
  children: React.ReactNode;
  onReady?: () => void;
}

const DataTableWrapper: React.FC<DataTableWrapperProps> = ({
  tableId,
  loading,
  children,
  onReady,
}) => {
  const dataTableRef = useRef<Api<unknown> | null>(null);
  const excludedColumns = useMemo(
    () => new Set(['management', 'link', 'action', '']),
    []
  );
  const isHtml = (str: string): boolean => /<[a-z][\s\S]*>/i.test(str);

  useEffect(() => {
    if (loading) return;

    const $table = $(`#${tableId}`);
    if ($table.length === 0) return;

    const isDataTable = (
      $.fn.DataTable as unknown as {
        isDataTable: (table: Node | JQuery<HTMLElement>) => boolean;
      }
    ).isDataTable;

    if (isDataTable($table)) {
      $table.DataTable().destroy();
    }

    const hasData = $table
      .find('tbody tr')
      .toArray()
      .some(tr => {
        const text = $(tr).text().trim();
        return (
          text &&
          $(tr).find('td').length > 1 &&
          !$(tr).hasClass('dataTables_empty')
        );
      });

    $table.DataTable({
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      // หุ้ม "เฉพาะตัวตาราง" ด้วย .table-responsive (overflow-x) — search/length อยู่บน,
      // info/pagination อยู่ล่าง ทั้งคู่นิ่งนอกกล่องเลื่อน ไม่ถูก scrollbar ทับ
      // (ไม่ใช้ scrollX เพราะจะ clone thead/tfoot ทำให้หัวตาราง/แถวฟิลเตอร์ซ้ำ)
      dom:
        "<'d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2'lf>" +
        "<'table-responsive'rt>" +
        "<'d-flex flex-column align-items-center gap-2 mt-3'ip>",
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'ค้นหา...',
        lengthMenu: 'แสดง _MENU_ รายการ',
        info: 'รายการที่ _START_–_END_ จาก _TOTAL_ รายการ',
        infoEmpty: 'ไม่มีข้อมูล',
        infoFiltered: '(กรองจาก _MAX_ รายการ)',
        emptyTable: 'ไม่มีข้อมูลในตาราง',
        zeroRecords: 'ไม่พบข้อมูลที่ตรงกับเงื่อนไข',
        paginate: {
          first: '«',
          last: '»',
          next: '›',
          previous: '‹',
        },
      },
      search: {
        regex: false,
        smart: false,
      },
      columnDefs: [{ targets: -2, orderable: false }],
      initComplete: function () {
        const api = $table.DataTable() as unknown as Api<unknown>; // ✅ ใช้ .api() แบบไม่มีปัญหา

        api.columns().every(function (this: ApiColumnMethods<unknown>) {
          const header = this.header();
          const footer = this.footer();
          if (!header || !footer) return;

          const $footer = $(footer).empty();
          const headerText = $(header).text().trim().toLowerCase();
          if (excludedColumns.has(headerText)) return;

          const $select = $(
            '<select class="form-select form-select-sm mb-2"><option value=""></option></select>'
          )
            .appendTo($footer)
            .on('change', function (this: HTMLSelectElement) {
              const val = $(this).val() as string;
              api
                .column($(this).parent().index()!)
                .search(
                  val ? $.fn.dataTable.util.escapeRegex(val) : '',
                  true,
                  false
                )
                .draw();
            });

          if (hasData) {
            this.data()
              .unique()
              .sort()
              .each((d: unknown) => {
                if (d === undefined || d === null || String(d).trim() === '')
                  return;
                const rawText =
                  typeof d === 'object'
                    ? $(d as Node)
                        .text()
                        .trim()
                    : String(d).trim();
                if (rawText && !isHtml(rawText)) {
                  const escapedText = $('<div>').text(rawText).html();
                  $select.append(
                    `<option value="${escapedText}">${escapedText}</option>`
                  );
                }
              });
          }
        });

        onReady?.();
      },
    });

    dataTableRef.current = $table.DataTable() as unknown as Api<unknown>;

    if (!hasData) {
      const colCount = $table.find('thead th').length;
      $table
        .find('tbody')
        .html(
          `<tr><td colspan="${colCount}" class="text-center py-4">ไม่มีข้อมูลในตาราง</td></tr>`
        );
    }

    return () => {
      try {
        dataTableRef.current?.destroy();
      } catch (err) {
        console.warn('DataTable cleanup failed:', err);
      }
    };
  }, [loading, tableId, onReady, excludedColumns]);

  return <>{children}</>;
};

export default DataTableWrapper;
