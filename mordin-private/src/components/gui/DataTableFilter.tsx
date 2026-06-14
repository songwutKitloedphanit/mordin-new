/// <reference types="datatables.net" />

import $ from 'jquery';
import { useEffect, useRef } from 'react';
import 'datatables.net-dt/js/dataTables.dataTables';

interface DataTableFilterProps {
  tableId: string;
  loading: boolean;
  onReady?: () => void;
}

export const DataTableFilter: React.FC<DataTableFilterProps> = ({
  tableId,
  loading,
  onReady,
}) => {
  const dataTableRef = useRef<DataTables.Api | null>(null);
  const isHtml = (str: string): boolean => /<[a-z][\s\S]*>/i.test(str);

  useEffect(() => {
    if (loading) return;

    const excludedColumns = new Set(['management', 'link', 'action']);
    const $table = $(`#${tableId}`);
    if ($table.length === 0) return;

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

    try {
      if ($.fn.dataTable.isDataTable($table)) {
        ($table.DataTable() as DataTables.Api).destroy();
      }

      const dt = $table.DataTable({
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        dom: '<"d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3"lf><"table-responsive"rt><"d-flex justify-content-center mt-3"p><"text-center mt-1 dt-info-row"i>',
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
        columnDefs: [
          {
            targets: -2,
            orderable: false,
          },
        ],
        initComplete: function () {
          $('.dataTables_filter input[type="search"]')
            .addClass('form-control form-control-sm')
            .css({ minWidth: '200px', borderRadius: '8px' });
          $('.dataTables_length select')
            .addClass('form-select form-select-sm d-inline-block')
            .css({ width: 'auto', borderRadius: '8px' });
          const api = (this as any).api();
          api.columns().every(function (this: DataTables.ColumnMethods) {
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
                dt.column($(this).parent().index()!)
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

      dataTableRef.current = dt;
    } catch (err) {
      console.error('Error initializing DataTable:', err);
    }

    return () => {
      try {
        dataTableRef.current?.destroy(false);
      } catch (err) {
        console.warn('DataTable cleanup failed:', err);
      }
    };
  }, [loading, tableId, onReady]);

  return null;
};
