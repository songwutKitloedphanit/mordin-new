import { useEffect, useState } from 'react';

import { Book } from '@/types/qr-code/QrCode';
import { TimeStampToDate } from '@/utils/Date';

interface TableWithCheckboxInterface {
  receivedService: Book[];
  selectedRows: number[];
  setSelectedRows: React.Dispatch<React.SetStateAction<number[]>>;
}

const TableWithCheckbox = ({
  receivedService,
  selectedRows,
  setSelectedRows,
}: TableWithCheckboxInterface) => {
  const [selectAll, setSelectAll] = useState(false);

  // Handle individual checkbox change
  const handleRowSelect = (bookId: number) => {
    setSelectedRows(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId);
      } else {
        return [...prev, bookId];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(receivedService.map(obj => obj.bookId));
    }
    setSelectAll(!selectAll);
  };

  // Update selectAll state when individual rows are selected/deselected
  useEffect(() => {
    if (receivedService && receivedService.length > 0) {
      setSelectAll(selectedRows.length === receivedService.length);
    }
  }, [selectedRows, receivedService]);

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <div className="card-head-row card-tools-still-right">
              <h4 className="card-title">
                วันบริการที่ <span> - </span>
              </h4>
              {selectedRows.length > 0 && (
                <div className="card-tools">
                  <span className="badge badge-primary">
                    เลือกแล้ว {selectedRows.length} รายการ
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table
                id={'table3'}
                className="display table table-striped table-hover"
              >
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        disabled={
                          !receivedService || receivedService.length === 0
                        }
                      />
                    </th>
                    <th>รหัสตัวอย่าง</th>
                    <th>วันที่รับตัวอย่าง</th>
                    <th>ลำดับ</th>
                  </tr>
                </thead>
                <tfoot>
                  <tr>
                    <th></th>
                    <th>รหัสตัวอย่าง</th>
                    <th>วันที่รับตัวอย่าง</th>
                    <th>ลำดับ</th>
                  </tr>
                </tfoot>
                <tbody>
                  {receivedService.length > 0 ? (
                    <>
                      {receivedService?.map(obj => (
                        <tr
                          key={obj.bookId}
                          className={
                            selectedRows.includes(obj.bookId)
                              ? 'table-active'
                              : ''
                          }
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(obj.bookId)}
                              onChange={() => handleRowSelect(obj.bookId)}
                            />
                          </td>
                          <td>{obj.sampleCode}</td>
                          <td>{TimeStampToDate(obj.sampleReceivedAt)}</td>
                          <td>
                            {obj.sampleCode ? obj.sampleCode.split('-')[2] : ''}
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center">
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableWithCheckbox;
