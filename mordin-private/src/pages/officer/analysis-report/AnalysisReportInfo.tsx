import JSZip from 'jszip';
import { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';

import SampleFlow from '@/components/gui/SampleFlow';
import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import { AnalysisReportInfoSummaryCard } from '@/components/pages/analysis-report/AnalysisReportSummaryCard';
import AnalysisResultTable from '@/components/pages/analysis-report/AnalysisResultTable';
import InfoTable from '@/components/pages/analysis-report/Infotable';
import ResultGradeTable from '@/components/pages/analysis-report/ResultGradeTable';
import ServiceFertilizerMajorTable from '@/components/pages/analysis-report/ServiceFertilizerMajorTable';
import ServiceFertilizerMinorTable from '@/components/pages/analysis-report/ServiceFertilizerMinorTable';
import PrintableSampleCard from '@/components/printable/PrintableSampleCard';
import { getReports, getReportsPdf } from '@/services/api/qr-code/BookApi';
import { PrintReportInterface, SampleCodes } from '@/types/qr-code/Report';
import { TimeStampToDate } from '@/utils/Date';
import { swalError, swalLoading, swalClose } from '@/utils/swal';

// const cardData2 = [
//   {
//     color: 'bg-secondary',
//     icon: 'fas fa-map-marked',
//     num: 2,
//     name: 'แปลง',
//     desc: 'จำนวนแปลงทั้งหมด',
//   },
//   {
//     color: 'bg-danger',
//     icon: 'fas fa-map-marked',
//     num: 0,
//     name: 'ดินต้องปรับปรุง',
//     desc: 'ดินต้องปรับปรุง 0/2 = 0%',
//   },
//   {
//     color: 'bg-primary',
//     icon: 'fas fa-map-marked',
//     num: 2,
//     name: 'ดินปกติ',
//     desc: 'ดินปกติ 2/2 = 100%',
//   },
//   {
//     color: 'bg-success',
//     icon: 'fas fa-map-marked',
//     num: 0,
//     name: 'ดินสมบูรณ์',
//     desc: 'ดินสมบูรณ์ 0/2 = 0%',
//   },
// ];

interface PrintQRCodeProps {
  onPrint: () => void;
  onPrintReport: () => void;
  isReportApproved: boolean;
  isLoadingFile?: boolean;
}

const PrintQRCode = ({
  onPrint,
  onPrintReport,
  isReportApproved,
  isLoadingFile,
}: PrintQRCodeProps) => {
  return (
    <div className="col-md-4">
      <div className="private-card">
        <div className="private-card-header">
          <div className="row row-demo-grid">
            <div className="col-md-8 col-sm-8 col-8 text-start">
              <h4 className="private-card-title">Print QR code</h4>
            </div>
          </div>
        </div>
        <div className="private-card-body">
          <div className="text-center p-2">
            <button
              type="button"
              className="btn btn-success"
              style={{ width: '180px' }}
              onClick={onPrint}
            >
              Print QR codes
            </button>
          </div>
          {/* <div className="text-center p-2">
            <a
              className="btn btn-warning text-white"
              style={{ width: '180px' }}
            >
              แจ้งเตือนเกษตรกร
            </a>
          </div> */}
          <div className="text-center p-2">
            <button
              type="button"
              className={`btn ${isReportApproved ? 'btn-secondary' : 'btn-light'}`}
              style={{
                width: '180px',
                cursor: isReportApproved ? 'pointer' : 'not-allowed',
              }}
              onClick={onPrintReport}
              disabled={!isReportApproved || isLoadingFile}
            >
              {isLoadingFile ? 'กำลังสร้าง PDF...' : 'Print report'}
            </button>
            {!isReportApproved && (
              <div className="text-danger mt-2" style={{ fontSize: '0.85rem' }}>
                * สามารถพิมพ์ได้เมื่อสถานะ Approved เท่านั้น
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisReportInfo = () => {
  const { sampleCode } = useParams();
  const printRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<MapMarkerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<PrintReportInterface>(
    {} as PrintReportInterface
  );
  const [downloadingReport, setDownloadingReport] = useState(false);

  const getCoordinateValue = (value: unknown): number | null => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue !== 0
      ? numericValue
      : null;
  };

  const latitude =
    getCoordinateValue(reportData.land?.latitude) ??
    getCoordinateValue(reportData.latitude);
  const longitude =
    getCoordinateValue(reportData.land?.longitude) ??
    getCoordinateValue(reportData.longitude);
  const hasValidLocation = latitude !== null && longitude !== null;

  const fetchReport = async () => {
    try {
      setLoading(true);
      if (sampleCode) {
        const playload: SampleCodes = {
          sampleCodes: [sampleCode],
        };
        const data = await getReports(playload);
        const report = data[0];

        setReportData(report);

        const reportLatitude =
          getCoordinateValue(report.land?.latitude) ??
          getCoordinateValue(report.latitude);
        const reportLongitude =
          getCoordinateValue(report.land?.longitude) ??
          getCoordinateValue(report.longitude);

        if (reportLatitude !== null && reportLongitude !== null) {
          setLocation([
            {
              id: report.land?.landId || report.bookId || 0,
              lat: reportLatitude,
              lng: reportLongitude,
            },
          ]);
        } else {
          setLocation([]);
        }
      }
    } catch (error) {
      console.error('Error loading analysis report:', error);
      setLocation([]);
      swalError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลรายงานการวิเคราะห์ได้');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleCode]);

  // เตรียมข้อมูล labels
  const BASE = import.meta.env.VITE_BASE_URL || window.location.origin;
  const labels = reportData.sampleCode
    ? [
        {
          qrValue: `${BASE}/private/officer/analysis-report/${reportData.sampleCode}`,
          sampleCode: reportData.sampleCode ?? '',
          receivedDate: TimeStampToDate(reportData.sampleReceivedAt),
          sequence: 1,
        },
      ]
    : [];
  // const LABEL_WIDTH_MM = 50;
  // const LABEL_HEIGHT_MM = 80;
  // react-to-print
  const pageStyle = `
  @page {
    size: 50mm 50mm;
    margin: 0;
  }
`;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `qrcode_${Date.now()}`,
    pageStyle,
  });

  const handlePrintReport = async () => {
    if (!sampleCode) return;

    swalLoading('กำลังเตรียมไฟล์…');

    try {
      setDownloadingReport(true);
      const zipBlob = await getReportsPdf({ sampleCodes: [sampleCode] });

      if (zipBlob.type === 'application/json') {
        const text = await zipBlob.text();
        const error = JSON.parse(text);
        throw new Error(error.message || 'Server returned JSON error');
      }

      const zip = await JSZip.loadAsync(zipBlob);
      const fileNames = Object.keys(zip.files);
      let pdfBuffer: ArrayBuffer | null = null;

      for (const fileName of fileNames) {
        if (fileName.toLowerCase().endsWith('.pdf')) {
          pdfBuffer = await zip.files[fileName].async('arraybuffer');
          break;
        }
      }

      if (!pdfBuffer) {
        throw new Error('ไม่พบไฟล์ PDF ใน ZIP');
      }

      const pdfBlobFile = new Blob([pdfBuffer], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlobFile);
      window.open(blobUrl, '_blank');

      swalClose();
    } catch (error) {
      console.error('Failed to print report', error);
      swalClose();
      swalError('ข้อผิดพลาด', 'ไม่สามารถสร้างหรือเปิดไฟล์ Report ได้');
    } finally {
      setDownloadingReport(false);
    }
  };

  return (
    <>
      {/* Cards Section */}
      <AnalysisReportInfoSummaryCard />

      {/* Timeline สถานะตัวอย่าง */}
      {!loading && reportData.qrCode?.status && (
        <SampleFlow status={reportData.qrCode.status} />
      )}

      {/* Farmer and Plot Info Section */}
      <div className="row">
        {/* Farmer Info */}
        <div className="col-md-4">
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-8 col-sm-8 col-8"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="private-card-title">
                    ข้อมูลเกษตรกร{' '}
                    {reportData.farmer ? `(${reportData.farmer.phone})` : ''}
                  </h4>
                </div>
                {loading ? (
                  ''
                ) : (
                  <div
                    className="col-md-4 col-sm-4 col-4 ms-auto"
                    style={{ textAlign: 'right' }}
                  >
                    <GenButtonCircle
                      color={B_LIST.list.color}
                      icon={B_LIST.list.icon}
                      link="/admin/farmer"
                      className="mx-1"
                    />
                    <GenButtonCircle
                      color={B_LIST.edit.color}
                      icon={B_LIST.edit.icon}
                      link={`/admin/farmer/${reportData.farmer?.farmerId}/edit`}
                    />
                  </div>
                )}
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
                <div className="col-md-12 ms-auto me-auto">
                  <div className="row p-4">
                    <table style={{ minHeight: '205px' }}>
                      <tbody>
                        <tr>
                          <th>ประเภทบัตร</th>
                          <td>
                            {reportData.farmer?.thaiFarmerId
                              ? 'บัตรเกษตรกร'
                              : 'บัตรประชาชน'}
                          </td>
                        </tr>
                        <tr>
                          <th>หมายเลขบัตร</th>
                          <td>
                            {reportData.farmer?.thaiFarmerId
                              ? reportData.farmer?.thaiFarmerId
                              : reportData.farmer?.thaiNationalId}
                          </td>
                        </tr>
                        <tr>
                          <th>ชื่อ นามสกุล</th>
                          <td>
                            {reportData.farmer?.firstName}{' '}
                            {reportData.farmer?.lastName}
                          </td>
                        </tr>
                        <tr>
                          <th>โทรศัพท์</th>
                          <td>{reportData.farmer?.phone}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plot Info */}
        <div className="col-md-4">
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-8 col-sm-8 col-8"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="private-card-title">
                    ข้อมูลแปลง
                    {reportData.land ? `(${reportData.land.name})` : ''}
                  </h4>
                </div>
                {loading ? (
                  ''
                ) : (
                  <div
                    className="col-md-4 col-sm-4 col-4 ms-auto"
                    style={{ textAlign: 'right' }}
                  >
                    <GenButtonCircle
                      color={B_LIST.list.color}
                      icon={B_LIST.list.icon}
                      link="/admin/land"
                      className="mx-1"
                    />
                    <GenButtonCircle
                      color={B_LIST.edit.color}
                      icon={B_LIST.edit.icon}
                      link={`/admin/land/${reportData.land?.landId}/edit`}
                    />
                  </div>
                )}
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
                <div className="col-md-12 ms-auto me-auto">
                  <div className="row p-4">
                    <table style={{ minHeight: '205px' }}>
                      <tbody>
                        <tr>
                          <th>รหัสโควต้าอ้อย</th>
                          <td>{reportData.land?.quotaCode || '-'}</td>
                        </tr>
                        <tr>
                          <th>หมายเลขแปลง</th>
                          <td>{reportData.land?.landId || '-'}</td>
                        </tr>
                        <tr>
                          <th>ชื่อแปลง</th>
                          <td>{reportData.land?.name || ''}</td>
                        </tr>
                        <tr>
                          <td colSpan={2}>&nbsp;</td>
                        </tr>
                        <tr>
                          <th>พิกัด</th>
                          <td>
                            {hasValidLocation
                              ? `${latitude}, ${longitude}`
                              : '-'}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2}>&nbsp;</td>
                        </tr>
                        <tr>
                          <th>อำเภอ</th>
                          <td>
                            {reportData.land?.subdistrict.district?.nameTh ||
                              '-'}
                          </td>
                        </tr>
                        <tr>
                          <th>จังหวัด</th>
                          <td>
                            {reportData.land?.subdistrict?.district?.province
                              ?.nameTh || '-'}
                          </td>
                        </tr>
                        <tr>
                          <th>ที่อยู่</th>
                          <td>{`${reportData.land?.village} ต.${reportData.land?.subdistrict?.nameTh} อ.${
                            reportData.land?.subdistrict.district?.nameTh
                          } จ.${
                            reportData.land?.subdistrict?.district?.province
                              ?.nameTh
                          } ${reportData.land?.zipCode}`}</td>
                        </tr>
                        <tr>
                          <td colSpan={2}>&nbsp;</td>
                        </tr>
                        <tr>
                          <th>รวมพื้นที่</th>
                          <td>{reportData.land?.areaSize} ไร่</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plot Coordinates */}
        <div className="col-md-4">
          <div className="private-card">
            <div className="private-card-header">
              <div className="private-card-title">พิกัดแปลง</div>
            </div>
            <div className="private-card-body">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : !hasValidLocation ? (
                <div className="text-center p-5 text-muted">ไม่พบพิกัดแปลง</div>
              ) : (
                <LeafletMap markers={location} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <InfoTable
          title="การจองและการเก็บดิน"
          data={{
            'รหัส QR code จอง': reportData.qrCode?.qrCode,
            'วัน-เวลา ดำเนินการจอง': TimeStampToDate(reportData.bookedAt),
            'วัน-เวลา เก็บดิน': TimeStampToDate(reportData.collectSampleAt),
          }}
          loading={loading}
        />
        <InfoTable
          title="การรับบริการ"
          data={{
            รหัสตัวอย่าง: reportData.sampleCode || '-',
            'วัน-เวลา ส่งดินวิเคราะห์': TimeStampToDate(
              reportData.sampleReceivedAt
            ),
            ประเภทการรับบริการ: reportData.serviceType?.name,
            ทดสอบ:
              reportData?.results
                ?.map(res => res.laboratorySetting.laboratory.shortNameAfter)
                .join(', ') || '-',
          }}
          loading={loading}
        />
        <PrintQRCode
          onPrint={() => handlePrint()}
          onPrintReport={handlePrintReport}
          isReportApproved={reportData?.qrCode?.status === 'approved'}
          isLoadingFile={downloadingReport}
        />
      </div>
      {/* Preview continuous labels on-screen
      {labels.length > 0 && (
        <div
          className="mt-4"
          style={{
            width: '50mm',
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            margin: '0 auto',
            background: '#fafafa',
          }}
        >
          <PrintableSampleCard labels={labels} />
        </div>
      )} */}

      <AnalysisResultTable
        resultData={reportData.results}
        loading={loading}
        onSuccess={fetchReport}
      />
      <ResultGradeTable reportData={reportData} loading={loading} />
      <ServiceFertilizerMajorTable reportData={reportData} loading={loading} />
      <ServiceFertilizerMinorTable
        servMinor={reportData.ferMinorLandUsages}
        loading={loading}
      />
      {/* print-area: ซ่อนบนจอ แต่แสดงเมื่อสั่งพิมพ์ (ใช้ wrapper hidden) */}
      <div style={{ position: 'absolute', left: '-10000px', top: 0 }}>
        <div ref={printRef} className="print-area">
          {labels.map((label, i) => (
            <div
              // eslint-disable-next-line react-x/no-array-index-key
              key={i}
              className="print-page"
              style={{
                width: '50mm',
                height: '50mm',
                // กำหนดให้หลังแต่ละหน้าเว้น page-break
                pageBreakAfter: i < labels.length - 1 ? 'always' : 'auto',
              }}
            >
              {/* ส่งแค่ label เดียวให้ PrintableSampleCard */}
              <PrintableSampleCard labels={[label]} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
export default AnalysisReportInfo;
