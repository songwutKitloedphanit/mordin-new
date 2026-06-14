import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { DataTableFilter } from '@/components/gui/DataTableFilter';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { getAllLaboratories } from '@/services/api/laboratory/LaboratoryApi';
import {
  getAllStandard,
  deleteStandard,
} from '@/services/api/standard/StandardApi';
import { Laboratory } from '@/types/Laboratory';
import { StandardInfo } from '@/types/Standard';
import { TimeStampToDate } from '@/utils/Date';

const Standard = () => {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [standards, setStandards] = useState<StandardInfo[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedStandardId, setSelectedStandardId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllLaboratories();
        setLaboratories(data || []);
        const standardsData = await getAllStandard();
        setStandards(standardsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setStandards([]);
        setLaboratories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  console.log('Standards', standards);

  const setConfirmDelete = (standardId: number) => () => {
    setSelectedStandardId(standardId);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (selectedStandardId) {
      try {
        await deleteStandard(selectedStandardId);
        Swal.fire({
          icon: 'success',
          title: 'ลบข้อมูลสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        });
        setStandards(
          standards.filter(std => std.standardId !== selectedStandardId)
        );
        setShowConfirm(false);
        setSelectedStandardId(null);
      } catch (error: any) {
        console.error('Error deleting standard:', error);
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถลบได้',
          text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ Standard',
        });
        setShowConfirm(false);
      }
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedStandardId(null);
  };

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">Standard Management</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    link="/admin/standard/add"
                    className="mx-2"
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table
                    id="standard-table"
                    className="table table-striped table-hover"
                  >
                    <thead>
                      <tr>
                        <th>ชื่อ</th>
                        {laboratories.map(laboratory => (
                          <th key={laboratory.laboratoryId}>
                            {laboratory.shortNameAfter
                              ? laboratory.unitAfter
                                ? `${laboratory.shortNameAfter}(${laboratory.unitAfter})`
                                : laboratory.shortNameAfter
                              : ''}
                          </th>
                        ))}
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standards.map(standard => (
                        <tr key={standard.standardId}>
                          <td>{standard.standardName}</td>
                          {laboratories.map(laboratory => {
                            const certificate =
                              standard.standardCertificates.find(
                                cert =>
                                  cert.laboratoryId === laboratory.laboratoryId
                              );
                            return (
                              <td
                                className="text-end"
                                key={laboratory.laboratoryId}
                              >
                                {certificate
                                  ? certificate.certificateValue
                                  : ''}
                              </td>
                            );
                          })}
                          <td className="text-center">
                            <GenButtonCircle
                              color={B_LIST.edit.color}
                              icon={B_LIST.edit.icon}
                              link={`/admin/standard/${standard.standardId}/edit`}
                              className="mx-2"
                            />
                            <GenButtonCircle
                              color={B_LIST.del.color}
                              icon={B_LIST.del.icon}
                              onClick={setConfirmDelete(standard.standardId)}
                            />
                          </td>
                          <td>{TimeStampToDate(standard.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th>ชื่อ</th>
                        {laboratories.map(laboratory => (
                          <th key={laboratory.laboratoryId}>
                            {laboratory.shortNameAfter
                              ? laboratory.unitAfter
                                ? `${laboratory.shortNameAfter}(${laboratory.unitAfter})`
                                : laboratory.shortNameAfter
                              : ''}
                          </th>
                        ))}
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </tfoot>
                  </table>
                  <DataTableFilter tableId="standard-table" loading={loading} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ต้องการลบข้อมูล?"
          text={`คุณแน่ใจหรือไม่ว่าต้องการลบ ${standards.find(standard => standard.standardId === selectedStandardId)?.standardName}?`}
          action="delete"
          onConfirm={handleDelete}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default Standard;
