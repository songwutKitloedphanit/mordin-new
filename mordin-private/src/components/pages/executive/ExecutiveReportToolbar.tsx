import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import SarabunBold from '@/assets/fonts/sarabun/Sarabun-Bold.ttf';
import SarabunLight from '@/assets/fonts/sarabun/Sarabun-Light.ttf';
import SarabunRegular from '@/assets/fonts/sarabun/Sarabun-Regular.ttf';
import type { DashboardReportData } from '@/components/pages/executive/executive-report';
import ExecutiveDashboardReportPrint from '@/components/pages/executive/ExecutiveDashboardReportPrint';

interface ReportFilter {
  label: string;
  value?: string | number | null;
}

interface ExecutiveReportToolbarProps {
  title: string;
  filters: ReportFilter[];
  disabled?: boolean;
  buildReportData: () => Omit<
    DashboardReportData,
    'title' | 'generatedAt' | 'filters'
  >;
}

const ExecutiveReportToolbar = ({
  title,
  filters,
  disabled = false,
  buildReportData,
}: ExecutiveReportToolbarProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reportData, setReportData] = useState<DashboardReportData | null>(
    null
  );
  const printRef = useRef<HTMLElement>(null);
  const pendingPrintRef = useRef(false);
  const visibleFilters = filters.filter(
    filter =>
      filter.value !== undefined && filter.value !== null && filter.value !== ''
  );

  const printReport = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
    fonts: [
      { family: 'Sarabun', source: SarabunLight, weight: '300' },
      { family: 'Sarabun', source: SarabunRegular, weight: '400' },
      { family: 'Sarabun', source: SarabunBold, weight: '700' },
    ],
    onBeforePrint: async () => {
      await document.fonts.ready;
    },
    onAfterPrint: () => {
      setIsGenerating(false);
    },
    onPrintError: (_location, error) => {
      console.error('Cannot print dashboard report:', error);
      setErrorMessage('ไม่สามารถเปิดหน้าพิมพ์รายงานได้ กรุณาลองใหม่อีกครั้ง');
      setIsGenerating(false);
    },
  });

  useEffect(() => {
    if (!reportData || !pendingPrintRef.current) return;

    pendingPrintRef.current = false;
    const timer = window.setTimeout(() => {
      void printReport();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [printReport, reportData]);

  const handleGeneratePdf = () => {
    setErrorMessage(null);
    setIsGenerating(true);
    const now = new Date();
    try {
      const payload: DashboardReportData = {
        title,
        generatedAt: now,
        filters: visibleFilters.map(f => ({
          label: f.label,
          value: String(f.value),
        })),
        ...buildReportData(),
      };
      pendingPrintRef.current = true;
      setReportData(payload);
    } catch (error) {
      console.error('Cannot prepare dashboard report:', error);
      setErrorMessage('ไม่สามารถสร้างรายงานได้ กรุณาลองใหม่อีกครั้ง');
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="private-card mb-4 executive-report-no-print">
        <div className="private-card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h4 className="private-card-title mb-1">
              <i className="fas fa-file-pdf text-danger me-2" />
              รายงานสำหรับนำเสนอ
            </h4>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={disabled || isGenerating}
            onClick={handleGeneratePdf}
          >
            {isGenerating ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                กำลังสร้างรายงาน…
              </>
            ) : (
              <>
                <i className="fas fa-file-pdf me-2" />
                ทำรายงานนำเสนอ
              </>
            )}
          </button>
        </div>
        {errorMessage && (
          <div className="alert alert-danger mx-3 mb-3" role="alert">
            {errorMessage}
          </div>
        )}
      </div>
      <div
        aria-hidden="true"
        style={{ position: 'fixed', left: '-10000px', top: 0 }}
      >
        {reportData && (
          <ExecutiveDashboardReportPrint ref={printRef} data={reportData} />
        )}
      </div>
    </>
  );
};

export default ExecutiveReportToolbar;
