import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import LabResultSummaryCard from '@/components/pages/lab-result/LabResultSummaryCard';
import { GetResultComponent } from '@/components/pages/lab-result-muti-input/InputResult';
import { ResultComponent } from '@/components/pages/lab-result-muti-input/Result';
import { getAllLaboratories } from '@/services/api/laboratory/LaboratoryApi';
import { getAnalysisStandardsByCalendar } from '@/services/api/standard-sample/AnalysisStandardsAPI';
import { Laboratory } from '@/types/Laboratory';
import { QrCode } from '@/types/qr-code/QrCode';
import { LabResult } from '@/types/result/Result';
import { sampleBlankResultInfo } from '@/types/sample-blank/sampleBlankResult';
import {
  StandardType,
  AnalysisStandardInterface,
} from '@/types/standard-sample/AnalysisStandards';

const LabResultMultiInput: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [serviceCalendarId, setServiceCalendarId] = useState<number | null>(
    null
  );
  const [analysisService, setAnalysisService] = useState<
    Array<{
      qrCode: QrCode;
      result: sampleBlankResultInfo[];
    }>
  >([]);
  const [blankService, setBlankService] = useState<
    Array<{ code: string; result: any[] }>
  >([]);
  const [crmService, setCrmService] = useState<
    Array<{ code: string; result: any[] }>
  >([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);

  // โหลดครั้งเดียว
  useEffect(() => {
    (async () => {
      try {
        const labs = await getAllLaboratories();
        setLaboratories(labs || []);
      } catch (e) {
        console.error('load laboratories failed', e);
      }
    })();
  }, []);
  // ทำ map id -> lab
  const labById = useMemo(
    () =>
      new Map<number, Laboratory>(laboratories.map(l => [l.laboratoryId, l])),
    [laboratories]
  );

  // helper คืน meta (fallback ถ้าไม่เจอ)
  const labMeta = (labId?: number) => {
    const lab = labId ? labById.get(labId) : undefined;
    return {
      shortNameBefore: lab?.shortNameBefore ?? `LAB-${labId ?? ''}`,
      unitBefore: lab?.unitBefore ?? '',
    };
  };

  useEffect(() => {
    const { serviceCalendarId: id, analysisService: data } =
      location.state || {};
    if (id) {
      setServiceCalendarId(id);
      setAnalysisService(data || []); // Set analysisService from location.state
    } else navigate('/officer/lab-result');
  }, [location.state, navigate]);

  useEffect(() => {
    if (!serviceCalendarId || laboratories.length === 0) return;

    (async () => {
      const list: AnalysisStandardInterface[] =
        await getAnalysisStandardsByCalendar(serviceCalendarId);

      const blanks = list
        .filter(s => s.type === StandardType.BLANK)
        .map(s => ({
          code: s.name ?? `Blank-${s.analysisStandardId}`,
          result: s.analysisStandardResults.map(r => ({
            analysisStandardResultId: r.analysisStandardResultId,
            preValue: r.preValue ?? null,
            repeatNumber: r.repeatNumber ?? 1,
            laboratoryId: r.laboratoryId,
            laboratorySetting: {
              laboratory: labMeta(r.laboratoryId), // ✅ lookup จาก labId
            },
          })),
        }));

      // ⬇️ CRM: bind certificateValue (จาก standard_certificates) + standardId + laboratoryId
      const crms = list
        .filter(s => s.type === StandardType.CRM)
        .map(s => {
          const stdId = s.standardId ?? s.standard?.standardId;
          const certs = s.standard?.standardCertificates ?? [];
          return {
            code:
              s.standard?.standardName ??
              s.name ??
              `CRM-${s.analysisStandardId}`,
            result: s.analysisStandardResults.map(r => {
              const matchedCert = certs.find(
                (c: any) => c.laboratoryId === r.laboratoryId
              );
              return {
                analysisStandardResultId: r.analysisStandardResultId, // ยังส่งมาเผื่อใช้ในขั้นรายงาน
                certificateValue: matchedCert?.certificateValue ?? null, // ✅ ใช้ค่านี้ใน UI
                repeatNumber: r.repeatNumber ?? 1,
                laboratoryId: r.laboratoryId,
                standardId: stdId,
                laboratorySetting: {
                  laboratory: labMeta(r.laboratoryId),
                },
              };
            }),
          };
        });

      setBlankService(blanks);
      setCrmService(crms);
    })();
  }, [serviceCalendarId, laboratories.length]);

  const handleNextStep2 = (params: {
    data: LabResult[];
    edited: LabResult[];
  }) => {
    setStep(2);
    localStorage.setItem('LabResultData', JSON.stringify(params.data));
    localStorage.setItem('EditedData', JSON.stringify(params.edited));
  };

  const handleBack = () => {
    localStorage.removeItem('LabResults'); // ล้างข้อมูลที่กรอกใน Add22Component
    setStep(1);
  };

  const handleSubmit = () => {
    const storedSelectedParams = localStorage.getItem('selectedParams');
    const storedLabResults = localStorage.getItem('LabResultData');

    console.log(storedSelectedParams ? JSON.parse(storedSelectedParams) : '');
    console.log(
      'data get result',
      storedLabResults ? JSON.parse(storedLabResults) : ''
    );
    navigate('/officer/lab-result');
  };

  const handleCancel = () => {
    navigate('/officer/lab-result');
  };

  return (
    <div>
      {/* โหมดตาราง (Handsontable) ออกแบบมาสำหรับจอใหญ่ — แจ้งผู้ใช้มือถือให้ใช้จอใหญ่แทน */}
      <div className="alert alert-info d-lg-none" role="alert">
        <i className="fas fa-desktop me-2" />
        หน้ากรอกผลแบบตารางเหมาะกับจอคอมพิวเตอร์/แท็บเล็ตแนวนอน
        หากใช้มือถืออาจกรอกไม่สะดวก
      </div>
      {/* Cards Section */}
      <LabResultSummaryCard />
      {serviceCalendarId && (
        <>
          {step === 1 && (
            <GetResultComponent
              onNext={handleNextStep2}
              onBack={handleBack}
              serviceCalendarId={serviceCalendarId}
              analysisService={analysisService}
              blankService={blankService}
              crmService={crmService}
              onCancel={handleCancel}
            />
          )}
          {step === 2 && (
            <ResultComponent
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              data={JSON.parse(localStorage.getItem('LabResultData') || '[]')}
              edited={JSON.parse(localStorage.getItem('EditedData') || '[]')}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LabResultMultiInput;
