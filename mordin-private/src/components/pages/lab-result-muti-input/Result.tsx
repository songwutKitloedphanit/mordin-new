import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '../../gui/GuiButton';

import { inputResult } from '@/services/api/result/ResultApi';
import {
  inputAnalysisStandardResults,
  inputStandardCertificates,
} from '@/services/api/standard-sample/AnalysisStandardsAPI';
import { LabResult } from '@/types/result/Result';

// Add23Component สำหรับยืนยันและบันทึก
export const ResultComponent: React.FC<{
  onSubmit: () => void;
  onCancel: () => void;
  data: LabResult[];   // รับข้อมูลทั้งหมดจาก GetResultComponent
  edited: LabResult[]; // รับข้อมูลที่ถูกแก้ไขจาก GetResultComponent
}> = ({ onSubmit, onCancel, data, edited }) => {
  const [showConfirm, setShowConfirm] = useState<{
    type: 'delete' | 'cancel';
    show: boolean;
    index?: number;
  } | null>(null);

  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [editedData, setEditedData] = useState<LabResult[]>([]);

  useEffect(() => {
    setLabResults(data);   // ใช้ data จาก prop เป็นข้อมูลเริ่มต้น
    setEditedData(edited); // ใช้ edited จาก prop เป็นข้อมูลที่แก้ไข
  }, [data, edited]);

  const handleDelete = (index: number) => {
    const resultToDelete = labResults[index];
    if (!resultToDelete || !resultToDelete.id) return;

    const newLabResults = labResults.filter((_, i) => i !== index);
    const newEditedData = editedData.filter(r => r.id !== resultToDelete.id);

    setLabResults(newLabResults);
    setEditedData(newEditedData);
    localStorage.setItem('LabResultData', JSON.stringify(newLabResults));
    setShowConfirm({ type: 'delete', show: false, index: -1 });
  };

  const handleCancel = () => {
    setShowConfirm({ type: 'cancel', show: false });
    onCancel();
  };

  // ===== Helpers =====
  const toNumber = (v: unknown): number | undefined => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : undefined;
  };

  // เดา "ประเภทแถว" จากรูปแบบ resultId ภายใน results
  const detectRowType = (r: LabResult): 'sample' | 'blank' | 'crm' => {
    const ids = (r.results || []).map(x => String((x as any).resultId || ''));
    if (ids.some(id => id.startsWith('blank:'))) return 'blank';
    if (ids.some(id => id.startsWith('crmcert:'))) return 'crm';
    return 'sample';
  };

  // สร้าง key ที่ unique จริง แม้ id จะซ้ำกันข้ามกลุ่ม
  const buildRowKey = (r: LabResult, index: number) => {
    const type = detectRowType(r);
    const ex = r.examId ?? '';
    const id = r.id ?? '';
    return `row:${type}:${ex}:${id}:${index}`;
  };

  const handleSubmit = async () => {
    const allCells = editedData.flatMap(r => r.results || []);

    // SAMPLE โ’ /results/input
    const samplePayload = allCells
      .filter((c: any) => typeof c.resultId === 'number')
      .map((c: any) => ({ resultId: c.resultId, preValue: toNumber(c.preValue) }))
      .filter(p => typeof p.preValue === 'number') as { resultId: number; preValue: number }[];

    // BLANK โ’ /analysis-standard-results/input (resultId = "blank:<analysisStandardResultId>")
    const blankPayload = allCells
      .filter((c: any) => typeof c.resultId === 'string' && String(c.resultId).startsWith('blank:'))
      .map((c: any) => {
        const idStr = String(c.resultId);
        const m = idStr.match(/^blank:(\d+)$/);
        if (!m) return null;
        const analysisStandardResultId = Number(m[1]);
        const preValue = toNumber(c.preValue);
        return Number.isFinite(analysisStandardResultId) && typeof preValue === 'number'
          ? { analysisStandardResultId, preValue }
          : null;
      })
      .filter(Boolean) as { analysisStandardResultId: number; preValue: number }[];

    // CRM CERTIFICATE โ’ /standard-certificates/input (resultId = "crmcert:<standardId>:<laboratoryId>")
    const crmCertPayload = allCells
      .filter((c: any) => typeof c.resultId === 'string' && String(c.resultId).startsWith('crmcert:'))
      .map((c: any) => {
        const idStr = String(c.resultId);
        const m = idStr.match(/^crmcert:(\d+):(\d+)$/);
        if (!m) return null;
        const standardId = Number(m[1]);
        const laboratoryId = Number(m[2]);
        const certificateValue = toNumber(c.preValue);
        return Number.isFinite(standardId) &&
          Number.isFinite(laboratoryId) &&
          typeof certificateValue === 'number'
          ? { standardId, laboratoryId, certificateValue }
          : null;
      })
      .filter(Boolean) as { standardId: number; laboratoryId: number; certificateValue: number }[];

    console.log('samplePayload:', samplePayload);
    console.log('blankPayload:', blankPayload);
    console.log('crmCertPayload:', crmCertPayload);

    try {
      await Promise.all([
        samplePayload.length   ? inputResult(samplePayload)                    : Promise.resolve(),
        blankPayload.length    ? inputAnalysisStandardResults(blankPayload)   : Promise.resolve(),
        crmCertPayload.length  ? inputStandardCertificates(crmCertPayload)    : Promise.resolve(),
      ]);

      localStorage.removeItem('LabResults');
      localStorage.removeItem('LabResultData');
      localStorage.removeItem('EditedData');

      Swal.fire({
        title: 'สำเร็จ',
        text: 'บันทึกข้อมูลเรียบร้อย',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      }).then(() => onSubmit());
    } catch (error) {
      console.error('Error submitting data:', error);
      Swal.fire({
        title: 'ผิดพลาด',
        text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  // ===== Render table summary =====
  // รวม header ตามชื่อแลบ (shortNameBefore) จากทุกประเภท (sample/blank/crm)
  const uniqueHeaders =
    labResults.length > 0
      ? [
          'id',
          'examId',
          ...new Set(
            labResults.flatMap(r => (r.results || []).map(res => res.shortNameBefore))
          ),
        ]
      : ['id', 'examId'];

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="private-card">
          <div className="private-card-header">
            <h4 className="private-card-title">
              ผลวิเคราะห์{' '}
              <span className="text-secondary">
                {labResults.length} ตัวอย่าง
              </span>
            </h4>
          </div>
          <div className="private-card-body">
            <div className="table-responsive">
              {labResults.length > 0 ? (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>SAMPLE-CODE</th>
                      {uniqueHeaders.slice(2).map(header => (
                        <th key={`hdr:${header}`}>{header}</th>
                      ))}
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labResults.map((result, index) => (
                      <tr key={buildRowKey(result, index)}>
                        <td align="center">{result.id || '-'}</td>
                        <td align="center">{result.examId || '-'}</td>
                        {uniqueHeaders.slice(2).map(header => {
                          const matchingResult = (result.results || []).find(
                            res => res.shortNameBefore === header
                          );
                          return (
                            <td key={`cell:${index}:${header}`} align="center">
                              {matchingResult ? (matchingResult as any).preValue : '-'}
                            </td>
                          );
                        })}
                        <td align="center">
                          <GenButtonCircle
                            color={B_LIST.del.color}
                            icon={B_LIST.del.icon}
                            onClick={() =>
                              setShowConfirm({
                                type: 'delete',
                                show: true,
                                index,
                              })
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>ไม่มีข้อมูลผลวิเคราะห์</p>
              )}
            </div>
            <div className="private-action-footer">
              <div className="row row-demo-grid">
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ width: '120px' }}
                  onClick={handleSubmit}
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  className="btn btn-danger ms-auto"
                  style={{ width: '120px' }}
                  onClick={() => setShowConfirm({ type: 'cancel', show: true })}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title={
            showConfirm.type === 'delete' ? 'ยืนยันการลบ' : 'ยืนยันการยกเลิก'
          }
          text={
            showConfirm.type === 'delete'
              ? 'คุณต้องการลบรายการนี้หรือไม่?'
              : 'คุณต้องการยกเลิกการบันทึกหรือไม่? \n ข้อมูลที่กรอกจะไม่ถูกบันทึก'
          }
          action={showConfirm.type}
          onConfirm={() => {
            if (showConfirm.type === 'delete' && showConfirm.index !== undefined) {
              handleDelete(showConfirm.index);
            } else {
              handleCancel();
            }
            setShowConfirm(null);
          }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </div>
  );
};

