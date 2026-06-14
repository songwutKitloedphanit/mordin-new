import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { DataTableFilter } from '../../../components/gui/DataTableFilter';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { getAllFactories } from '../../../services/api/service-area/FactoryApi';
import { FactoryInfoInterface } from '../../../types/service-area/Factories';
import { TimeStampToDate } from '../../../utils/Date';

import ServiceAreaCard from '@/components/pages/service-area/ServiceAreaCard';
import { deleteFactoryById } from '../../../services/api/service-area/FactoryApi';
import Swal from 'sweetalert2';

const ServiceAreaManagement: React.FC = () => {
  const navigate = useNavigate();
  const [factories, setFactories] = useState<FactoryInfoInterface[]>([]);

  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllFactories();
        setFactories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // คำนวณจำนวนเขตส่งเสริมทั้งหมด
  // const totalServiceAreas = factories.reduce(
  //   (sum, f) => sum + f.serviceAreaCount,
  //   0
  // );

  return (
    <div className="row">
      <ServiceAreaCard />

      {/* Table Section */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">โรงงานและเขตส่งเสริม</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <button
                    type="button"
                    className="btn btn-icon btn-round btn-success"
                    onClick={() => navigate('/admin/service-area/add')}
                  >
                    <i className="fa fa-plus"></i>
                  </button>
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
                  <>
                    <table
                      id="multi-filter-select"
                      className="display table table-striped table-hover"
                    >
                      <thead>
                        <tr>
                          <th>ชื่อย่อโรงงาน</th>
                          <th>ชื่อโรงงาน</th>
                          <th>จำนวนชื่อเขตส่งเสริม</th>
                          <th>หมายเหตุ</th>
                          <th>Management</th>
                          <th>Update</th>
                        </tr>
                      </thead>
                      <tbody>
                        {factories.map(f => (
                          <tr key={f.factoryId}>
                            <td align="center">{f.initial}</td>
                            <td align="center">{f.name}</td>
                            <td align="center">{f.serviceAreaCount}</td>
                            <td align="center">{f.note || '-'}</td>
                            <td>
                              <GenButtonCircle
                                color={B_LIST.edit.color}
                                icon={B_LIST.edit.icon}
                                className="mx-3"
                                onClick={() =>
                                  navigate(
                                    `/admin/service-area/${f.factoryId}/edit`
                                  )
                                }
                              />
                              <GenButtonCircle
                                color={B_LIST.del.color}
                                icon={B_LIST.del.icon}
                                onClick={() =>
                                  setDeleteTarget({
                                    id: f.factoryId,
                                    name: f.name,
                                  })
                                }
                              />
                            </td>
                            <td align="center">
                              {TimeStampToDate(f.updatedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th>ชื่อย่อโรงงาน</th>
                          <th>ชื่อโรงงาน</th>
                          <th>จำนวนชื่อเขตส่งเสริม</th>
                          <th>หมายเหตุ</th>
                          <th>Management</th>
                          <th>Update</th>
                        </tr>
                      </tfoot>
                    </table>
                    {/* เพิ่ม DataTableFilter เพื่อ filter แต่ละคอลัมน์ */}
                    <DataTableFilter
                      tableId="multi-filter-select"
                      loading={loading}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Confirm deletion */}
      {deleteTarget && (
        <ConfirmAlert
          title="ยืนยันการลบ"
          text={`คุณแน่ใจหรือไม่ที่จะลบโรงงาน ${deleteTarget.name} ?`}
          action="delete"
          onConfirm={async () => {
            try {
              await deleteFactoryById(deleteTarget.id);
              setFactories(prev =>
                prev.filter(x => x.factoryId !== deleteTarget.id)
              );
              Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: 'ลบโรงงานเรียบร้อยแล้ว',
                confirmButtonText: 'ตกลง',
              });
            } catch (err: any) {
              const errorMessage =
                err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบโรงงาน';
              Swal.fire({
                icon: 'warning',
                title: 'ไม่สามารถลบได้',
                text: errorMessage,
                confirmButtonText: 'ตกลง',
              });
            } finally {
              setDeleteTarget(null);
            }
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default ServiceAreaManagement;
