import { HotTable, HotTableRef } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import React, { useRef, useState, useMemo } from 'react';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { QrCode } from '@/types/qr-code/QrCode';
import { LabResult } from '@/types/result/Result';
import { sampleBlankResultInfo } from '@/types/sample-blank/sampleBlankResult';

import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

/* ===========================
  Key helpers
  =========================== */
const keyBlank = (r: any) => `blank:${r.analysisStandardResultId}`;
// โฌ๏ธ เปลี่ยนคีย์ CRM ให้ผูกกับ standard_certificates (standardId + laboratoryId)
const keyCrmCert = (r: any) => `crmcert:${r.standardId}:${r.laboratoryId}`; // กันชนกับ sample / blank
const isNumericKey = (k: string) => Number.isFinite(Number(k));

/* ===========================
  Types
  =========================== */
interface sampleResults {
  qrCode: QrCode;
  result: sampleBlankResultInfo[];
}

interface Props {
  onNext: (params: { data: LabResult[]; edited: LabResult[] }) => void;
  onBack: () => void;
  onCancel: () => void;
  serviceCalendarId?: number;
  analysisService: Array<{ qrCode: QrCode; result: sampleBlankResultInfo[] }>;
  blankService?: Array<{ code: string; result: any[] }>;
  // โฌ๏ธ crmService.result แต่ละ cell ต้องมี { standardId, laboratoryId, certificateValue, repeatNumber, laboratorySetting }
  crmService?: Array<{ code: string; result: any[] }>;
}

registerAllModules();

export const GetResultComponent: React.FC<Props> = ({
  onNext,
  analysisService,
  blankService = [],
  crmService = [],
  onCancel,
}) => {
  const hotSampleRef = useRef<HotTableRef>(null);
  const hotBlankRef = useRef<HotTableRef>(null);
  const hotCrmRef = useRef<HotTableRef>(null);

  /* ======== Sample: sort by code ======== */
  const sortedAnalysisService = useMemo(
    () =>
      [...analysisService].sort((a, b) =>
        (a.qrCode.book.sampleCode || '').localeCompare(
          b.qrCode.book.sampleCode || ''
        )
      ),
    [analysisService]
  );

  /* ======== Headers ======== */
  const headersSample = useMemo(() => {
    const set = new Set<string>();
    sortedAnalysisService.forEach(s =>
      s.result.forEach(r =>
        set.add(r.laboratorySetting.laboratory.shortNameBefore)
      )
    );
    return Array.from(set);
  }, [sortedAnalysisService]);

  // Blank/CRM: หัวคอลัมน์ = ชื่อแลบอย่างเดียว (ไม่มี R#)
  const headersBlank = useMemo(() => {
    const set = new Set<string>();
    blankService.forEach(row =>
      row.result.forEach((r: any) =>
        set.add(r.laboratorySetting.laboratory.shortNameBefore)
      )
    );
    return Array.from(set).sort();
  }, [blankService]);

  const headersCrm = useMemo(() => {
    const set = new Set<string>();
    crmService.forEach(row =>
      row.result.forEach((r: any) =>
        set.add(r.laboratorySetting.laboratory.shortNameBefore)
      )
    );
    return Array.from(set).sort();
  }, [crmService]);

  /* ======== initial input values ======== */
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>(
    () => {
      const init: Record<string, string> = {};

      // Sample
      sortedAnalysisService.forEach((sample, index) => {
        const rowId = (index + 1).toString();
        sample.result.forEach(result => {
          const key =
            result.resultId?.toString() ||
            `${rowId}_${result.laboratorySetting.laboratory.shortNameBefore}`;
          if (result.preValue !== null && result.preValue !== undefined) {
            init[key] = String(result.preValue);
          }
        });
      });

      // Blank
      blankService.forEach(row => {
        row.result.forEach((r: any) => {
          const key = keyBlank(r);
          if (r.preValue !== null && r.preValue !== undefined) {
            init[key] = String(r.preValue);
          }
        });
      });

      // CRM -> ใช้ค่า certificateValue (ของ standard_certificates)
      crmService.forEach(row => {
        row.result.forEach((r: any) => {
          const key = keyCrmCert(r);
          if (r.certificateValue !== null && r.certificateValue !== undefined) {
            init[key] = String(r.certificateValue);
          }
        });
      });

      return init;
    }
  );

  const [editedResults, setEditedResults] = useState<LabResult[]>([]);
  const [showConfirm, setShowConfirm] = useState<{
    type: 'cancel' | 'delete';
    show: boolean;
    index?: number;
  } | null>(null);

  /* ======== Sample rows with sampleId ======== */
  const sampleResults = useMemo(
    () =>
      sortedAnalysisService.map((result, index) => ({
        qrCode: result.qrCode,
        result: result.result.map(res => ({ ...res, sampleId: index + 1 })),
      })) as sampleResults[],
    [sortedAnalysisService]
  );

  /* ======== Change handler ======== */
  const handleInputChange = (changes: [string, string, string, string][]) => {
    let updatedInputs = { ...inputValues };
    let updatedEditedResults = [...editedResults];

    changes.forEach(([key, value, rowId, headerShort]) => {
      const currentValue = inputValues[key] || '';
      const nextInputs = { ...updatedInputs, [key]: value };

      if (value !== currentValue) {
        const existing = updatedEditedResults.find(r => r.id === rowId);
        const resultIdAny: any = isNumericKey(key) ? Number(key) : key;

        const newResultItem: any = {
          shortNameBefore: headerShort,
          resultId: resultIdAny, // number | 'blank:<id>' | 'crmcert:<standardId>:<labId>'
          preValue: value, // ใช้ช่องนี้เป็น carrier แม้ CRM จะหมายถึง certificateValue
        };

        if (existing) {
          existing.results = existing.results.filter(
            (r: any) => String(r.resultId) !== String(resultIdAny)
          );
          existing.results.push(newResultItem);
        } else {
          updatedEditedResults.push({
            id: rowId,
            examId: '-',
            results: [newResultItem],
          } as any);
        }
      } else if (currentValue === '' && value === '') {
        updatedEditedResults = updatedEditedResults.map((r: any) =>
          r.id === rowId
            ? {
                ...r,
                results: r.results.filter(
                  (x: any) => String(x.resultId) !== String(key)
                ),
              }
            : r
        );
      }
      updatedInputs = nextInputs;
    });

    setInputValues(updatedInputs);
    setEditedResults(updatedEditedResults);
    localStorage.setItem('LabResults', JSON.stringify(updatedInputs));
  };

  /* ======== Hot data ======== */
  const hotSample = useMemo(() => {
    const head = ['ID', 'SAMPLE-CODE', ...headersSample];
    const body = sampleResults.map((sample, index) => {
      const rowId = String(index + 1);
      const row = [rowId, sample.qrCode.book.sampleCode || `S-${index + 1}`];
      headersSample.forEach(h => {
        const cell = sample.result.find(
          r => r.laboratorySetting.laboratory.shortNameBefore === h
        );
        const key = cell?.resultId ? String(cell.resultId) : '';
        row.push(key ? (inputValues[key] ?? '') : '');
      });
      return row;
    });
    return [head, ...body] as string[][];
  }, [sampleResults, headersSample, inputValues]);

  // Blank: แตกแถวตาม repeat, CODE = "<code>/<repeat>"
  const { table: hotBlank, meta: blankMeta } = useMemo(() => {
    const head = ['ID', 'CODE', ...headersBlank];
    const meta: { serviceIdx: number; rep: number }[] = [];
    const body: string[][] = [];
    let rid = 0;

    blankService.forEach((row, sIdx) => {
      const reps = Array.from(
        new Set((row.result || []).map((r: any) => r.repeatNumber ?? 1))
      ).sort((a, b) => a - b);
      reps.forEach(rep => {
        rid += 1;
        meta.push({ serviceIdx: sIdx, rep });
        const data: string[] = [String(rid), `${row.code}/${rep}`];
        headersBlank.forEach(h => {
          const cell = row.result.find(
            (r: any) =>
              (r.repeatNumber ?? 1) === rep &&
              r.laboratorySetting.laboratory.shortNameBefore === h
          );
          const key = cell ? keyBlank(cell) : '';
          const display = key
            ? (inputValues[key] ??
              (cell?.preValue != null ? String(cell.preValue) : ''))
            : '';
          data.push(display);
        });
        body.push(data);
      });
    });

    return { table: [head, ...body] as string[][], meta };
  }, [blankService, headersBlank, inputValues]);

  // CRM: แตกแถวตาม repeat (เพื่อคงโครงแบบเดิม) แต่ค่าในช่อง = certificateValue (ของ standard_certificates)
  const { table: hotCrm, meta: crmMeta } = useMemo(() => {
    const head = ['ID', 'CODE', ...headersCrm];
    const meta: { serviceIdx: number; rep: number }[] = [];
    const body: string[][] = [];
    let rid = 0;

    crmService.forEach((row, sIdx) => {
      const reps = Array.from(
        new Set((row.result || []).map((r: any) => r.repeatNumber ?? 1))
      ).sort((a, b) => a - b);
      reps.forEach(rep => {
        rid += 1;
        meta.push({ serviceIdx: sIdx, rep });
        const data: string[] = [String(rid), `${row.code}/${rep}`];
        headersCrm.forEach(h => {
          const cell = row.result.find(
            (r: any) =>
              (r.repeatNumber ?? 1) === rep &&
              r.laboratorySetting.laboratory.shortNameBefore === h
          );
          const key = cell ? keyCrmCert(cell) : '';
          const display = key
            ? (inputValues[key] ??
              (cell?.certificateValue != null
                ? String(cell.certificateValue)
                : ''))
            : '';
          data.push(display);
        });
        body.push(data);
      });
    });

    return { table: [head, ...body] as string[][], meta };
  }, [crmService, headersCrm, inputValues]);

  /* ======== Build data for confirm ======== */
  const buildDataToSend = () => {
    // Sample (เดิม)
    const sampleData: LabResult[] = sampleResults.map((sample, index) => {
      const rowId = String(index + 1);
      const examId = sample.qrCode.book.sampleCode || `S-${index + 1}`;
      const results = headersSample
        .map(h => {
          const cell = sample.result.find(
            r => r.laboratorySetting.laboratory.shortNameBefore === h
          );
          const key = cell?.resultId ? String(cell.resultId) : '';
          return key
            ? {
                shortNameBefore: h,
                resultId: Number(key),
                preValue: inputValues[key] ?? '',
              }
            : null;
        })
        .filter(Boolean) as any[];
      return { id: rowId, examId, results } as any;
    });

    // Blank (แถวละ repeat)
    const blankData: LabResult[] = blankMeta.map((m, i) => {
      const src = blankService[m.serviceIdx];
      const rowId = String(i + 1);
      const examId = `${src.code}/${m.rep}`;
      const results = headersBlank
        .map(h => {
          const cell = src.result.find(
            (r: any) =>
              (r.repeatNumber ?? 1) === m.rep &&
              r.laboratorySetting.laboratory.shortNameBefore === h
          );
          if (!cell) return null;
          const key = keyBlank(cell);
          return {
            shortNameBefore: h,
            resultId: key as any,
            preValue: inputValues[key] ?? '',
          };
        })
        .filter(Boolean) as any[];
      return { id: rowId, examId, results } as any;
    });

    // CRM (แถวละ repeat) — resultId จะเป็น "crmcert:<standardId>:<laboratoryId>"
    const crmData: LabResult[] = crmMeta.map((m, i) => {
      const src = crmService[m.serviceIdx];
      const rowId = String(i + 1);
      const examId = `${src.code}/${m.rep}`;
      const results = headersCrm
        .map(h => {
          const cell = src.result.find(
            (r: any) =>
              (r.repeatNumber ?? 1) === m.rep &&
              r.laboratorySetting.laboratory.shortNameBefore === h
          );
          if (!cell) return null;
          const key = keyCrmCert(cell);
          return {
            shortNameBefore: h,
            resultId: key as any,
            preValue: inputValues[key] ?? '',
          };
        })
        .filter(Boolean) as any[];
      return { id: rowId, examId, results } as any;
    });

    return [...sampleData, ...blankData, ...crmData];
  };

  const buildEditedToSend = () => {
    const withExam: LabResult[] = editedResults.map((r: any) => {
      if (r.examId && r.examId !== '-') return r;

      const idNum = Number(r.id);
      let examId = r.examId || '-';

      if (idNum >= 1 && idNum <= hotSample.length - 1) {
        const row = hotSample[idNum];
        if (row) examId = row[1] || examId;
      }
      if (idNum >= 1 && idNum <= hotBlank.length - 1) {
        const row = hotBlank[idNum];
        if (row && examId === '-') examId = row[1] || examId;
      }
      if (idNum >= 1 && idNum <= hotCrm.length - 1) {
        const row = hotCrm[idNum];
        if (row && examId === '-') examId = row[1] || examId;
      }

      return { ...r, examId } as any;
    });

    const filtered = withExam
      .map((item: any) => {
        const valid = item.results.filter(
          (x: any) => x.preValue !== null && x.preValue !== ''
        );
        return { ...item, results: valid };
      })
      .filter((x: any) => x.results.length > 0);

    return filtered;
  };

  /* ======== Submit / Cancel ======== */
  const handleCancel = () => {
    setShowConfirm(null);
    localStorage.removeItem('LabResults');
    onCancel();
  };

  const handleSubmit = () => {
    const dataToSend = buildDataToSend();
    const editedToSend = buildEditedToSend();

    localStorage.setItem('LabResultData', JSON.stringify(dataToSend));
    localStorage.setItem('EditedData', JSON.stringify(editedToSend));

    onNext({ data: dataToSend, edited: editedToSend });
  };

  /* ======== Render ======== */
  return (
    <>
      <div className="row">
        <div className="col-md-12">
          {/* SAMPLE */}
          <div className="private-card">
            <div className="private-card-header">
              <h4 className="private-card-title">
                ผลวิเคราะห์ (Sample)
                <span className="text-secondary ms-2">
                  บันทึกเฉพาะที่กรอกค่า
                </span>
              </h4>
            </div>
            <div className="private-card-body">
              <div className="table-responsive">
                <HotTable
                  key="ht-sample"
                  ref={hotSampleRef}
                  data={hotSample.slice(1)}
                  colHeaders={hotSample[0]}
                  rowHeaders
                  height="auto"
                  width="100%"
                  stretchH="all"
                  autoWrapRow
                  autoWrapCol
                  licenseKey="non-commercial-and-evaluation"
                  className="ht-theme-main htCenter"
                  columns={[
                    { data: 0, readOnly: true },
                    { data: 1, readOnly: true },
                    ...headersSample.map((_h: string, idx: number) => ({
                      data: idx + 2,
                    })),
                  ]}
                  afterChange={(changes, source) => {
                    if (!changes || source === 'loadData') return;
                    const changeList: [string, string, string, string][] = [];
                    changes.forEach(([row, col, _oldVal, newVal]) => {
                      const rowIndex = Number(row),
                        colIndex = Number(col);
                      const rowId = String(rowIndex + 1);
                      const header = (hotSample[0] as string[])[colIndex];
                      if (!header || colIndex < 2) return;

                      const headerShort = header;
                      const sampleIndex = rowIndex;
                      const cell = sampleResults[sampleIndex]?.result.find(
                        r =>
                          r.laboratorySetting.laboratory.shortNameBefore ===
                          headerShort
                      );
                      if (!cell) return;

                      const key = cell.resultId ? String(cell.resultId) : '';
                      if (!key) return;
                      changeList.push([
                        key,
                        String(newVal ?? ''),
                        rowId,
                        headerShort,
                      ]);
                    });
                    if (changeList.length) handleInputChange(changeList);
                  }}
                  afterPaste={data => {
                    const startRow = 0,
                      startCol = 2;
                    const changeList: [string, string, string, string][] = [];
                    data.forEach((rowVals, rOffset) => {
                      rowVals.forEach((val, cOffset) => {
                        const rowIndex = startRow + rOffset,
                          colIndex = startCol + cOffset;
                        const rowId = String(rowIndex + 1);
                        const header = (hotSample[0] as string[])[colIndex];
                        if (!header) return;
                        const headerShort = header;
                        const cell = sampleResults[rowIndex]?.result.find(
                          r =>
                            r.laboratorySetting.laboratory.shortNameBefore ===
                            headerShort
                        );
                        if (!cell) return;
                        const key = cell.resultId ? String(cell.resultId) : '';
                        if (!key) return;
                        changeList.push([
                          key,
                          String(val ?? ''),
                          rowId,
                          headerShort,
                        ]);
                      });
                    });
                    if (changeList.length) handleInputChange(changeList);
                  }}
                />
              </div>
            </div>
          </div>

          {/* BLANK */}
          <div className="private-card mt-4">
            <div className="private-card-header">
              <h4 className="private-card-title">
                ผลวิเคราะห์ (Blank)
                <span className="text-secondary ms-2">
                  บันทึกเฉพาะที่กรอกค่า
                </span>
              </h4>
            </div>
            <div className="private-card-body">
              <div className="table-responsive">
                <HotTable
                  key="ht-blank"
                  ref={hotBlankRef}
                  data={hotBlank.slice(1)}
                  colHeaders={hotBlank[0]}
                  rowHeaders
                  height="auto"
                  width="100%"
                  stretchH="all"
                  autoWrapRow
                  autoWrapCol
                  licenseKey="non-commercial-and-evaluation"
                  className="ht-theme-main htCenter"
                  columns={[
                    { data: 0, readOnly: true },
                    { data: 1, readOnly: true },
                    ...headersBlank.map((_h: string, idx: number) => ({
                      data: idx + 2,
                    })),
                  ]}
                  afterChange={(changes, source) => {
                    if (!changes || source === 'loadData') return;
                    const changeList: [string, string, string, string][] = [];
                    changes.forEach(([row, col, _oldVal, newVal]) => {
                      const rowIndex = Number(row),
                        colIndex = Number(col);
                      const rowId = String(rowIndex + 1);
                      if (colIndex < 2) return;

                      const headerShort = headersBlank[colIndex - 2];
                      const meta = blankMeta[rowIndex];
                      if (!meta) return;

                      const src = blankService[meta.serviceIdx];
                      const cell = src?.result.find(
                        (r: any) =>
                          (r.repeatNumber ?? 1) === meta.rep &&
                          r.laboratorySetting.laboratory.shortNameBefore ===
                            headerShort
                      );
                      if (!cell) return;

                      const key = keyBlank(cell);
                      changeList.push([
                        key,
                        String(newVal ?? ''),
                        rowId,
                        headerShort,
                      ]);
                    });
                    if (changeList.length) handleInputChange(changeList);
                  }}
                  afterPaste={data => {
                    const startRow = 0,
                      startCol = 2;
                    const changeList: [string, string, string, string][] = [];
                    data.forEach((rowVals, rOffset) => {
                      rowVals.forEach((val, cOffset) => {
                        const rowIndex = startRow + rOffset,
                          colIndex = startCol + cOffset;
                        const rowId = String(rowIndex + 1);
                        const headerShort = headersBlank[colIndex - 2];
                        const meta = blankMeta[rowIndex];
                        if (!meta || !headerShort) return;

                        const src = blankService[meta.serviceIdx];
                        const cell = src?.result.find(
                          (r: any) =>
                            (r.repeatNumber ?? 1) === meta.rep &&
                            r.laboratorySetting.laboratory.shortNameBefore ===
                              headerShort
                        );
                        if (!cell) return;

                        const key = keyBlank(cell);
                        changeList.push([
                          key,
                          String(val ?? ''),
                          rowId,
                          headerShort,
                        ]);
                      });
                    });
                    if (changeList.length) handleInputChange(changeList);
                  }}
                />
              </div>
            </div>
          </div>

          {/* CRM */}
          <div className="private-card mt-4">
            <div className="private-card-header">
              <h4 className="private-card-title">
                ผลวิเคราะห์ (Standard / CRM)
                <span className="text-secondary ms-2">
                  บันทึกเฉพาะที่กรอกค่า
                </span>
              </h4>
            </div>
            <div className="private-card-body">
              <div className="table-responsive">
                <HotTable
                  key="ht-crm"
                  ref={hotCrmRef}
                  data={hotCrm.slice(1)}
                  colHeaders={hotCrm[0]}
                  rowHeaders
                  height="auto"
                  width="100%"
                  stretchH="all"
                  autoWrapRow
                  autoWrapCol
                  licenseKey="non-commercial-and-evaluation"
                  className="ht-theme-main htCenter"
                  columns={[
                    { data: 0, readOnly: true },
                    { data: 1, readOnly: true },
                    ...headersCrm.map((_h: string, idx: number) => ({
                      data: idx + 2,
                    })),
                  ]}
                  // โ… ใช้ keyCrmCert และบันทึกค่าไปยัง certificateValue (ผ่าน preValue carrier)
                  afterChange={(changes, source) => {
                    if (!changes || source === 'loadData') return;
                    const changeList: [string, string, string, string][] = [];
                    changes.forEach(([row, col, _oldVal, newVal]) => {
                      const rowIndex = Number(row),
                        colIndex = Number(col);
                      const rowId = String(rowIndex + 1);
                      if (colIndex < 2) return;

                      const headerShort = headersCrm[colIndex - 2];
                      const meta = crmMeta[rowIndex];
                      if (!meta) return;

                      const src = crmService[meta.serviceIdx];
                      const cell = src?.result.find(
                        (r: any) =>
                          (r.repeatNumber ?? 1) === meta.rep &&
                          r.laboratorySetting.laboratory.shortNameBefore ===
                            headerShort
                      );
                      if (!cell) return;

                      const key = keyCrmCert(cell);
                      changeList.push([
                        key,
                        String(newVal ?? ''),
                        rowId,
                        headerShort,
                      ]);
                    });
                    if (changeList.length) handleInputChange(changeList);
                  }}
                  afterPaste={data => {
                    const startRow = 0,
                      startCol = 2;
                    const changeList: [string, string, string, string][] = [];
                    data.forEach((rowVals, rOffset) => {
                      rowVals.forEach((val, cOffset) => {
                        const rowIndex = startRow + rOffset,
                          colIndex = startCol + cOffset;
                        const rowId = String(rowIndex + 1);
                        const headerShort = headersCrm[colIndex - 2];
                        const meta = crmMeta[rowIndex];
                        if (!meta || !headerShort) return;

                        const src = crmService[meta.serviceIdx];
                        const cell = src?.result.find(
                          (r: any) =>
                            (r.repeatNumber ?? 1) === meta.rep &&
                            r.laboratorySetting.laboratory.shortNameBefore ===
                              headerShort
                        );
                        if (!cell) return;

                        const key = keyCrmCert(cell);
                        changeList.push([
                          key,
                          String(val ?? ''),
                          rowId,
                          headerShort,
                        ]);
                      });
                    });
                    if (changeList.length) handleInputChange(changeList);
                  }}
                />
              </div>

              <div className="private-action-footer">
                <div className="row row-demo-grid">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: '120px' }}
                    onClick={handleSubmit}
                  >
                    ต่อไป
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger ms-auto"
                    style={{ width: '120px' }}
                    onClick={() =>
                      setShowConfirm({ type: 'cancel', show: true })
                    }
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ยืนยันการยกเลิก"
          text="คุณต้องการยกเลิกการบันทึกหรือไม่?"
          action={showConfirm.type}
          onConfirm={handleCancel}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};
