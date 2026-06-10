import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { GenFormText1 } from '@/components/gui/GuiForm';
import {
  getAllFactoriesManagement,
  getFactoryByIdManagement,
  getFactorySummary,
  updateFactoryById,
} from '@/services/api/service-area/FactoryApi';
import {
  deleteServiceAreaById,
  moveServiceAreaById,
  supersedeServiceAreaById,
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
const areaFingerprint = (area: ServiceAreaInputInterface) =>
  JSON.stringify({ code: area.code, name: area.name, note: area.note ?? '' });
const isLockedArea = (area: ServiceAreaInputInterface) =>
  Boolean(area.serviceAreaId && (area.isUsed || area.isActive === false));
const todayIso = () => new Date().toISOString().slice(0, 10);

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
  const [movingServiceAreaId, setMovingServiceAreaId] = useState<number | null>(
    null
  );
  const [supersedingServiceAreaId, setSupersedingServiceAreaId] = useState<
    number | null
  >(null);
  const [factories, setFactories] = useState<FactoryInfoInterface[]>([]);
  const [originalAreas, setOriginalAreas] = useState<Record<number, string>>({});

  const [factoryInput, setFactoryInput] = useState<FactoryUpdateInterface>(
    {} as FactoryUpdateInterface
  );

  useEffect(() => {
    getFactorySummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    getAllFactoriesManagement().then(setFactories).catch(console.error);
  }, []);

  const loadFactory = useCallback(() => {
    return getFactoryByIdManagement(factoryId)
      .then(factory => {
        const activeServiceAreas = factory.serviceAreas.filter(
          (area: ServiceAreaInputInterface) => area.isActive !== false
        );
        setOriginalAreas(
          Object.fromEntries(
            activeServiceAreas.map((area: ServiceAreaInputInterface) => [
              area.serviceAreaId,
              areaFingerprint(area),
            ])
          )
        );
        setFactoryInput({
          name: factory.name,
          initial: factory.initial,
          note: factory.note,
          serviceAreas: activeServiceAreas.map(
            (area: ServiceAreaInputInterface) => ({
              serviceAreaId: area.serviceAreaId,
              clientKey: `existing-${area.serviceAreaId}`,
              code: area.code,
              name: area.name,
              note: area.note,
              isActive: area.isActive,
              isUsed: area.isUsed,
              effectiveFrom: area.effectiveFrom,
              effectiveTo: area.effectiveTo,
              supersededByServiceAreaId: area.supersededByServiceAreaId,
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
    if (isSubmitting || isDeleting || movingServiceAreaId || supersedingServiceAreaId) return;
    setFactoryInput(prev => ({
      ...prev,
      newServiceAreas: [
        ...(prev.newServiceAreas ?? []),
        createEmptyArea(),
      ],
    }));
  };

  const removeRow = (idx: number) => {
    if (isSubmitting || isDeleting || movingServiceAreaId || supersedingServiceAreaId) return;
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
    if (isSubmitting || isDeleting || movingServiceAreaId || supersedingServiceAreaId) return;
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

  const handleMoveServiceArea = async (
    idx: number,
    serviceArea: ServiceAreaInputInterface
  ) => {
    if (
      !serviceArea.serviceAreaId ||
      movingServiceAreaId ||
      supersedingServiceAreaId ||
      isSubmitting ||
      isDeleting
    ) return;
    if (
      originalAreas[serviceArea.serviceAreaId] !== areaFingerprint(serviceArea)
    ) {
      await Swal.fire(
        'กรุณาบันทึกข้อมูลก่อน',
        'มีข้อมูลเขตส่งเสริมที่แก้ไขค้างอยู่ กรุณาบันทึกก่อนย้ายโรงงาน',
        'warning'
      );
      return;
    }

    const targetFactories = factories.filter(
      factory => factory.factoryId !== factoryId
    );
    if (targetFactories.length === 0) {
      await Swal.fire('ไม่สามารถย้ายได้', 'ไม่พบโรงงานปลายทาง', 'warning');
      return;
    }

    const { value: selectedFactoryId } = await Swal.fire({
      icon: 'question',
      title: 'ย้ายเขตส่งเสริม',
      text: `เลือกโรงงานปลายทางสำหรับ ${serviceArea.name}`,
      input: 'select',
      inputOptions: Object.fromEntries(
        targetFactories.map(factory => [
          factory.factoryId,
          `${factory.name} (${factory.initial})`,
        ])
      ),
      inputPlaceholder: 'เลือกโรงงานปลายทาง',
      showCancelButton: true,
      confirmButtonText: 'ถัดไป',
      cancelButtonText: 'ยกเลิก',
      inputValidator: value => (value ? undefined : 'กรุณาเลือกโรงงานปลายทาง'),
    });
    if (!selectedFactoryId) return;

    const targetFactory = targetFactories.find(
      factory => factory.factoryId === Number(selectedFactoryId)
    );
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการย้ายเขตส่งเสริม',
      text: `ย้าย ${serviceArea.name} ไปยัง ${targetFactory?.name ?? 'โรงงานปลายทาง'} หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: 'ยืนยันการย้าย',
      cancelButtonText: 'ยกเลิก',
    });
    if (!confirmation.isConfirmed) return;

    setMovingServiceAreaId(serviceArea.serviceAreaId);
    try {
      await moveServiceAreaById(
        serviceArea.serviceAreaId,
        Number(selectedFactoryId)
      );
      setFactoryInput(prev => ({
        ...prev,
        serviceAreas: prev.serviceAreas.filter((_, areaIdx) => areaIdx !== idx),
      }));
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'ย้ายเขตส่งเสริมเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
      });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message =
        err?.response?.data?.message || 'ไม่สามารถย้ายเขตส่งเสริมได้';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await Swal.fire('ไม่สามารถย้ายได้', errorMessage, 'warning');
    } finally {
      setMovingServiceAreaId(null);
    }
  };

  const handleSupersedeServiceArea = async (
    serviceArea: ServiceAreaInputInterface
  ) => {
    if (
      !serviceArea.serviceAreaId ||
      supersedingServiceAreaId ||
      movingServiceAreaId ||
      isSubmitting ||
      isDeleting
    ) return;

    const targetFactories = factories;
    if (targetFactories.length === 0) {
      await Swal.fire('Cannot create relationship', 'No factories found', 'warning');
      return;
    }

    const { value: selectedFactoryId } = await Swal.fire({
      icon: 'question',
      title: 'Create new relationship',
      text: `Choose the active factory for ${serviceArea.name}`,
      input: 'select',
      inputValue: String(factoryId),
      inputOptions: Object.fromEntries(
        targetFactories.map(factory => [
          factory.factoryId,
          `${factory.name} (${factory.initial})`,
        ])
      ),
      showCancelButton: true,
      confirmButtonText: 'Next',
      cancelButtonText: 'Cancel',
      inputValidator: value => (value ? undefined : 'Choose a factory'),
    });
    if (!selectedFactoryId) return;

    const { value: effectiveFrom } = await Swal.fire({
      icon: 'question',
      title: 'Effective date',
      text: 'The old relationship will close on the day before this date.',
      input: 'date',
      inputValue: todayIso(),
      showCancelButton: true,
      confirmButtonText: 'Review',
      cancelButtonText: 'Cancel',
      inputValidator: value => (value ? undefined : 'Choose an effective date'),
    });
    if (!effectiveFrom) return;

    const targetFactory = targetFactories.find(
      factory => factory.factoryId === Number(selectedFactoryId)
    );
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Confirm new relationship',
      text: `Close the current relationship and create a new active one at ${targetFactory?.name ?? 'target factory'} from ${effectiveFrom}?`,
      showCancelButton: true,
      confirmButtonText: 'Create',
      cancelButtonText: 'Cancel',
    });
    if (!confirmation.isConfirmed) return;

    setSupersedingServiceAreaId(serviceArea.serviceAreaId);
    try {
      await supersedeServiceAreaById(serviceArea.serviceAreaId, {
        targetFactoryId: Number(selectedFactoryId),
        effectiveFrom,
        code: serviceArea.code,
        name: serviceArea.name,
        note: serviceArea.note,
      });
      await loadFactory();
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Created the new active promotion-zone relationship.',
        confirmButtonText: 'OK',
      });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message =
        err?.response?.data?.message || 'Cannot create new relationship';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await Swal.fire('Cannot create relationship', errorMessage, 'warning');
    } finally {
      setSupersedingServiceAreaId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isDeleting || movingServiceAreaId || supersedingServiceAreaId) return;
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
      if (isLockedArea(r)) return;
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
                        <th style={{ width: 120 }}>สถานะ</th>
                        <th style={{ width: 150 }}>
                          <GenButtonCircle
                            color={B_LIST.add.color}
                            icon={B_LIST.add.icon}
                            onClick={addRow}
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ...(factoryInput.serviceAreas ?? []),
                        ...(factoryInput.newServiceAreas ?? []),
                      ].map((r, idx) => {
                        const key = r.clientKey ?? `existing-${r.serviceAreaId}`;
                        const locked = isLockedArea(r);
                        const canMove = Boolean(r.serviceAreaId && !locked);
                        const canSupersede = Boolean(
                          r.serviceAreaId && r.isUsed
                        );
                        return (
                          <tr key={key}>
                            <td>
                              <input
                                type="text"
                                className={`form-control ${errors[`rows.${idx}.code`] ? 'is-invalid' : ''}`}
                                value={r.code ?? ''}
                                disabled={locked}
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
                                disabled={locked}
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
                                disabled={locked}
                                onChange={e =>
                                  updateRow(idx, 'note', e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-1">
                                <span className="badge bg-success">
                                  Active
                                </span>
                                {r.serviceAreaId && (
                                  <span
                                    className={`badge ${r.isUsed ? 'bg-warning text-dark' : 'bg-info'}`}
                                  >
                                    {r.isUsed ? 'Used' : 'Unused'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                {canMove && (
                                  <button
                                    type="button"
                                    className="btn btn-icon btn-round btn-info"
                                    title="ย้ายเขตส่งเสริมไปโรงงานอื่น"
                                    disabled={
                                      Boolean(movingServiceAreaId) ||
                                      Boolean(supersedingServiceAreaId) ||
                                      isSubmitting ||
                                      isDeleting
                                    }
                                    onClick={() =>
                                      handleMoveServiceArea(idx, r)
                                    }
                                  >
                                    <i className="fas fa-exchange-alt" />
                                  </button>
                                )}
                                {canSupersede && (
                                  <button
                                    type="button"
                                    className="btn btn-icon btn-round btn-warning"
                                    title="สร้างความสัมพันธ์ใหม่"
                                    disabled={
                                      Boolean(movingServiceAreaId) ||
                                      Boolean(supersedingServiceAreaId) ||
                                      isSubmitting ||
                                      isDeleting
                                    }
                                    onClick={() =>
                                      handleSupersedeServiceArea(r)
                                    }
                                  >
                                    <i className="fas fa-copy" />
                                  </button>
                                )}
                                {!locked && (
                                  <GenButtonCircle
                                    color={B_LIST.del.color}
                                    icon={B_LIST.del.icon}
                                    onClick={() => {
                                      if (
                                        isSubmitting ||
                                        isDeleting ||
                                        movingServiceAreaId ||
                                        supersedingServiceAreaId
                                      ) return;
                                      if (r.serviceAreaId) {
                                        setDeleteTargetId(idx);
                                      } else {
                                        setRowToRemove(idx);
                                      }
                                    }}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="private-action-footer mt-4 d-flex justify-content-between">
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{ width: 150 }}
                    disabled={
                      isSubmitting ||
                      isDeleting ||
                      Boolean(movingServiceAreaId) ||
                      Boolean(supersedingServiceAreaId)
                    }
                  >
                    แก้ไขโรงงาน
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
          text="คุณต้องการลบเขตส่งเสริมนี้หรือไม่?"
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

