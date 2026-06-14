import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { GenFormText1 } from '../../../components/gui/GuiForm';
import { createFactory } from '../../../services/api/service-area/FactoryApi';
import { FactoryCreateInterface } from '../../../types/service-area/Factories';
import { ServiceAreaInputInterface } from '../../../types/service-area/ServiceAreas';

import ServiceAreaCard from '@/components/pages/service-area/ServiceAreaCard';

const ServiceAreaAdd: React.FC = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [factoryInput, setFactoryInput] = useState<FactoryCreateInterface>({
    name: '',
    initial: '',
    note: '',
    serviceAreas: [
      {
        code: '',
        name: '',
        note: '',
      },
    ],
  });
  const [rowToRemove, setRowToRemove] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // เพิ่มแถวใหม่ใน serviceAreas
  const addRow = () => {
    setFactoryInput(prev => ({
      ...prev,
      serviceAreas: [
        ...prev.serviceAreas,
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
    setFactoryInput(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.map((r, i) =>
        i === idx
          ? {
              ...r,
              [field]: field === 'note' ? value.trim() || '' : value,
            }
          : r
      ),
    }));
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
        newErrors[`rows.${idx}.code`] = `กรุณากรอกรหัสเขตส่งเสริม (แถว ${
          idx + 1
        })`;
      } else {
        if (code.length > 10) {
          newErrors[`rows.${idx}.code`] =
            `รหัสเขตส่งเสริมต้องไม่เกิน 10 ตัวอักษร (แถว ${idx + 1})`;
        }
        if (seenCodes.has(code)) {
          newErrors[`rows.${idx}.code`] = `รหัสเขตส่งเสริมซ้ำกัน (แถว ${
            idx + 1
          })`;
        }
        seenCodes.add(code);
      }

      if (!name) {
        newErrors[`rows.${idx}.name`] = `กรุณาระบุชื่อเขตส่งเสริม (แถว ${
          idx + 1
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

      const reponse = await createFactory(factoryInput);
      console.log(reponse);

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
              <h4 className="card-title">เพิ่มโรงงานและเขตส่งเสริม</h4>
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
                        {(factoryInput.serviceAreas ?? []).map((r, idx) => (
                          <tr key={r.code ?? `s-${idx}`}>
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
                              <GenButtonCircle
                                color={B_LIST.del.color}
                                icon={B_LIST.del.icon}
                                onClick={() => setRowToRemove(idx)}
                              />
                            </td>
                          </tr>
                        ))}
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
                        เพิ่มโรงงาน
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
                  </div>
                  {showConfirm && (
                    <ConfirmAlert
                      title={'ยืนยันการยกเลิก'}
                      text={'คุณต้องการยกเลิกการบันทึกข้อมูลหรือไม่'}
                      action={'cancel'}
                      onConfirm={() => navigate(-1)}
                      onCancel={() => setShowConfirm(false)}
                    />
                  )}
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
    </div>
  );
};

export default ServiceAreaAdd;
