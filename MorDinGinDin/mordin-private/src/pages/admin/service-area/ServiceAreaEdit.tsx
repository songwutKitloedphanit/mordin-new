import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { GenFormText1 } from '../../../components/gui/GuiForm';
import {
  getFactoryById,
  updateFactoryById,
} from '../../../services/api/service-area/FactoryApi';
import { FactoryUpdateInterface } from '../../../types/service-area/Factories';
import { ServiceAreaInputInterface } from '../../../types/service-area/ServiceAreas';
import { deleteServiceAreaById } from '../../../services/api/service-area/ServiceAreaApi';

import ServiceAreaCard from '@/components/pages/service-area/ServiceAreaCard';

const ServiceAreaEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const factoryId = Number(id);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [factoryInput, setFactoryInput] = useState<FactoryUpdateInterface>(
    {} as FactoryUpdateInterface
  );
  const [rowToRemove, setRowToRemove] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchFactory = async () => {
      const factory = await getFactoryById(factoryId);
      setFactoryInput({
        name: factory.name,
        initial: factory.initial,
        note: factory.note,
        serviceAreas: factory.serviceAreas.map(
          (area: ServiceAreaInputInterface) => ({
            serviceAreaId: area.serviceAreaId,
            code: area.code,
            name: area.name,
            note: area.note,
          })
        ),
      });
    };
    fetchFactory();
  }, [factoryId]);
  // เพิ่มแถวใหม่ใน serviceAreas
  const addRow = () => {
    setFactoryInput(prev => ({
      ...prev,
      newServiceAreas: [
        ...(prev.newServiceAreas ?? []),
        { code: '', factoryId: null, name: '', note: '' },
      ],
    }));
  };

  const removeRow = (idx: number) => {
    setFactoryInput(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((_, i) => i !== idx),
    }));
  };

  const updateRow = (
    idx: number,
    field: keyof ServiceAreaInputInterface,
    value: string
  ) => {
    setFactoryInput(prev => {
      const oldCount = prev.serviceAreas?.length ?? 0;

      if (idx < oldCount) {
        // แก้รายการเดิม
        const updatedOld = [...prev.serviceAreas];
        updatedOld[idx] = {
          ...updatedOld[idx],
          [field]: field === 'note' ? value.trim() || '' : value,
        };
        return {
          ...prev,
          serviceAreas: updatedOld,
        };
      } else {
        // แก้รายการใหม่
        const newIdx = idx - oldCount;
        const updatedNew = [...(prev.newServiceAreas ?? [])];
        updatedNew[newIdx] = {
          ...updatedNew[newIdx],
          [field]: field === 'note' ? value.trim() || '' : value,
        };
        return {
          ...prev,
          newServiceAreas: updatedNew,
        };
      }
    });
  }


  const handleDeleteServiceArea = async (idx: number, serviceAreaId: number) => {
    try {
      await deleteServiceAreaById(serviceAreaId);
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'ลบเขตส่งเสริมเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
      });
      // Remove from state
      setFactoryInput(prev => ({
        ...prev,
        serviceAreas: prev.serviceAreas.filter((_, i) => i !== idx),
      }));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบเขตส่งเสริม';
      Swal.fire({
        icon: 'warning', // Changing to warning to match user requirement "หากลบไม่ได้ติด relation ก็ให้ขึ้นบอกด้วย"
        title: 'ไม่สามารถลบได้',
        text: errorMessage,
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // 1) ตรวจสอบ factory
    if (!factoryInput.name.trim()) {
      newErrors.name = 'กรุณาระบุชื่อโรงงาน';
    } else if (factoryInput.name.trim().length > 100) {
      newErrors.name = 'ชื่อโรงงานต้องไม่เกิน 100 ตัวอักษร';
    }

    if (!factoryInput.initial.trim()) {
      newErrors.initial = 'กรุณาระบุชื่อย่อโรงงาน';
    } else if (
      factoryInput.initial.trim().length > 4 ||
      factoryInput.initial.trim().length < 3
    ) {
      newErrors.initial = 'ชื่อย่อต้องมีจำนวน 3-4 ตัวอักษร';
    }

    // 2) ตรวจสอบแต่ละ service-area row
    const seenCodes = new Set<string>();
    factoryInput.serviceAreas.forEach((r, idx) => {
      const code = r.code.trim();
      const name = r.name.trim();

      if (!code) {
        newErrors[`rows.${idx}.code`] = `กรุณากรอกรหัสเขตส่งเสริม (แถว ${idx + 1
          })`;
      } else {
        if (code.length > 10) {
          newErrors[`rows.${idx}.code`] =
            `รหัสเขตส่งเสริมต้องไม่เกิน 10 ตัวอักษร (แถว ${idx + 1})`;
        }
        if (seenCodes.has(code)) {
          newErrors[`rows.${idx}.code`] = `รหัสเขตส่งเสริมซ้ำกัน (แถว ${idx + 1
            })`;
        }
        seenCodes.add(code);
      }

      if (!name) {
        newErrors[`rows.${idx}.name`] = `กรุณาระบุชื่อเขตส่งเสริม (แถว ${idx + 1
          })`;
      } else if (name.length > 45) {
        newErrors[`rows.${idx}.name`] =
          `ชื่อเขตส่งเสริมต้องไม่เกิน 45 ตัวอักษร (แถว ${idx + 1})`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      return;
    }

    try {
      console.log('input', factoryInput);

      const reponse = await updateFactoryById(factoryId, factoryInput);
      console.log('reponse', reponse);

      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'เพิ่มโรงงานและเขตส่งเสริมเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
      }).then(() => navigate('/admin/service-area'));
    } catch (err: unknown) {
      console.error(err);
    }
  };

  console.log(factoryInput);

  return (
    <div className="container-fluid">
      <div className="row">
        <ServiceAreaCard />
      </div>

      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title">แก้ไขโรงงานและเขตส่งเสริม</h4>
              <GenButtonCircle
                color="btn-primary"
                icon="fas fa-clipboard-list"
                onClick={() => navigate('/admin/service-area')}
              />
            </div>
            <div className="card-body">
              <div className="col-md-6 mx-auto">
                <form onSubmit={handleSubmit} noValidate>
                  <GenFormText1
                    isRequired={true}
                    id="factoryName"
                    name="factoryName"
                    label="ชื่อโรงงาน"
                    placeholder="ระบุชื่อโรงงาน"
                    value={factoryInput.name ?? ''}
                    onChange={e =>
                      setFactoryInput(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    errorMessage={errors.name}
                  />

                  <GenFormText1
                    isRequired={true}
                    id="initial"
                    name="initial"
                    label="ชื่อย่อโรงงาน"
                    placeholder="ระบุชื่อย่อโรงงาน"
                    value={factoryInput.initial ?? ''}
                    onChange={e =>
                      setFactoryInput(prev => ({
                        ...prev,
                        initial: e.target.value,
                      }))
                    }
                    errorMessage={errors.initial}
                  />

                  <GenFormText1
                    isRequired={false}
                    id="note"
                    name="note"
                    label="หมายเหตุ"
                    placeholder="หมายเหตุ"
                    value={factoryInput.note || ''}
                    onChange={e =>
                      setFactoryInput(prev => ({
                        ...prev,
                        note: e.target.value || '',
                      }))
                    }
                  />

                  <div className="table-responsive">
                    <table className="table table-bordered w-100">
                      <thead>
                        <tr>
                          <th>รหัสเขตส่งเสริม</th>
                          <th>ชื่อเขตส่งเสริม</th>
                          <th>หมายเหตุ</th>
                          <th>
                            <button
                              type="button"
                              className="btn btn-icon btn-round btn-success"
                              onClick={addRow}
                            >
                              <i className="fa fa-plus" />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ...(factoryInput.serviceAreas ?? []),
                          ...(factoryInput.newServiceAreas ?? []),
                        ].map((r, idx) => {
                          const key = r.serviceAreaId ?? `new-${idx}`;

                          return (
                            <tr key={key}>
                              <td>
                                <input
                                  type="text"
                                  className={`form-control ${errors[`rows.${idx}.code`] ? 'is-invalid' : ''}`}
                                  value={r.code ?? ''}
                                  onChange={e =>
                                    updateRow(idx, 'code', e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className={`form-control ${errors[`rows.${idx}.name`] ? 'is-invalid' : ''}`}
                                  value={r.name ?? ''}
                                  onChange={e =>
                                    updateRow(idx, 'name', e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={r.note ?? ''}
                                  onChange={e =>
                                    updateRow(idx, 'note', e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                {!r.serviceAreaId ? (
                                  <GenButtonCircle
                                    color={B_LIST.del.color}
                                    icon={B_LIST.del.icon}
                                    onClick={() => setRowToRemove(idx)}
                                  />
                                ) : (
                                  <GenButtonCircle
                                    color={B_LIST.del.color}
                                    icon={B_LIST.del.icon}
                                    onClick={() => setDeleteTargetId(idx)}
                                  />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-action mt-4">
                    <div className="d-flex">
                      <button
                        type="submit"
                        className="btn btn-success me-2"
                        style={{ width: 140 }}
                      >
                        แก้ไขโรงงาน
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger ms-auto"
                        style={{ width: 120 }}
                        onClick={() => setShowConfirm(true)}
                      >
                        ยกเลิก
                      </button>
                    </div>
                    {showConfirm && (
                      <ConfirmAlert
                        title={'ยืนยันการยกเลิก'}
                        text={'คุณต้องการยกเลิกการแก้ไขข้อมูลหรือไม่'}
                        action={'cancel'}
                        onConfirm={() => navigate(-1)}
                        onCancel={() => setShowConfirm(false)}
                      />
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {rowToRemove !== null && (
        <ConfirmAlert
          title="ยืนยันการลบแถว"
          text={`คุณต้องการลบแถวที่ ${rowToRemove + 1} หรือไม่?`}
          action="delete"
          onConfirm={() => {
            removeRow(rowToRemove);
            setRowToRemove(null);
          }}
          onCancel={() => setRowToRemove(null)}
        />
      )}
      {deleteTargetId !== null && (
        <ConfirmAlert
          title="ยืนยันการลบเขตส่งเสริม"
          text="คุณต้องการลบเขตส่งเสริมนี้หรือไม่?"
          action="delete"
          onConfirm={() => {
            const area = factoryInput.serviceAreas[deleteTargetId];
            if (area && area.serviceAreaId) {
              handleDeleteServiceArea(deleteTargetId, area.serviceAreaId);
            }
          }}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
};

export default ServiceAreaEdit;
