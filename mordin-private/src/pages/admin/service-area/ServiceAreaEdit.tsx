import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { GenFormText1 } from '@/components/gui/GuiForm';
import {
  getAllFactories,
  getFactoryByIdManagement,
  getFactorySummary,
  updateFactoryById,
} from '@/services/api/service-area/FactoryApi';
import {
  deleteServiceAreaById,
  moveServiceArea,
} from '@/services/api/service-area/ServiceAreaApi';
import {
  FactoryInfoInterface,
  FactorySummary,
  FactoryUpdateInterface,
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

const ServiceAreaEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const factoryId = Number(id);

  const [summary, setSummary] = useState<FactorySummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rowToRemove, setRowToRemove] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Factories list for move zone action
  const [allFactories, setAllFactories] = useState<FactoryInfoInterface[]>([]);

  // Move Modal State
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [zoneToMove, setZoneToMove] = useState<any>(null);
  const [targetFactoryId, setTargetFactoryId] = useState<number | null>(null);

  // Supersede Modal State
  const [supersedeModalOpen, setSupersedeModalOpen] = useState(false);
  const [zoneToSupersede, setZoneToSupersede] = useState<any>(null);
  const [supersedeCode, setSupersedeCode] = useState('');
  const [supersedeName, setSupersedeName] = useState('');
  const [supersedeNote, setSupersedeNote] = useState('');

  const [factoryInput, setFactoryInput] = useState<FactoryUpdateInterface>(
    {} as FactoryUpdateInterface
  );

  useEffect(() => {
    getFactorySummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));

    getAllFactories().then(setAllFactories).catch(console.error);
  }, []);

  const loadFactory = useCallback(() => {
    return getFactoryByIdManagement(factoryId)
      .then(factory => {
        setFactoryInput({
          name: factory.name,
          initial: factory.initial,
          note: factory.note,
          serviceAreas: (factory.serviceAreas ?? []).map(
            (area: ServiceAreaInputInterface & { isUsed?: boolean }) => ({
              serviceAreaId: area.serviceAreaId,
              clientKey: `existing-${area.serviceAreaId}`,
              code: area.code,
              name: area.name,
              note: area.note,
              isUsed: area.isUsed ?? false,
            })
          ),
        });
      })
      .catch(console.error);
  }, [factoryId]);

  useEffect(() => {
    loadFactory();
  }, [loadFactory]);

  const addRow = () => {
    if (isSubmitting || isDeleting) return;
    setFactoryInput(prev => ({
      ...prev,
      newServiceAreas: [...(prev.newServiceAreas ?? []), createEmptyArea()],
    }));
  };

  const removeRow = (idx: number) => {
    if (isSubmitting || isDeleting) return;
    setFactoryInput(prev => {
      const oldCount = prev.serviceAreas?.length ?? 0;
      if (idx < oldCount) {
        return {
          ...prev,
          serviceAreas: prev.serviceAreas.filter((_, i) => i !== idx),
        };
      }
      const newIdx = idx - oldCount;
      return {
        ...prev,
        newServiceAreas: (prev.newServiceAreas ?? []).filter(
          (_, i) => i !== newIdx
        ),
      };
    });
  };

  const updateRow = (
    idx: number,
    field: keyof ServiceAreaInputInterface,
    value: string
  ) => {
    setFactoryInput(prev => {
      const oldCount = prev.serviceAreas?.length ?? 0;
      if (idx < oldCount) {
        const updatedOld = [...prev.serviceAreas];
        updatedOld[idx] = {
          ...updatedOld[idx],
          [field]: field === 'note' ? value.trim() || '' : value,
        };
        return { ...prev, serviceAreas: updatedOld };
      }
      const newIdx = idx - oldCount;
      const updatedNew = [...(prev.newServiceAreas ?? [])];
      updatedNew[newIdx] = {
        ...updatedNew[newIdx],
        [field]: field === 'note' ? value.trim() || '' : value,
      };
      return { ...prev, newServiceAreas: updatedNew };
    });
  };

  const handleDeleteServiceArea = async (
    idx: number,
    serviceAreaId: number
  ) => {
    if (isSubmitting || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteServiceAreaById(serviceAreaId);
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'ลบเขตส่งเสริมเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
      });
      setFactoryInput(prev => ({
        ...prev,
        serviceAreas: prev.serviceAreas.filter((_, i) => i !== idx),
      }));
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const message =
        error?.response?.data?.message || 'เกิดข้อผิดพลาดในการลบเขตส่งเสริม';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await Swal.fire('ไม่สามารถลบได้', errorMessage, 'warning');
    } finally {
      setDeleteTargetId(null);
      setIsDeleting(false);
    }
  };

  const handleMoveClick = (zone: any) => {
    setZoneToMove(zone);
    setTargetFactoryId(null);
    setMoveModalOpen(true);
  };

  const handleMoveConfirm = async () => {
    if (!zoneToMove || !targetFactoryId) return;
    setIsSubmitting(true);
    try {
      await moveServiceArea(zoneToMove.serviceAreaId, targetFactoryId);
      setMoveModalOpen(false);
      await Swal.fire({
        icon: 'success',
        title: 'ย้ายเขตสำเร็จ',
        text: `ย้ายเขต ${zoneToMove.code} ไปยังโรงงานเป้าหมายเรียบร้อยแล้ว`,
        confirmButtonText: 'ตกลง',
      });
      loadFactory();
    } catch (error: unknown) {
      console.error(error);
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message = err?.response?.data?.message || 'ไม่สามารถย้ายเขตได้';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupersedeClick = (zone: any) => {
    setZoneToSupersede(zone);
    setSupersedeCode('');
    setSupersedeName('');
    setSupersedeNote('');
    setSupersedeModalOpen(true);
  };

  const handleSupersedeConfirm = () => {
    if (!supersedeCode.trim() || !supersedeName.trim()) return;

    setFactoryInput(prev => ({
      ...prev,
      newServiceAreas: [
        ...(prev.newServiceAreas ?? []),
        {
          clientKey: `supersede-${++nextRowId}`,
          code: supersedeCode.trim().toUpperCase(),
          name: supersedeName.trim(),
          note: supersedeNote.trim() || `ทดแทน ${zoneToSupersede?.code}`,
        },
      ],
    }));

    setSupersedeModalOpen(false);
    setSupersedeCode('');
    setSupersedeName('');
    setSupersedeNote('');

    Swal.fire({
      icon: 'success',
      title: 'เพิ่มรายการแล้ว',
      text: 'เพิ่มรายการเขตส่งเสริมใหม่สำหรับแทนที่ลงในตารางเรียบร้อยแล้ว กรุณาตรวจสอบและกดปุ่ม "แก้ไขโรงงาน" เพื่อบันทึกการเปลี่ยนแปลง',
      confirmButtonText: 'ตกลง',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isDeleting) return;
    const newErrors: Record<string, string> = {};

    if (!factoryInput.name?.trim()) {
      newErrors.name = 'กรุณาระบุชื่อโรงงาน';
    } else if (factoryInput.name.trim().length > 100) {
      newErrors.name = 'ชื่อโรงงานต้องไม่เกิน 100 ตัวอักษร';
    }

    if (!factoryInput.initial?.trim()) {
      newErrors.initial = 'กรุณาระบุชื่อย่อโรงงาน';
    } else if (
      factoryInput.initial.trim().length > 4 ||
      factoryInput.initial.trim().length < 3
    ) {
      newErrors.initial = 'ชื่อย่อต้องมีจำนวน 3-4 ตัวอักษร';
    }

    [
      ...(factoryInput.serviceAreas ?? []),
      ...(factoryInput.newServiceAreas ?? []),
    ].forEach((r, idx) => {
      const code = r.code.trim().toUpperCase();
      const name = r.name.trim();

      if (!code) {
        newErrors[`rows.${idx}.code`] =
          `กรุณากรอกรหัสเขตส่งเสริม (แถว ${idx + 1})`;
      } else if (code.length > 10) {
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
      await updateFactoryById(factoryId, factoryInput);
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'แก้ไขโรงงานและเขตส่งเสริมเรียบร้อยแล้ว',
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
            <li className="nav-item text-muted">แก้ไขโรงงาน</li>
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
                <i className="fas fa-edit text-primary" />
                แก้ไขโรงงานและเขตส่งเสริม
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

                {/* Service Areas Management Title */}
                <div className="d-flex align-items-center justify-content-between mb-3 mt-4 pt-3 border-top">
                  <h5 className="fw-bold mb-0 text-dark">
                    <i className="fas fa-map-marked-alt text-primary me-2" />
                    รายการเขตส่งเสริม
                  </h5>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                    onClick={addRow}
                    style={{ borderRadius: '8px', padding: '6px 14px' }}
                  >
                    <i className="fas fa-plus" />
                    เพิ่มเขตส่งเสริม
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
                        <th style={{ width: '180px' }}>รหัสเขตส่งเสริม</th>
                        <th style={{ minWidth: '200px' }}>ชื่อเขตส่งเสริม</th>
                        <th style={{ minWidth: '150px' }}>หมายเหตุ</th>
                        <th style={{ width: '190px' }} className="text-center">
                          สถานะการใช้งาน
                        </th>
                        <th style={{ width: '180px' }} className="text-center">
                          การจัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          ...(factoryInput.serviceAreas ?? []),
                          ...(factoryInput.newServiceAreas ?? []),
                        ] as any[]
                      ).map((r, idx) => {
                        const key =
                          r.clientKey ?? `existing-${r.serviceAreaId}`;
                        const isExisting = !!r.serviceAreaId;
                        const isUsed = isExisting ? !!r.isUsed : false;

                        return (
                          <tr key={key}>
                            <td>
                              <input
                                type="text"
                                className={`form-control ${errors[`rows.${idx}.code`] ? 'is-invalid' : ''} ${isUsed ? 'bg-light fw-bold text-dark' : ''}`}
                                value={r.code ?? ''}
                                placeholder="รหัส เช่น KSL-01"
                                disabled={isUsed}
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
                              <div className="d-flex flex-column gap-1 align-items-center">
                                {/* Active Status */}
                                <span
                                  className="badge bg-success-subtle text-success border border-success-subtle"
                                  style={{
                                    fontSize: '11px',
                                    padding: '3px 8px',
                                  }}
                                >
                                  Active
                                </span>
                                {/* Used Status */}
                                {isExisting ? (
                                  isUsed ? (
                                    <span
                                      className="badge bg-warning-subtle text-warning border border-warning-subtle"
                                      style={{
                                        fontSize: '10px',
                                        padding: '2px 6px',
                                      }}
                                    >
                                      <i className="fas fa-lock me-1" />
                                      มีข้อมูลผูกอยู่ (Used)
                                    </span>
                                  ) : (
                                    <span
                                      className="badge bg-success-subtle text-success border border-success-subtle"
                                      style={{
                                        fontSize: '10px',
                                        padding: '2px 6px',
                                      }}
                                    >
                                      <i className="fas fa-unlock me-1" />
                                      ยังไม่ได้ผูกข้อมูล
                                    </span>
                                  )
                                ) : (
                                  <span
                                    className="badge bg-info-subtle text-info border border-info-subtle"
                                    style={{
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                    }}
                                  >
                                    รายการใหม่
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="d-flex align-items-center justify-content-center gap-1.5">
                                {/* Move Action */}
                                {isExisting && !isUsed && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '32px', height: '32px' }}
                                    title="ย้ายโรงงาน"
                                    onClick={() => handleMoveClick(r)}
                                  >
                                    <i className="fas fa-exchange-alt" />
                                  </button>
                                )}

                                {/* Supersede Action */}
                                {isExisting && isUsed && (
                                  <button
                                    type="button"
                                    className="btn btn-warning btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '32px', height: '32px' }}
                                    title="สร้างรุ่นใหม่แทนที่"
                                    onClick={() => handleSupersedeClick(r)}
                                  >
                                    <i className="fas fa-history text-dark" />
                                  </button>
                                )}

                                {/* Delete / Remove Action */}
                                <button
                                  type="button"
                                  className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center ${isUsed ? 'btn-light text-muted' : 'btn-outline-danger'}`}
                                  style={{ width: '32px', height: '32px' }}
                                  disabled={isUsed}
                                  title={
                                    isUsed
                                      ? 'ไม่สามารถลบได้เนื่องจากมีข้อมูลผูกอยู่'
                                      : 'ลบแถว'
                                  }
                                  onClick={() => {
                                    if (isSubmitting || isDeleting) return;
                                    if (isUsed) return;
                                    if (r.serviceAreaId) {
                                      setDeleteTargetId(idx);
                                    } else {
                                      setRowToRemove(idx);
                                    }
                                  }}
                                >
                                  <i className="fas fa-trash-alt" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {!factoryInput.serviceAreas?.length &&
                        !factoryInput.newServiceAreas?.length && (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center py-4 text-muted italic"
                            >
                              <i className="fas fa-folder-open me-2" />
                              ไม่มีเขตส่งเสริมในโรงงานนี้ กรุณากด
                              "เพิ่มเขตส่งเสริม"
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
                    disabled={isSubmitting || isDeleting}
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success px-4 d-flex align-items-center gap-2"
                    disabled={isSubmitting || isDeleting}
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

      {/* Move Zone Modal */}
      {moveModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: '15px' }}
            >
              <div
                className="modal-header bg-primary text-white"
                style={{
                  borderTopLeftRadius: '15px',
                  borderTopRightRadius: '15px',
                }}
              >
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-exchange-alt me-2" />
                  ย้ายเขตส่งเสริม
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMoveModalOpen(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="text-muted">
                  ย้ายเขตส่งเสริม{' '}
                  <b>
                    {zoneToMove?.code} - {zoneToMove?.name}
                  </b>{' '}
                  ไปยังโรงงานอื่น:
                </p>
                <div className="form-group mb-3">
                  <label className="form-label fw-semibold">
                    เลือกโรงงานปลายทาง
                  </label>
                  <select
                    className="form-select"
                    value={targetFactoryId || ''}
                    onChange={e => setTargetFactoryId(Number(e.target.value))}
                  >
                    <option value="">-- เลือกโรงงาน --</option>
                    {allFactories
                      .filter(f => f.factoryId !== factoryId)
                      .map(f => (
                        <option key={f.factoryId} value={f.factoryId}>
                          {f.name} ({f.initial})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div
                className="modal-footer border-0 p-3 bg-light"
                style={{
                  borderBottomLeftRadius: '15px',
                  borderBottomRightRadius: '15px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setMoveModalOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  disabled={!targetFactoryId || isSubmitting}
                  onClick={handleMoveConfirm}
                >
                  {isSubmitting ? 'กำลังย้าย...' : 'ยืนยันการย้าย'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supersede Modal */}
      {supersedeModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: '15px' }}
            >
              <div
                className="modal-header bg-warning text-dark"
                style={{
                  borderTopLeftRadius: '15px',
                  borderTopRightRadius: '15px',
                }}
              >
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-history me-2 text-dark" />
                  สร้างรุ่นใหม่แทนที่เขตส่งเสริม
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSupersedeModalOpen(false)}
                />
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-warning small mb-3">
                  <i className="fas fa-exclamation-triangle me-2" />
                  เขตส่งเสริมเดิม (<b>{zoneToSupersede?.code}</b>)
                  ถูกใช้งานในระบบแล้ว เพื่อไม่ให้กระทบข้อมูลทางสถิติย้อนหลัง
                  ระบบจะสร้างเขตส่งเสริมตัวใหม่ขึ้นมาทดแทน
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    รหัสเขตส่งเสริมใหม่ <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น KSL-01A"
                    value={supersedeCode}
                    onChange={e =>
                      setSupersedeCode(e.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    ชื่อเขตส่งเสริมใหม่ <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ระบุชื่อเขตส่งเสริม"
                    value={supersedeName}
                    onChange={e => setSupersedeName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">หมายเหตุ</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="หมายเหตุเพิ่มเติม"
                    value={supersedeNote}
                    onChange={e => setSupersedeNote(e.target.value)}
                  />
                </div>
              </div>
              <div
                className="modal-footer border-0 p-3 bg-light"
                style={{
                  borderBottomLeftRadius: '15px',
                  borderBottomRightRadius: '15px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSupersedeModalOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn-warning fw-bold text-dark px-4"
                  disabled={!supersedeCode.trim() || !supersedeName.trim()}
                  onClick={handleSupersedeConfirm}
                >
                  สร้างแทนที่
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Alerts */}
      {showConfirm && (
        <ConfirmAlert
          title="ยืนยันการยกเลิก"
          text="คุณต้องการยกเลิกการแก้ไขข้อมูลหรือไม่?"
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

      {deleteTargetId !== null && (
        <ConfirmAlert
          title="ยืนยันการลบเขตส่งเสริม"
          text="คุณต้องการลบเขตส่งเสริมนี้ออกจากฐานข้อมูลหรือไม่?"
          action="delete"
          onConfirm={() => {
            const area = factoryInput.serviceAreas[deleteTargetId];
            if (area?.serviceAreaId) {
              handleDeleteServiceArea(deleteTargetId, area.serviceAreaId);
            }
          }}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </>
  );
};

export default ServiceAreaEdit;
