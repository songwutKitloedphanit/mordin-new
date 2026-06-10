import React, { useState } from 'react';
import Swal from 'sweetalert2';

import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { inputResult } from '@/services/api/result/ResultApi';
import { Result } from '@/types/qr-code/QrCode';
import { ResultInput } from '@/types/result/Result';
import { formatNumber } from '@/utils/Number';

interface AnalysisResultProps {
  resultData: Result[];
  loading: boolean;
  onSuccess: () => void;
}

const AnalysisResultTable: React.FC<AnalysisResultProps> = ({
  resultData,
  loading,
  onSuccess,
}) => {
  console.log('result', resultData);

  // const uniqueLabs = Array.from(
  //   new Map(resultData?.map(result => [result.laboratoryId, result])).values()
  // );

  // console.log(uniqueLabs);

  // หา group ของรอบ
  const repeatGroups = Array.from(
    new Set(resultData?.map(result => result.repeatNumber))
  ).sort();

  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result[]>([]);
  const [repeat, setRepeat] = useState<number | null>(null);

  const openEditModal = (result: Result[], repeat: number) => {
    setSelectedResult(result);
    setShowModal(true);
    setRepeat(repeat);
  };

  // ปิด modal
  const closeModal = () => {
    setSelectedResult([]);
    setShowModal(false);
  };

  const handleSubmitPreValue = async () => {
    const changedResults: ResultInput[] = selectedResult
      .filter(edited => {
        const original = resultData?.find(
          o => o.resultId === edited.resultId
        );
        return original && edited.preValue !== original.preValue;
      })
      .map(edited => ({
        resultId: edited.resultId,
        preValue: edited.preValue,
      }));

    if (changedResults.length > 0) {
      console.log(`ส่งค่า :`, changedResults);

      Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await inputResult(changedResults);
        if (response) {
          console.log('Pre-value submitted successfully:', response);

          // แสดง success
          Swal.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            showConfirmButton: false,
            timer: 1000,
          });
        }
      } catch (error) {
        console.error('Error submitting pre-value:', error);
        // แสดง error
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกข้อมูลได้',
        });
      } finally {
        onSuccess();
        closeModal();
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกค่า',
      });
    }
  };
  return (
    <div className="private-card mt-4">
      <div className="private-card-header">
        <div className="row">
          <div className="col text-start">
            <h4 className="private-card-title">ผลการวิเคราะห์</h4>
          </div>
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
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th></th>
                  <th>รอบที่</th>
                  <th>ก่อน/หลัง</th>

                  {resultData?.map(lab => {
                    let previousId = null;
                    if (lab.laboratoryId === previousId) {
                      return null; // ข้ามถ้าซ้ำ
                    }

                    previousId = lab.laboratoryId;

                    return (
                      <th key={lab.laboratoryId}>
                        {lab?.laboratorySetting?.laboratory?.shortNameAfter}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {repeatGroups.map(repeat => {
                  const results = resultData?.filter(
                    r => r.repeatNumber === repeat
                  );
                  return (
                    <React.Fragment key={repeat}>
                      {/* แถวก่อนแปลงค่า */}
                      <tr key={`pre-${repeat}`}>
                        <td>
                          <GenButtonCircle
                            color={B_LIST.edit.color}
                            icon={B_LIST.edit.icon}
                            // link="/officer/analysis-report/1/edit"
                            onClick={() => {
                              openEditModal(results, repeat);
                            }}
                          />
                        </td>
                        <td>{repeat}</td>
                        <td className="text-center">ก่อนแปลงค่า</td>
                        {resultData?.map(lab => {
                          let previousId = null;
                          if (lab.laboratoryId === previousId) {
                            return null; // ข้ามถ้าซ้ำ
                          }

                          previousId = lab.laboratoryId;

                          return (
                            <td key={`pre-${repeat}-${lab.laboratoryId}`}>
                              {formatNumber(lab?.preValue ?? null)}
                              {lab?.laboratorySetting?.laboratory?.unitBefore &&
                                lab?.laboratorySetting?.laboratory?.unitBefore !== '-'
                                ? ` ${lab?.laboratorySetting?.laboratory?.unitBefore}`
                                : ''}
                            </td>
                          );
                        })}
                      </tr>
                      {/* แถวหลังแปลงค่า */}
                      <tr key={`post-${repeat}`}>
                        <td></td>
                        <td>{repeat}</td>
                        <td className="text-center">หลังแปลงค่า</td>
                        {resultData?.map(lab => {
                          let previousId = null;
                          if (lab.laboratoryId === previousId) {
                            return null; // ข้ามถ้าซ้ำ
                          }

                          previousId = lab.laboratoryId;

                          return (
                            <td key={`post-${repeat}-${lab.laboratoryId}`}>
                              {formatNumber(lab?.postValue ?? null)}
                              {lab?.laboratorySetting?.laboratory?.unitAfter &&
                                lab?.laboratorySetting?.laboratory?.unitAfter !== '-'
                                ? ` ${lab?.laboratorySetting?.laboratory?.unitAfter}`
                                : ''}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
                <div className="modal-header bg-primary text-white border-0 rounded-top-3">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-edit me-2"></i>
                    <h5 className="modal-title mb-0" id="editModalLabel">
                      แก้ไขค่าสำหรับ รอบที่:
                      <span className="badge bg-light text-primary ms-2 rounded-pill">
                        {repeat}
                      </span>
                    </h5>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
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

                  <form>
                    {selectedResult?.map(result => (
                      <div
                        className="mb-3 p-3 bg-light rounded-3 border-start border-4 border-primary"
                        key={result.resultId}
                      >
                        <div className="row align-items-center">
                          <div className="col-4">
                            <label className="form-label fw-bold text-dark mb-0">
                              <i className="fas fa-flask me-2 text-primary"></i>
                              {
                                result.laboratorySetting?.laboratory
                                  .shortNameBefore
                              }{' '}
                              {result.laboratorySetting?.laboratory?.unitBefore
                                ? `(${result.laboratorySetting?.laboratory?.unitBefore})`
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
                                  setSelectedResult(prev =>
                                    prev.map(r =>
                                      r.resultId === result.resultId
                                        ? {
                                          ...r,
                                          preValue: val,
                                        }
                                        : r
                                    )
                                  );
                                }}
                                onFocus={e => {
                                  e.target.style.borderColor = '#007bff';
                                  e.target.style.boxShadow =
                                    '0 0 0 0.2rem rgba(0,123,255,.25)';
                                }}
                                onBlur={e => {
                                  e.target.style.borderColor =
                                    result.preValue !== null
                                      ? '#28a745'
                                      : '#dee2e6';
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                              <span className="input-group-text bg-white border-2">
                                <i className="fas fa-hashtag text-muted"></i>
                              </span>
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
                      onClick={handleSubmitPreValue}
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
      </div>
    </div>
  );
};

export default AnalysisResultTable;

