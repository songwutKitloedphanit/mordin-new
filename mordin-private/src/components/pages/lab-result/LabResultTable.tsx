import React, { useState } from 'react';
import Swal from 'sweetalert2';

import PrintQrCode from './PrintQrCode';

// import ConfirmAlert from '@/components/gui/ConfirmAlert';
import DataTableWrapper from '@/components/gui/DataTableWrapper';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { LabelProps } from '@/components/printable/Label';
import { Laboratory, MachineTypeTypes } from '@/types/Laboratory';
import { QrCode } from '@/types/qr-code/QrCode';
import { ResultInput } from '@/types/result/Result';
import { sampleBlankResultInfo } from '@/types/sample-blank/sampleBlankResult';

interface prinLabQrCode {
  qrCode: QrCode;
  result: sampleBlankResultInfo[];
}

interface LabResultTableProps {
  data: Array<{
    qrCode: QrCode;
    result: sampleBlankResultInfo[];
  }>;
  tableId: string;
  title: string;
  subtitle: string;
  loading: boolean;
  laboratoryData: Laboratory[];
  onAddPreValueClick?: (payload: {
    qrCode: QrCode;
    result: sampleBlankResultInfo;
  }) => void;
  handleSubmitPreValue?: (resultValue: ResultInput[]) => void | Promise<void>;
}

const LabResultTable: React.FC<LabResultTableProps> = ({
  data,
  tableId,
  title,
  subtitle,
  laboratoryData,
  // onAddPreValueClick,
  loading,
  handleSubmitPreValue,
}) => {
  // สำหรับ modal

  const [showModal, setShowModal] = useState(false);
  const [editingSampleCode, setEditingSampleCode] = useState<string | null>(
    null
  );
  const [editedResults, setEditedResults] = useState<
    {
      unitBefore: string | null;
      shortNameBefore: string | null;
      resultId: number | null;
      preValue: number | null;
    }[]
  >([]);
  const [originalResults, setOriginalResults] = useState<
    {
      unitBefore: string | null;
      shortNameBefore: string | null;
      resultId: number | null;
      preValue: number | null;
    }[]
  >([]);
  const [editedDirtWeight, setEditedDirtWeight] = useState<
    {
      id: number | null;
      qrCodeId: number | null;
      value: number | null;
      fieldName: string | null;
      showText: string | null;
    }[]
  >([]);
  const [originalDirtWeight, setOriginalDirtWeight] = useState<
    {
      id: number | null;
      qrCodeId: number | null;
      value: number | null;
      fieldName: string | null;
      showText: string | null;
    }[]
  >([]);
  const [inlineValues, setInlineValues] = useState<Record<number, string>>({});
  const [savingInlineIds, setSavingInlineIds] = useState<Set<number>>(
    () => new Set()
  );

  // const [showConfirm, setShowConfirm] = useState(false);

  // ฟอร์แมตเลขทศนิยม
  const formatDecimal = (value: number): string => {
    return parseFloat(value.toFixed(3)).toString();
  };

  const fallbackGradeColor = '#94a3b8';

  // เปิด modal แก้ไขข้อมูล preValue
  const openEditModal = (
    sampleCode: string,
    row: {
      qrCode: QrCode;
      result: sampleBlankResultInfo[];
    },
    type: string
  ) => {
    setEditingSampleCode(sampleCode);
    const rowResults: sampleBlankResultInfo[] = row.result;
    const initValues: {
      unitBefore: string | null;
      shortNameBefore: string | null;
      resultId: number | null;
      preValue: number | null;
    }[] = rowResults.map(result => ({
      unitBefore: result.laboratorySetting.laboratory.unitBefore,
      shortNameBefore: result.laboratorySetting.laboratory.shortNameBefore,
      resultId: result.resultId,
      preValue: result.preValue ?? 0,
    }));

    const initDirtValues: {
      id: number | null;
      qrCodeId: number | null;
      value: number | null;
      fieldName: string | null;
      showText: string | null;
    }[] = [];

    if (type === 'edit') {
      initDirtValues.push({
        id: 1,
        qrCodeId: row.qrCode.qrCodeId,
        value: row.qrCode.dirtWeightMehlich,
        fieldName: 'dirtWeightMehlich',
        showText: 'น้ำหนักดิน Mehlich',
      });

      initDirtValues.push({
        id: 2,
        qrCodeId: row.qrCode.qrCodeId,
        value: row.qrCode.dirtWeightOm,
        fieldName: 'dirtWeightOm',
        showText: 'น้ำหนักดิน OM',
      });
    }

    setOriginalDirtWeight(initDirtValues);
    setEditedDirtWeight(initDirtValues);
    setOriginalResults(initValues);
    setEditedResults(initValues);
    setShowModal(true);
  };

  // ปิด modal
  const closeModal = () => {
    setShowModal(false);
    setEditingSampleCode(null);
    setEditedResults([]);
  };

  const getRealisticPreValue = (
    shortNameBefore: string | null,
    currentValue: number | null,
    index: number
  ) => {
    const lab = (shortNameBefore ?? '').trim().toLowerCase();
    const fallbackValues = [6.4, 0.34, 0.082, 0.186, 38, 720, 48, 12];
    const valueByLab: Record<string, number> = {
      ph: 6.4,
      ec: 0.34,
      om: 0.082,
      p: 0.186,
      mg: 38,
      ca: 720,
      k: 48,
      na: 12,
    };

    if (lab.includes('ph')) return valueByLab.ph;
    if (lab.includes('ec')) return valueByLab.ec;
    if (lab.includes('om')) return valueByLab.om;
    if (lab === 'p' || lab.includes('p ')) return valueByLab.p;
    if (lab.includes('mg')) return valueByLab.mg;
    if (lab.includes('ca')) return valueByLab.ca;
    if (lab.includes('k')) return valueByLab.k;
    if (lab.includes('na')) return valueByLab.na;

    return currentValue ?? fallbackValues[index % fallbackValues.length];
  };

  const fillRealisticModalValues = () => {
    setEditedResults(prev =>
      prev.map((result, index) => ({
        ...result,
        preValue: getRealisticPreValue(
          result.shortNameBefore,
          result.preValue,
          index
        ),
      }))
    );

    setEditedDirtWeight(prev =>
      prev.map(item => ({
        ...item,
        value:
          item.fieldName === 'dirtWeightOm'
            ? 0.0025
            : item.fieldName === 'dirtWeightMehlich'
              ? 5
              : (item.value ?? 1),
      }))
    );
  };

  // บันทึกข้อมูลจาก modal
  const saveModalChanges = () => {
    const changedResults: ResultInput[] = editedResults
      .filter(edited => {
        const original = originalResults.find(
          o => o.resultId === edited.resultId
        );
        return original && edited.preValue !== original.preValue;
      })
      .map(edited => ({
        resultId: edited.resultId,
        preValue: edited.preValue,
      }));

    const changedDirtWeight: Record<string, number | null>[] = editedDirtWeight
      .filter(edited => {
        const original = originalDirtWeight.find(o => o.id === edited.id);
        return original && edited.value !== original.value;
      })
      .map(edited => ({
        qrCodeId: edited.qrCodeId,
        [edited.fieldName ?? 'value']: edited.value,
      }));

    if (changedResults.length === 0 && changedDirtWeight.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'ไม่มีการเปลี่ยนแปลง',
        text: 'คุณยังไม่ได้แก้ไขข้อมูลใด ๆ',
      });
      closeModal();
      return;
    }

    if (handleSubmitPreValue && changedResults.length > 0) {
      handleSubmitPreValue(changedResults);
    }

    // การบันทึกน้ำหนักดินยังไม่ถูก implement (ไม่มี handler/endpoint) — เตือนผู้ใช้แทนการ drop เงียบ
    if (changedDirtWeight.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ยังบันทึกน้ำหนักดินไม่ได้',
        text: 'ระบบยังไม่รองรับการบันทึกน้ำหนักดินจากหน้านี้ ค่าที่แก้ไขจะไม่ถูกบันทึก',
      });
    }

    closeModal();
  };

  const [printQrCodeData, setPrintQrCodeData] = useState<LabelProps[] | null>(
    null
  );

  const handlePrint = (labRow: prinLabQrCode) => {
    const labels: LabelProps[] = [];

    const sampleCode = labRow?.qrCode?.book?.sampleCode
      .toString()
      .padStart(2, '0');
    const repeatCountRaw = labRow?.qrCode?.book?.repeatCount ?? '1';
    const repeatCount = repeatCountRaw.toString().padStart(2, '0');

    labRow.result.forEach((res: sampleBlankResultInfo) => {
      const shortNameBefore =
        res?.laboratorySetting?.laboratory?.shortNameBefore ?? 'NoLab';

      const fileName = `${sampleCode}-${repeatCount}-${shortNameBefore}`;

      labels.push({
        qrValue: fileName,
        qrText: fileName,
      });
    });

    setPrintQrCodeData(labels);
  };

  const columns = laboratoryData;

  const saveInlinePreValue = async (
    resultId: number,
    preValue: number | null | undefined
  ) => {
    if (
      !handleSubmitPreValue ||
      preValue === null ||
      preValue === undefined ||
      savingInlineIds.has(resultId)
    ) {
      return;
    }

    setSavingInlineIds(prev => new Set(prev).add(resultId));
    try {
      await handleSubmitPreValue([{ resultId, preValue }]);
      setInlineValues(prev => {
        const next = { ...prev };
        delete next[resultId];
        return next;
      });
    } finally {
      setSavingInlineIds(prev => {
        const next = new Set(prev);
        next.delete(resultId);
        return next;
      });
    }
  };

  const renderColumnHeaders = () => (
    <>
      <th>รหัสตัวอย่าง</th>
      <th>ผลวิเคราะห์</th>
      {columns?.map(column => (
        <React.Fragment key={column.laboratoryId}>
          <th>{`${column.shortNameBefore} ${column.unitBefore === '' ? `` : `(${column.unitBefore})`}`}</th>
          {column?.machineType?.type === MachineTypeTypes.RAW_VALUE ? null : (
            <th>{`${column.shortNameAfter} (${column.unitAfter})`}</th>
          )}
          <th></th>
        </React.Fragment>
      ))}
      <th>น้ำหนักดิน Mehlic</th>
      <th>น้ำหนักดิน OM</th>
      <th>MANAGEMENT</th>
      {/* <th>UPDATE</th> */}
    </>
  );

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <div className="private-card">
            <div className="private-card-header">
              <div className="private-card-head-row private-card-tools-still-right">
                <h4 className="private-card-title">
                  {title} <span>{subtitle}</span>
                </h4>
              </div>
            </div>
            <div className="private-card-body">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <DataTableWrapper tableId={tableId} loading={loading}>
                  <div className="table-responsive">
                    <table
                      id={tableId}
                      className="table table-striped table-hover"
                      style={{
                        tableLayout: 'auto',
                      }}
                    >
                      <thead>
                        <tr className="text-center">{renderColumnHeaders()}</tr>
                      </thead>
                      <tfoot>
                        <tr className="text-center">{renderColumnHeaders()}</tr>
                      </tfoot>
                      <tbody>
                        {data.map((row, index) => {
                          const sampleCode =
                            row?.qrCode?.book?.sampleCode ?? `row-${index}`;

                          return (
                            <tr key={sampleCode}>
                              <td
                                className="text-left"
                                style={{ minWidth: '10vh' }}
                              >
                                {sampleCode}
                              </td>
                              <td className="text-left">NA</td>

                              {columns?.map(col => {
                                const result = row?.result?.find(
                                  r => r?.laboratoryId === col?.laboratoryId
                                );
                                if (!result) {
                                  return (
                                    <React.Fragment key={col.laboratoryId}>
                                      <td>-</td>
                                      {col?.machineType?.type !==
                                        MachineTypeTypes.RAW_VALUE && <td>-</td>}
                                      <td></td>
                                    </React.Fragment>
                                  );
                                }

                                const hasPreValue =
                                  result.preValue !== null &&
                                  result.preValue !== undefined;
                                const resultId = Number(result.resultId);
                                const hasValidResultId =
                                  Number.isInteger(resultId) && resultId > 0;
                                const inlineValue =
                                  inlineValues[resultId] ??
                                  (hasPreValue
                                    ? formatDecimal(result.preValue ?? 0)
                                    : '');
                                const inlineNumber = Number(inlineValue);
                                const isSavingInline =
                                  savingInlineIds.has(resultId);
                                const canSaveInline =
                                  hasValidResultId &&
                                  inlineValue.trim() !== '' &&
                                  Number.isFinite(inlineNumber) &&
                                  (!hasPreValue ||
                                    inlineNumber !== Number(result.preValue)) &&
                                  !isSavingInline;
                                const gradeColor =
                                  (result?.resultGradeLevel?.color as
                                    | string
                                    | undefined) ??
                                  fallbackGradeColor;

                                return (
                                  <React.Fragment key={result.laboratoryId}>
                                    {/* preValue cell */}
                                    <td className="text-left">
                                      <div
                                        className="d-flex align-items-center gap-1"
                                        style={{ minWidth: '120px' }}
                                      >
                                        <input
                                          type="number"
                                          className="form-control form-control-sm"
                                          value={inlineValue}
                                          placeholder="เพิ่มค่า"
                                          disabled={isSavingInline || !hasValidResultId}
                                          onChange={e =>
                                            setInlineValues(prev => ({
                                              ...prev,
                                              [resultId]: e.target.value,
                                            }))
                                          }
                                          onKeyDown={e => {
                                            if (e.key === 'Enter' && canSaveInline) {
                                              e.preventDefault();
                                              void saveInlinePreValue(
                                                resultId,
                                                inlineNumber
                                              );
                                            }
                                          }}
                                          onBlur={() => {
                                            if (canSaveInline) {
                                              void saveInlinePreValue(
                                                resultId,
                                                inlineNumber
                                              );
                                            }
                                          }}
                                        />
                                        {isSavingInline && (
                                          <span
                                            className="spinner-border spinner-border-sm text-success"
                                            role="status"
                                            aria-label="กำลังบันทึก"
                                          />
                                        )}
                                      </div>
                                    </td>

                                    {/* postValue */}
                                    {result?.laboratorySetting?.laboratory
                                      ?.machineType?.type ===
                                      MachineTypeTypes.RAW_VALUE ? null : (
                                      <td className="text-left">
                                        {formatDecimal(result?.postValue ?? 0)}
                                      </td>
                                    )}

                                    {/* Grade color */}
                                    <td
                                      className="text-left"
                                      style={{
                                        background: hasPreValue ? gradeColor : '',
                                        minWidth: '0.125vh',
                                      }}
                                    />
                                  </React.Fragment>
                                );
                              })}

                              <td>{row?.qrCode?.dirtWeightMehlich}</td>
                              <td>{row?.qrCode?.dirtWeightOm}</td>

                              {/* Management */}
                              <td className="align-middle">
                                <div className="d-flex justify-content-center gap-2">
                                  <div className="p-0">
                                    <GenButtonCircle
                                      color="btn-primary"
                                      icon="fa fa-edit"
                                      onClick={() =>
                                        openEditModal(sampleCode, row, 'edit')
                                      }
                                    />
                                  </div>
                                  {/* <div className="p-0">
                                    <GenButtonCircle
                                      color="btn-info"
                                      icon="fa fa-info"
                                    />
                                  </div> */}
                                  <div>
                                    <GenButtonCircle
                                      color="btn-success"
                                      icon={B_LIST.print.icon}
                                      onClick={() => handlePrint(row)}
                                    />
                                  </div>
                                  {/* <div>
                                    <GenButtonCircle
                                      color={B_LIST.del.color}
                                      icon={B_LIST.del.icon}
                                      onClick={() => setShowConfirm(true)}
                                    />
                                  </div> */}
                                </div>
                                {/* {showConfirm && (
                                  <ConfirmAlert
                                    title="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล?"
                                    text="เมื่อลบแล้วจะไม่สามารถกู้คืนได้"
                                    action="delete"
                                    onConfirm={() => setShowConfirm(false)}
                                    onCancel={() => setShowConfirm(false)}
                                  />
                                )} */}
                              </td>

                              {/* <td className="text-left">
                                อาจใส่วันเวลาแก้ไขล่าสุด
                              </td> */}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </DataTableWrapper>
              )}
            </div>
          </div>
        </div>
      </div>

      {printQrCodeData && (
        <div
          style={{
            position: 'fixed',
            left: '-10000px',
            top: 0,
            pointerEvents: 'none',
          }}
        >
          <PrintQrCode
            labels={printQrCodeData}
            onClose={() => setPrintQrCodeData(null)}
          />
        </div>
      )}

      {/* Bootstrap Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{
            display: 'block',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
          }}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="editModalLabel"
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
          >
            <div className="modal-content shadow-lg border-0 rounded-3">
              {/* Header */}
              <div
                className="modal-header border-0 rounded-top-3"
                style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}
              >
                <div className="d-flex align-items-center">
                  <i className="fas fa-edit me-2 text-primary"></i>
                  <h5 className="modal-title mb-0" id="editModalLabel">
                    แก้ไขค่าสำหรับตัวอย่าง:
                    <span className="badge bg-primary-subtle text-primary ms-2 rounded-pill">
                      {editingSampleCode}
                    </span>
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeModal}
                />
              </div>

              {/* Body */}
              <div
                className="modal-body p-4"
                style={{ maxHeight: '60vh', overflowY: 'auto' }}
              >
                <div
                  className="alert alert-light border-start border-primary border-4 bg-light"
                  role="alert"
                >
                  <i className="fas fa-info-circle text-primary me-2"></i>
                  <small className="text-muted">
                    กรุณากรอกค่าที่ต้องการแก้ไขในแต่ละฟิลด์
                  </small>
                </div>

                <div className="d-flex justify-content-end mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    onClick={fillRealisticModalValues}
                  >
                    <i className="fas fa-vial me-1" />
                    เติมค่าทดสอบ
                  </button>
                </div>

                {/* คุณสมบัติของดิน Section */}
                {editedResults && editedResults.length > 0 && (
                  <div className="mb-5">
                    <div className="section-header mb-4">
                      <div className="d-flex align-items-center mb-3">
                        <div>
                          <h6 className="mb-0 fw-bold text-success">
                            คุณสมบัติของดิน
                          </h6>
                          <small className="text-muted">Soil Properties</small>
                        </div>
                      </div>
                      <hr className="border-2 border-success opacity-25" />
                    </div>

                    <form>
                      {editedResults.map(result => (
                        <div
                          className="mb-3 p-3 bg-light rounded-3 border-start border-4 border-success"
                          key={result.resultId}
                        >
                          <div className="row align-items-center">
                            <div className="col-4">
                              <label className="form-label fw-bold text-dark mb-0">
                                <i className="fas fa-flask me-2 text-success"></i>
                                {result.shortNameBefore}{' '}
                                {result.unitBefore
                                  ? `(${result.unitBefore})`
                                  : ``}
                              </label>
                            </div>
                            <div className="col-8">
                              <div className="input-group">
                                <input
                                  type="number"
                                  className="form-control form-control-lg border-2"
                                  style={{
                                    borderColor:
                                      result.preValue !== null
                                        ? '#28a745'
                                        : '#dee2e6',
                                    backgroundColor: '#fff',
                                    transition: 'all 0.3s ease',
                                  }}
                                  value={result.preValue ?? ''}
                                  placeholder="กรอกค่า..."
                                  onChange={e => {
                                    const val = parseFloat(e.target.value);
                                    setEditedResults(prev =>
                                      prev.map(r =>
                                        r.resultId === result.resultId
                                          ? {
                                            ...r,
                                            preValue: isNaN(val) ? null : val,
                                          }
                                          : r
                                      )
                                    );
                                  }}
                                  onFocus={e => {
                                    e.target.style.borderColor = '#28a745';
                                    e.target.style.boxShadow =
                                      '0 0 0 0.2rem rgba(40,167,69,.25)';
                                  }}
                                  onBlur={e => {
                                    e.target.style.borderColor =
                                      result.preValue !== null
                                        ? '#28a745'
                                        : '#dee2e6';
                                    e.target.style.boxShadow = 'none';
                                  }}
                                />
                              </div>
                              {result.preValue !== null && (
                                <div className="mt-2">
                                  <small className="text-success fw-bold">
                                    <i className="fas fa-check-circle me-1"></i>
                                    ค่าที่กรอก: {result.preValue}
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </form>
                  </div>
                )}

                {/* ค่าน้ำหนักดิน Section */}
                {editedDirtWeight && editedDirtWeight.length > 0 && (
                  <div className="mb-4">
                    <div className="section-header mb-4">
                      <div className="d-flex align-items-center mb-3">
                        <div>
                          <h6 className="mb-0 fw-bold text-warning">
                            ค่าน้ำหนักดิน
                          </h6>
                          <small className="text-muted">
                            Dirt Weight Values
                          </small>
                        </div>
                      </div>
                      <hr className="border-2 border-warning opacity-25" />
                    </div>

                    <form>
                      {editedDirtWeight.map(result => (
                        <div
                          className="mb-3 p-3 bg-light rounded-3 border-start border-4 border-warning"
                          key={result.id}
                        >
                          <div className="row align-items-center">
                            <div className="col-4">
                              <label className="form-label fw-bold text-dark mb-0">
                                <i className="fas fa-weight-hanging me-2 text-warning"></i>
                                {result.showText}
                              </label>
                            </div>
                            <div className="col-8">
                              <div className="input-group">
                                <input
                                  type="number"
                                  className="form-control form-control-lg border-2"
                                  style={{
                                    borderColor:
                                      result.value !== null
                                        ? '#ffc107'
                                        : '#dee2e6',
                                    backgroundColor: '#fff',
                                    transition: 'all 0.3s ease',
                                  }}
                                  value={result.value ?? ''}
                                  placeholder="กรอกค่า..."
                                  onChange={e => {
                                    const val = parseFloat(e.target.value);
                                    setEditedDirtWeight(prev =>
                                      prev.map(r =>
                                        r.id === result.id
                                          ? {
                                            ...r,
                                            value: isNaN(val) ? null : val,
                                          }
                                          : r
                                      )
                                    );
                                  }}
                                  onFocus={e => {
                                    e.target.style.borderColor = '#ffc107';
                                    e.target.style.boxShadow =
                                      '0 0 0 0.2rem rgba(255,193,7,.25)';
                                  }}
                                  onBlur={e => {
                                    e.target.style.borderColor =
                                      result.value !== null
                                        ? '#ffc107'
                                        : '#dee2e6';
                                    e.target.style.boxShadow = 'none';
                                  }}
                                />
                              </div>
                              {result.value !== null && (
                                <div className="mt-2">
                                  <small className="text-warning fw-bold">
                                    <i className="fas fa-check-circle me-1"></i>
                                    ค่าที่กรอก: {result.value}
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </form>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer bg-light border-0 rounded-bottom-3 p-4">
                <div className="d-flex gap-3 ms-auto">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg px-4 rounded-pill"
                    onClick={closeModal}
                    style={{ minWidth: '120px' }}
                  >
                    <i className="fas fa-times me-2"></i>
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg px-4 shadow rounded-pill"
                    onClick={saveModalChanges}
                    style={{
                      minWidth: '120px',
                      background: 'linear-gradient(45deg, #007bff, #0056b3)',
                    }}
                  >
                    <i className="fas fa-save me-2"></i>
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LabResultTable;


