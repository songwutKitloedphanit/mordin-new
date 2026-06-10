import React, { useState } from 'react';

import { GenButtonCircle } from '@/components/gui/GuiButton';
import { LaboratoryInfoInterface } from '@/types/Laboratory';
import { StandardInfo } from '@/types/standard-sample/standard';
import { TimeStampToDate } from '@/utils/Date';
interface StandardTableProps {
  standards: StandardInfo[];
  laboratories: LaboratoryInfoInterface[];
  selectedStandards: StandardInfo[];
  onAdd: (standard: StandardInfo) => void;
}

const StandardTable: React.FC<StandardTableProps> = ({
  standards,
  laboratories,
  selectedStandards,
  onAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStandards = standards.filter(s =>
    s.standardName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (id: number) =>
    selectedStandards
      .filter((s): s is StandardInfo => s != null)
      .some(s => s.standardId === id);

  return (
    <>
      <input
        className="form-control mb-3"
        type="text"
        placeholder="พิมพ์เพื่อค้นหา..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>เลือก</th>
              <th>ชื่อ</th>
              {laboratories.map(lab => (
                <th key={lab.laboratoryId}>
                  {lab.shortNameAfter
                    ? lab.unitAfter
                      ? `${lab.shortNameAfter}(${lab.unitAfter})`
                      : lab.shortNameAfter
                    : ''}
                </th>
              ))}
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {filteredStandards.map(standard => (
              <tr key={standard.standardId}>
                <td>
                  {!isSelected(standard.standardId) ? (
                    <GenButtonCircle
                      color="btn-success"
                      icon="fa fa-plus"
                      onClick={() => onAdd(standard)}
                    />
                  ) : (
                    <span className="text-muted">เลือกแล้ว</span>
                  )}
                </td>
                <td>{standard.standardName}</td>
                {laboratories.map(lab => {
                  const cert = standard.standardCertificates.find(
                    c => c.laboratoryId === lab.laboratoryId
                  );
                  return (
                    <td key={lab.laboratoryId} className="text-end">
                      {cert ? cert.certificateValue : ''}
                    </td>
                  );
                })}
                <td>{TimeStampToDate(standard.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StandardTable;
