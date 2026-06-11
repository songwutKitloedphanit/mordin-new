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
    accent: '#18a05c',
    unit: 'โรงงาน',
  },
  {
    key: 'totalServiceAres' as keyof FactorySummary,
    label: 'เขตส่งเสริมทั้งหมด',
    icon: 'fas fa-map-marker-alt',
    accent: '#3b9bd9',
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
      serviceAreas: [...prev.serviceAreas, createEmptyArea()],
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
      {/* Page Header / Breadcrumbs */}
      <div className="d-flex align-items-left align-items-md-center flex-column flex-md-row mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-1">จัดการโรงงานและเขตส่งเสริม</h2>
          <ul
            className="breadcrumbs mb-0 d-flex gap-2 list-unstyled align-items-center"
            style={{ fontSize: '0.85rem' }}
          >
            <li className="nav-home">
              <a href="/admin/dashboard" className="text-primary">
                <i className="fas fa-home" />
              </a>
            </li>
            <li className="separator text-muted">/</li>
            <li className="nav-item">
              <a href="/admin/service-area" className="text-primary">
                โรงงาน & เขตส่งเสริม
              </a>
            </li>
            <li className="separator text-muted">/</li>
            <li className="nav-item text-muted">เพิ่มโรงงาน</li>
          </ul>
        </div>
      </div>

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
        <div className="col-12">
          <div className="private-card shadow-sm border-0">
            <div className="private-card-header d-flex align-items-center justify-content-between p-4 border-bottom">
              <h4 className="private-card-title mb-0 fw-bold d-flex align-items-center gap-2">
                <i className="fas fa-plus-circle text-primary" />
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
            <div className="private-card-body p-4">
              <form onSubmit={handleSubmit} noValidate>
                {/* Factory Info Section */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <GenFormText1
                      isRequired
                      id="factoryName"
                      name="factoryName"
                      label="ชื่อโรงงาน"
                      placeholder="ระบุชื่อโรงงาน เช่น โรงงานน้ำตาลมิตรผล"
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
                      placeholder="3-4 ตัวอักษร เช่น MPT"
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
                      label="หมายเหตุโรงงาน"
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

                {/* Service Areas Section Title */}
                <div className="d-flex align-items-center justify-content-between mb-3 mt-4 pt-3 border-top">
                  <h5 className="fw-bold mb-0 text-dark">
                    <i className="fas fa-map-marked-alt text-primary me-2" />
                    รายการเขตส่งเสริมที่จะเพิ่ม
                  </h5>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                    onClick={addRow}
                    style={{ borderRadius: '8px', padding: '6px 14px' }}
                  >
                    <i className="fas fa-plus" />
                    เพิ่มแถวเขตส่งเสริม
                  </button>
                </div>

                {/* Service Areas Table */}
                <div className="table-responsive">
                  <table
                    className="table table-hover align-middle border"
                    style={{ borderRadius: '10px', overflow: 'hidden' }}
                  >
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '220px' }}>รหัสเขตส่งเสริม</th>
                        <th style={{ minWidth: '220px' }}>ชื่อเขตส่งเสริม</th>
                        <th style={{ minWidth: '180px' }}>หมายเหตุ</th>
                        <th style={{ width: '150px' }} className="text-center">
                          สถานะ
                        </th>
                        <th style={{ width: '80px' }} className="text-center">
                          การจัดการ
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
                              placeholder="รหัส เช่น KSL-01"
                              onChange={e =>
                                updateRow(
                                  idx,
                                  'code',
                                  e.target.value.toUpperCase()
                                )
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
                              placeholder="ระบุชื่อเขตส่งเสริม"
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
                              placeholder="-"
                              onChange={e =>
                                updateRow(idx, 'note', e.target.value)
                              }
                            />
                          </td>
                          <td className="text-center">
                            <span
                              className="badge bg-info-subtle text-info border border-info-subtle"
                              style={{ fontSize: '11px', padding: '4px 10px' }}
                            >
                              รายการใหม่
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: '32px', height: '32px' }}
                              title="ลบแถว"
                              onClick={() => setRowToRemove(idx)}
                            >
                              <i className="fas fa-trash-alt" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!factoryInput.serviceAreas?.length && (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-4 text-muted italic"
                          >
                            <i className="fas fa-folder-open me-2" />
                            ไม่มีเขตส่งเสริมที่จะเพิ่ม กรุณากด
                            "เพิ่มแถวเขตส่งเสริม"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Form Action Buttons */}
                <div className="private-action-footer mt-5 d-flex justify-content-end gap-2 border-top pt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setShowConfirm(true)}
                    disabled={isSubmitting}
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success px-4 d-flex align-items-center gap-2"
                    disabled={isSubmitting}
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save" />
                        บันทึกข้อมูล
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Alerts */}
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
