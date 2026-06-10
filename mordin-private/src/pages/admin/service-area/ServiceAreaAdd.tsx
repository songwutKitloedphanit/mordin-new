import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { GenFormText1 } from '@/components/gui/GuiForm';
import {
  createFactory,
  getFactorySummary,
} from '@/services/api/service-area/FactoryApi';
import {
  FactoryCreateInterface,
  FactorySummary,
} from '@/types/service-area/Factories';
import { ServiceAreaInputInterface } from '@/types/service-area/ServiceAreas';

const KPI_CONFIG = [
  {
    key: 'totalFactories' as keyof FactorySummary,
    label: 'โรงงานทั้งหมด',
    icon: 'fas fa-archway',
    accent: '#31CE36',
    unit: 'โรงงาน',
  },
  {
    key: 'totalServiceAres' as keyof FactorySummary,
    label: 'เขตส่งเสริมทั้งหมด',
    icon: 'fas fa-map-marker-alt',
    accent: '#337AB7',
    unit: 'เขต',
  },
];

let nextRowId = 0;
const createEmptyArea = () => ({
  clientKey: `new-${++nextRowId}`,
  code: '',
  name: '',
  note: '',
});

const ServiceAreaAdd: React.FC = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<FactorySummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rowToRemove, setRowToRemove] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [factoryInput, setFactoryInput] = useState<FactoryCreateInterface>({
    name: '',
    initial: '',
    note: '',
    serviceAreas: [createEmptyArea()],
  });

  useEffect(() => {
    getFactorySummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, []);

  const addRow = () => {
    setFactoryInput(prev => ({
      ...prev,
      serviceAreas: [
        ...prev.serviceAreas,
        createEmptyArea(),
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
          ? { ...r, [field]: field === 'note' ? value.trim() || '' : value }
          : r
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const newErrors: Record<string, string> = {};

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

    factoryInput.serviceAreas.forEach((r, idx) => {
      const code = r.code.trim().toUpperCase();
      const name = r.name.trim();

      if (!code) {
        newErrors[`rows.${idx}.code`] =
          `กรุณากรอกรหัสเขตส่งเสริม (แถว ${idx + 1})`;
      } else {
        if (code.length > 10)
          newErrors[`rows.${idx}.code`] =
            `รหัสเขตส่งเสริมต้องไม่เกิน 10 ตัวอักษร (แถว ${idx + 1})`;
      }

      if (!name) {
        newErrors[`rows.${idx}.name`] =
          `กรุณาระบุชื่อเขตส่งเสริม (แถว ${idx + 1})`;
      } else if (name.length > 45) {
        newErrors[`rows.${idx}.name`] =
          `ชื่อเขตส่งเสริมต้องไม่เกิน 45 ตัวอักษร (แถว ${idx + 1})`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setIsSubmitting(true);
    try {
      await createFactory(factoryInput);
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'เพิ่มโรงงานและเขตส่งเสริมเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
        timer: 2000,
        timerProgressBar: true,
      });
      navigate('/admin/service-area');
    } catch (error: unknown) {
      console.error(error);
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message =
        err?.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {KPI_CONFIG.map(cfg => {
          const value = summary?.[cfg.key] ?? 0;
          return (
            <div key={cfg.key} className="col-sm-6 col-lg-4">
              {summaryLoading ? (
                <div
                  className="private-metric-card h-100"
                  style={{ borderLeft: '4px solid rgba(128,128,128,0.2)' }}
                >
                  <div className="private-card-body py-3 px-4">
                    <div className="placeholder-glow mb-2">
                      <span
                        className="placeholder d-block rounded"
                        style={{ height: 11, width: '60%' }}
                      />
                    </div>
                    <div className="placeholder-glow">
                      <span
                        className="placeholder d-block rounded"
                        style={{ height: 32, width: '40%' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="private-metric-card h-100"
                  style={{ borderLeft: `4px solid ${cfg.accent}` }}
                >
                  <div className="private-card-body py-3 px-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span
                        className="text-muted fw-semibold text-uppercase"
                        style={{ fontSize: '0.7rem', letterSpacing: '0.6px' }}
                      >
                        {cfg.label}
                      </span>
                      <i
                        className={cfg.icon}
                        style={{
                          color: cfg.accent,
                          fontSize: '1.1rem',
                          opacity: 0.75,
                        }}
                      />
                    </div>
                    <div className="d-flex align-items-baseline gap-2">
                      <span
                        className="fw-bold"
                        style={{ fontSize: '2rem', lineHeight: 1.1 }}
                      >
                        {value}
                      </span>
                      <span
                        className="text-muted"
                        style={{ fontSize: '0.78rem' }}
                      >
                        {cfg.unit}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-archway me-2" />
                เพิ่มโรงงานและเขตส่งเสริม
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle
                  color={B_LIST.list.color}
                  icon={B_LIST.list.icon}
                  link="/admin/service-area"
                />
              </div>
            </div>
            <div className="private-card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <div className="col-md-6">
                    <GenFormText1
                      isRequired
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
                  </div>
                  <div className="col-md-3">
                    <GenFormText1
                      isRequired
                      id="initial"
                      name="initial"
                      label="ชื่อย่อโรงงาน"
                      placeholder="3-4 ตัวอักษร"
                      value={factoryInput.initial ?? ''}
                      onChange={e =>
                        setFactoryInput(prev => ({
                          ...prev,
                          initial: e.target.value,
                        }))
                      }
                      errorMessage={errors.initial}
                    />
                  </div>
                  <div className="col-md-3">
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
                  </div>
                </div>

                <div className="table-responsive mt-2">
                  <table className="table table-bordered w-100">
                    <thead>
                      <tr>
                        <th>รหัสเขตส่งเสริม</th>
                        <th>ชื่อเขตส่งเสริม</th>
                        <th>หมายเหตุ</th>
                        <th style={{ width: 60 }}>
                          <GenButtonCircle
                            color={B_LIST.add.color}
                            icon={B_LIST.add.icon}
                            onClick={addRow}
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(factoryInput.serviceAreas ?? []).map((r, idx) => (
                        <tr key={r.clientKey}>
                          <td>
                            <input
                              type="text"
                              className={`form-control ${errors[`rows.${idx}.code`] ? 'is-invalid' : ''}`}
                              value={r.code ?? ''}
                              onChange={e =>
                                updateRow(idx, 'code', e.target.value)
                              }
                            />
                            {errors[`rows.${idx}.code`] && (
                              <div className="invalid-feedback">
                                {errors[`rows.${idx}.code`]}
                              </div>
                            )}
                          </td>
                          <td>
                            <input
                              className={`form-control ${errors[`rows.${idx}.name`] ? 'is-invalid' : ''}`}
                              value={r.name ?? ''}
                              onChange={e =>
                                updateRow(idx, 'name', e.target.value)
                              }
                            />
                            {errors[`rows.${idx}.name`] && (
                              <div className="invalid-feedback">
                                {errors[`rows.${idx}.name`]}
                              </div>
                            )}
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

                <div className="private-action-footer mt-4 d-flex justify-content-between">
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{ width: 150 }}
                    disabled={isSubmitting}
                  >
                    เพิ่มโรงงาน
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ width: 150 }}
                    onClick={() => setShowConfirm(true)}
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ยืนยันการยกเลิก"
          text="คุณต้องการยกเลิกการบันทึกข้อมูลหรือไม่?"
          action="cancel"
          onConfirm={() => {
            navigate('/admin/service-area');
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

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
    </>
  );
};

export default ServiceAreaAdd;

