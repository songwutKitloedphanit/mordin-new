import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { DataTableFilter } from '../../../components/gui/DataTableFilter';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import {
  deleteLaboratory,
  getAllLaboratories,
} from '../../../services/api/laboratory/LaboratoryApi';
import { LaboratoryInfoInterface } from '../../../types/Laboratory';

import LabCard from '@/components/pages/laboratory/LabCard';

const Laboratory = () => {
  const [labParameters, setLabParameters] = useState<LaboratoryInfoInterface[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState<null | {
    delId: number;
    name: string;
  }>(null);

  const fetchData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockLab: LaboratoryInfoInterface[] = await getAllLaboratories();
      setLabParameters(mockLab);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (laboratoryId: number) => {
    try {
      const res = await deleteLaboratory(laboratoryId);
      console.log('delete laboratory:', res);
      fetchData();
    } catch (error) {
      console.error('Error creating bus:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลรถได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      throw error;
    }
  };

  return (
    <>
      {/* Statistics Cards */}
      <div className="row">
        <LabCard />
      </div>

      {/* Main Laboratory Parameters Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">Main Laboratories</h4>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <table
                    id="multi-filter-select1"
                    className="display table table-striped table-hover"
                  >
                    <thead>
                      <tr>
                        <th>รหัส</th>
                        <th>ชื่อย่อ(ก่อน)</th>
                        <th>ชื่อย่อ(หลัง)</th>
                        <th>ชื่อ</th>
                        <th>หน่วยวัด(ก่อน)</th>
                        <th>หน่วยวัด(หลัง)</th>
                        <th>ประเภท</th>
                        <th>ขอบเขตล่าง</th>
                        <th>ขอบเขตบน</th>
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tfoot>
                      <tr>
                        <th>รหัส</th>
                        <th>ชื่อย่อ(ก่อน)</th>
                        <th>ชื่อย่อ(หลัง)</th>
                        <th>ชื่อ</th>
                        <th>หน่วยวัด(ก่อน)</th>
                        <th>หน่วยวัด(หลัง)</th>
                        <th>ประเภท</th>
                        <th>ขอบเขตล่าง</th>
                        <th>ขอบเขตบน</th>
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </tfoot>
                    <tbody>
                      {labParameters
                        .filter(param => param.isMain)
                        .map(param => (
                          <tr key={param.laboratoryId}>
                            <td>{param.laboratoryCode}</td>
                            <td>{param.shortNameBefore}</td>
                            <td>{param.shortNameAfter}</td>
                            <td>{param.name}</td>
                            <td>{param.unitBefore}</td>
                            <td>{param.unitAfter}</td>
                            <td>{param.machineType.name}</td>
                            <td>{param.rangeMin}</td>
                            <td>{param.rangeMax}</td>
                            <td className="text-center">
                              <GenButtonCircle
                                color={B_LIST.info.color}
                                icon={B_LIST.info.icon}
                                link={`/admin/laboratory/${param.laboratoryId}`}
                              />
                            </td>
                            <td>
                              {
                                new Date(Number(param.updatedAt))
                                  .toISOString()
                                  .split('T')[0]
                              }
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
                <DataTableFilter
                  tableId="multi-filter-select1"
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minor Laboratory Parameters Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">Minor Laboratories</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    link="/admin/laboratory/add"
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <table
                    id="multi-filter-select2"
                    className="display table table-striped table-hover"
                  >
                    <thead>
                      <tr>
                        <th>รหัส</th>
                        <th>ชื่อย่อ(ก่อน)</th>
                        <th>ชื่อย่อ(หลัง)</th>
                        <th>ชื่อ</th>
                        <th>หน่วยวัด(ก่อน)</th>
                        <th>หน่วยวัด(หลัง)</th>
                        <th>ประเภท</th>
                        <th>ขอบเขตล่าง</th>
                        <th>ขอบเขตบน</th>
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tfoot>
                      <tr>
                        <th>รหัส</th>
                        <th>ชื่อย่อ(ก่อน)</th>
                        <th>ชื่อย่อ(หลัง)</th>
                        <th>ชื่อ</th>
                        <th>หน่วยวัด(ก่อน)</th>
                        <th>หน่วยวัด(หลัง)</th>
                        <th>ประเภท</th>
                        <th>ขอบเขตล่าง</th>
                        <th>ขอบเขตบน</th>
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </tfoot>
                    <tbody>
                      {labParameters
                        .filter(param => !param.isMain)
                        .map(param => (
                          <tr key={param.laboratoryId}>
                            <td>{param.laboratoryCode}</td>
                            <td>{param.shortNameBefore}</td>
                            <td>{param.shortNameAfter}</td>
                            <td>{param.name}</td>
                            <td>{param.unitBefore}</td>
                            <td>{param.unitAfter}</td>
                            <td>{param.machineType.name}</td>
                            <td>{param.rangeMin}</td>
                            <td>{param.rangeMax}</td>
                            <td className="text-center">
                              <GenButtonCircle
                                color={B_LIST.info.color}
                                icon={B_LIST.info.icon}
                                link={`/admin/laboratory/${param.laboratoryId}`}
                                className="mx-1"
                              />
                              <GenButtonCircle
                                icon={B_LIST.del.icon}
                                color={B_LIST.del.color}
                                onClick={() =>
                                  setShowConfirm({
                                    delId: param.laboratoryId,
                                    name: param.shortNameBefore,
                                  })
                                }
                              />
                              {showConfirm && (
                                <ConfirmAlert
                                  title="ต้องการลบข้อมูล?"
                                  text={`คุณต้องการลบ ${showConfirm.name} หรือไม่?`}
                                  action="delete"
                                  onConfirm={() =>
                                    handleDelete(showConfirm.delId)
                                  }
                                  onCancel={() => setShowConfirm(null)}
                                />
                              )}
                            </td>
                            <td>
                              {
                                new Date(Number(param.updatedAt))
                                  .toISOString()
                                  .split('T')[0]
                              }
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
                <DataTableFilter
                  tableId="multi-filter-select2"
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Laboratory;
