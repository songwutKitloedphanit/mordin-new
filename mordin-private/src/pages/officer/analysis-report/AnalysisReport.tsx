import { Buffer } from 'buffer';

import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import React, { useEffect, useState } from 'react';
import { swalWarning, swalError, swalLoading, swalClose } from '@/utils/swal';
// เพิ่ม import สำหรับจัดการ ZIP และ PDF

import { GenButtonCircle } from '@/components/gui/GuiButton';
import {
  GenFormDate2,
  GenFormSelect,
  MarkedDateStatus,
} from '@/components/gui/GuiForm';
import {
  findSampleForReportPages,
  getReportsPdf,
} from '@/services/api/qr-code/BookApi';
import { approvedQrCodeSampleByBookId } from '@/services/api/qr-code/QrCodeApi';
import { searchServiceCalendars } from '@/services/api/ServiceCalendarApi';
import { Bus } from '@/types/Bus';
import { SampleStatusEnum } from '@/types/qr-code/QrCode';
import { BookIds, ReportInfo, SampleCodes } from '@/types/qr-code/Report';
import {
  CalendarInfoInterface,
  SearchServiceCalendar,
  ServiceCalendarWithStatus,
} from '@/types/ServiceCalendar';
import { TimeStampToDate } from '@/utils/Date';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';

if (!window.Buffer) {
  window.Buffer = Buffer;
}

const AnalysisReport: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [serviceDate, setServiceDate] = useState<string>(today);
  const [serviceCalendars, setServiceCalendars] = useState<
    CalendarInfoInterface[]
  >([]);
  const [selectedServiceCalendar, setSelectedServiceCalendar] =
    useState<CalendarInfoInterface | null>(null);
  const [matchCalendar, setMatchCalendar] = useState<CalendarInfoInterface[]>(
    []
  );
  const [markedDates, setMarkedDates] = useState<MarkedDateStatus[]>([]);
  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);

  const [selectedPrints, setSelectedPrints] = useState<string[]>([]);
  const [selectedApproves, setSelectedApproves] = useState<number[]>([]);

  const [reports, setReports] = useState<ReportInfo[]>([]);

  const [isAllApproves, setIsAllApproves] = useState(false);
  const [isAllPrints, setIsAllPrints] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState<SearchServiceCalendar>(
    {} as SearchServiceCalendar
  );

  const [searchAnalyzing, setSearchAnalyzing] = useState('');
  const [searchApproved, setSearchApproved] = useState('');

  const hasText = (value?: string | null) =>
    typeof value === 'string' && value.trim().length > 0;

  const hasRequiredReportData = (report: ReportInfo) => {
    const book = report.qrCode?.book;
    const farmer = book?.farmer;
    const land = book?.land;

    return Boolean(
      hasText(book?.sampleCode) &&
        farmer?.farmerId &&
        hasText(farmer.firstName) &&
        hasText(farmer.lastName) &&
        farmer.factoryId &&
        land?.landId &&
        (hasText(land.name) || hasText(land.landCode)) &&
        Number(land.areaSize) > 0 &&
        hasText(land.subdistrictCode)
    );
  };

  const getApprovalBlockReason = (report: ReportInfo) => {
    if (report.qrCode?.status !== SampleStatusEnum.ANALYZED) return null;
    if (report.hasCompleteGradeConfig === false) return 'grade';
    if (!hasRequiredReportData(report)) return 'report-data';
    return null;
  };

  const canApproveReport = (report: ReportInfo) =>
    report.qrCode?.status === SampleStatusEnum.ANALYZED &&
    getApprovalBlockReason(report) === null;

  const fetchCalendar = async () => {
    const payload: SearchServiceCalendar = {
      ...searchParam,
      all: true,
    };
    const calData = await searchServiceCalendars(payload);

    setServiceCalendars(calData.data);
    setMarkedDates(
      calData.data.map((c: ServiceCalendarWithStatus) => ({
        date: new Date(c.date).toISOString().split('T')[0],
        status: c.approvedStatus,
      }))
    );
  };

  useEffect(() => {
    fetchCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam]);

  useEffect(() => {
    const matched = serviceCalendars.filter(
      c => new Date(c.date).toISOString().split('T')[0] === serviceDate
    );
    if (matched.length > 0) {
      setMatchCalendar(matched);
      setBuses(matched.map(item => item.bus));
      setSelectedCar(matched[0].bus.busId);
    } else {
      setMatchCalendar([]);
      setBuses([]);
      setSelectedCar(null);
      setSelectedServiceCalendar(null);
    }
    setIsAllApproves(false);
    setIsAllPrints(false);
    setSelectedApproves([]);
    setSelectedPrints([]);
  }, [serviceCalendars, serviceDate]);

  const fetchAndSetBook = async (calendarId: number) => {
    setLoading(true);

    const data = await findSampleForReportPages(calendarId);
    setReports(data);
    setLoading(false);
  };
  useEffect(() => {
    if (!selectedCar) return;

    const found = matchCalendar.find(m => m.bus.busId === selectedCar);
    if (!found) {
      setSelectedServiceCalendar(null);
      return;
    }
    setSelectedServiceCalendar(found);
    fetchAndSetBook(found.serviceCalendarId);
  }, [matchCalendar, selectedCar]);

  const handleSelectAll = (title: string) => {
    if (title === 'approve') {
      if (isAllApproves) {
        setSelectedApproves([]);
        setIsAllApproves(false);
      } else {
        const allIds = reports
          .filter(canApproveReport)
          .map(report => report.qrCode?.book?.bookId);
        setSelectedApproves(allIds);
        setIsAllApproves(true);
      }
    } else {
      if (isAllPrints) {
        setSelectedPrints([]);
        setIsAllPrints(false);
      } else {
        const allIds = reports
          .filter(report => report.qrCode?.status === SampleStatusEnum.APPROVED)
          .map(report => report.qrCode?.book?.sampleCode);
        setSelectedPrints(allIds);
        setIsAllPrints(true);
      }
    }
  };

  const handleSelectRow = (bookId?: number | null, sampleCode?: string) => {
    if (bookId) {
      let updated;
      if (selectedApproves.includes(bookId)) {
        updated = selectedApproves.filter(i => i !== bookId);
      } else {
        updated = [...selectedApproves, bookId];
      }
      setSelectedApproves(updated);
      const allApproveIds = reports
        .filter(canApproveReport)
        .map(report => report.qrCode?.book?.bookId);
      setIsAllApproves(
        updated.length === allApproveIds.length &&
          allApproveIds.every(id => updated.includes(id))
      );
    }

    if (sampleCode) {
      let updated;
      if (selectedPrints.includes(sampleCode)) {
        updated = selectedPrints.filter(i => i !== sampleCode);
      } else {
        updated = [...selectedPrints, sampleCode];
      }
      setSelectedPrints(updated);

      const allPrintIds = reports
        .filter(report => report.qrCode?.status === SampleStatusEnum.APPROVED)
        .map(report => report.qrCode?.book?.sampleCode);
      setIsAllPrints(
        updated.length === allPrintIds.length &&
          allPrintIds.every(sampleCode => updated.includes(sampleCode))
      );
    }
  };

  const handleApprove = async () => {
    try {
      const playload: BookIds = {
        bookIds: selectedApproves,
      };

      if (!playload.bookIds || playload.bookIds.length === 0) {
        swalWarning('ยังไม่ได้เลือกตัวอย่าง', 'กรุณาเลือกตัวอย่างที่ต้องการยืนยัน');
        return;
      }
      const unavailableReports = reports.filter(
        report =>
          selectedApproves.includes(report.qrCode?.book?.bookId || 0) &&
          !canApproveReport(report)
      );

      if (unavailableReports.length > 0) {
        swalWarning('ยังอนุมัติไม่ได้', 'ตัวอย่างที่เลือกยังไม่มีเกณฑ์สี/คะแนนจริงครบถ้วน');
        return;
      }

      await approvedQrCodeSampleByBookId(playload);
    } catch (error) {
      console.error(error);
    } finally {
      fetchAndSetBook(Number(selectedServiceCalendar?.serviceCalendarId));
      fetchCalendar();
    }
  };

  const handleDownload = async (sampleCodes?: string[]) => {
    const payload: SampleCodes = {
      sampleCodes: sampleCodes ?? selectedPrints,
    };

    if (!payload.sampleCodes || payload.sampleCodes.length === 0) {
      swalWarning('ยังไม่ได้เลือกตัวอย่าง', 'กรุณาเลือกตัวอย่างที่ต้องการดาวน์โหลด');
      return;
    }

    swalLoading('กำลังเตรียมไฟล์…');

    try {
      const responseBlob = await getReportsPdf(payload);

      if (responseBlob.type === 'application/json') {
        const text = await responseBlob.text();
        const error = JSON.parse(text);
        throw new Error(
          error.message || 'Server returned JSON error instead of Blob'
        );
      }

      const blobUrl = URL.createObjectURL(responseBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `reports_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      swalClose();
    } catch (error) {
      console.error('error', error);
      swalClose();
      swalError('เกิดข้อผิดพลาด!', 'ไม่สามารถดาวน์โหลดไฟล์ได้ กรุณาลองใหม่');
    }
  };

  // ----------------------------------------------------------------
  // ส่วนที่แก้ไข: handlePrint - แตกไฟล์ ZIP และรวม PDF เพื่อสั่งพิมพ์
  // ----------------------------------------------------------------
  const handlePrint = async (sampleCodes?: string[]) => {
    const payload: SampleCodes = {
      sampleCodes: sampleCodes ?? selectedPrints,
    };

    if (!payload.sampleCodes || payload.sampleCodes.length === 0) {
      swalWarning('ยังไม่ได้เลือกตัวอย่าง', 'กรุณาเลือกตัวอย่างที่ต้องการพิมพ์');
      return;
    }

    swalLoading('กำลังประมวลผล…');

    try {
      // 1. ดาวน์โหลดไฟล์ ZIP มาก่อน
      const zipBlob = await getReportsPdf(payload);

      if (zipBlob.type === 'application/json') {
        const text = await zipBlob.text();
        const error = JSON.parse(text);
        throw new Error(error.message || 'Server returned JSON error');
      }

      // 2. ใช้ JSZip แตกไฟล์
      const zip = await JSZip.loadAsync(zipBlob);

      // 3. สร้าง PDF ใหม่สำหรับรวมไฟล์ทั้งหมด
      const mergedPdf = await PDFDocument.create();
      let pdfCount = 0;

      // วนลูปดึงไฟล์ PDF จากใน ZIP
      const fileNames = Object.keys(zip.files);
      for (const fileName of fileNames) {
        if (fileName.toLowerCase().endsWith('.pdf')) {
          const fileData = await zip.files[fileName].async('arraybuffer');

          // โหลด PDF ต้นฉบับ
          const pdf = await PDFDocument.load(fileData);

          // คัดลอกทุกหน้ามาใส่ใน mergedPdf
          const copiedPages = await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
          );
          copiedPages.forEach(page => mergedPdf.addPage(page));

          pdfCount++;
        }
      }

      if (pdfCount === 0) {
        throw new Error('ไม่พบไฟล์ PDF ใน ZIP');
      }

      // 4. บันทึกไฟล์ PDF ที่รวมเสร็จแล้วเป็น Blob
      const mergedPdfBytes = await mergedPdf.save();
      // ใช้ as any เพื่อเลี่ยง Error Type 'Uint8Array'
      const mergedBlob = new Blob([mergedPdfBytes as any], {
        type: 'application/pdf',
      });

      // 5. เปิดหน้าต่างใหม่เพื่อสั่งพิมพ์
      const blobUrl = URL.createObjectURL(mergedBlob);
      window.open(blobUrl, '_blank');

      swalClose();
    } catch (error) {
      console.error('Print error:', error);
      swalClose();
      swalError('เกิดข้อผิดพลาด!', 'ไม่สามารถเปิดไฟล์เพื่อพิมพ์ได้ กรุณาลองใหม่');
    }
  };

  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-calendar-alt me-2" />
                เลือกวันที่และรถ
              </h4>
            </div>
            <div className="private-card-body">
              <div className="row">
                <div className="col-md-4">
                  <GenFormDate2
                    isRequired={false}
                    id="serviceDate"
                    name="serviceDate"
                    label="วันที่ให้บริการ"
                    value={serviceDate}
                    onChange={setServiceDate}
                    desc={`ค่าเริ่มต้น คือ วันนี้ (${new Date().toLocaleDateString('th-TH')})`}
                    markedDatesWithStatus={markedDates}
                    onMonthYearChange={(year, month) =>
                      setSearchParam({ year, month })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <GenFormSelect
                    isRequired={false}
                    id="carSelect"
                    name="carSelect"
                    label="รถที่ให้บริการ"
                    value={selectedCar}
                    onChange={e => setSelectedCar(Number(e.target.value))}
                    options={buses.map(bus => ({
                      value: bus.busId,
                      name: `${bus.busNumber}-${bus.busName} (${bus.licensePlate})`,
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedServiceCalendar ? (
        <>
          <div className="row mb-4">
            <div className="col-12">
              <div className="private-card">
                <div className="private-card-header d-flex align-items-center justify-content-between">
                  <h4 className="private-card-title mb-0">
                    <i className="fas fa-flask me-2" />
                    ผลการวิเคราะห์ดิน (รอนุมัติ)
                  </h4>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleApprove}
                  >
                    <i className="fas fa-check me-2" />
                    อนุมัติ
                  </button>
                </div>
                <div className="private-card-body">
                  {loading ? (
                    <div className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      />
                    </div>
                  ) : (
                    (() => {
                      const baseReports = reports.filter(
                        report =>
                          report.qrCode?.status === SampleStatusEnum.ANALYZED ||
                          report.qrCode?.status === SampleStatusEnum.ANALYZING
                      );
                      const term = searchAnalyzing.toLowerCase();
                      const filteredReports = term
                        ? baseReports.filter(
                            r =>
                              (r.qrCode?.book?.sampleCode ?? '')
                                .toLowerCase()
                                .includes(term) ||
                              (r.qrCode?.book?.land?.landCode ?? '')
                                .toLowerCase()
                                .includes(term) ||
                              (
                                r.qrCode?.book?.farmer?.thaiNationalId ?? ''
                              ).includes(term)
                          )
                        : baseReports;
                      const readyCount =
                        baseReports.filter(canApproveReport).length;
                      const missingDataCount = baseReports.filter(
                        report =>
                          getApprovalBlockReason(report) === 'report-data'
                      ).length;
                      const missingGradeCount = baseReports.filter(
                        report => getApprovalBlockReason(report) === 'grade'
                      ).length;
                      return (
                        <>
                          {/* Filter + Summary */}
                          <div className="row g-2 mb-3 align-items-end">
                            <div className="col-md-6">
                              <label className="form-label small mb-1">
                                ค้นหา (รหัสตัวอย่าง / รหัสแปลง / เลขบัตร)
                              </label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="พิมพ์เพื่อค้นหา..."
                                value={searchAnalyzing}
                                onChange={e =>
                                  setSearchAnalyzing(e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-6 d-flex align-items-end gap-2">
                              <span className="private-chip private-chip-gray">
                                ทั้งหมด: {baseReports.length}
                              </span>
                              <span className="private-chip private-chip-green">
                                พร้อมอนุมัติ: {readyCount}
                              </span>
                              {missingGradeCount > 0 && (
                                <span className="private-chip private-chip-amber">
                                  รอเกณฑ์: {missingGradeCount}
                                </span>
                              )}
                              {missingDataCount > 0 && (
                                <span className="private-chip private-chip-red">
                                  ข้อมูลไม่ครบ: {missingDataCount}
                                </span>
                              )}
                              {filteredReports.length !==
                                baseReports.length && (
                                <span className="private-chip private-chip-blue">
                                  กรองแล้ว: {filteredReports.length}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="table-responsive">
                            <table
                              id="multi-filter-select"
                              className="display table table-striped table-hover"
                            >
                              <thead>
                                <tr className="text-center">
                                  <th style={{ width: 40 }}>#</th>
                                  <th className="text-center">
                                    {reports.filter(canApproveReport).length >
                                    0 ? (
                                      <input
                                        type="checkbox"
                                        checked={isAllApproves}
                                        onChange={() =>
                                          handleSelectAll('approve')
                                        }
                                      />
                                    ) : (
                                      ''
                                    )}
                                  </th>
                                  <th>ไฟล์รายงาน</th>
                                  <th>รหัสตัวอย่าง</th>
                                  <th>รหัสโควต้าอ้อย</th>
                                  <th>หมายเลขบัตรประชาชน</th>
                                  <th>รหัสแปลง</th>
                                  <th>สถานะ</th>
                                  <th>ผลวิเคราะห์</th>
                                  <th className="text-center">แก้ไขล่าสุด</th>
                                </tr>
                              </thead>
                              <tbody className="text-center">
                                {filteredReports.length > 0 ? (
                                  filteredReports.map((report, index) => (
                                    <tr key={report.qrCode?.qrCodeId}>
                                      <td className="text-muted small">
                                        {index + 1}
                                      </td>
                                      <td>
                                        {canApproveReport(report) ? (
                                          <input
                                            type="checkbox"
                                            checked={selectedApproves.includes(
                                              report.qrCode?.book?.bookId || 0
                                            )}
                                            onChange={() =>
                                              handleSelectRow(
                                                report.qrCode?.book?.bookId || 0
                                              )
                                            }
                                          />
                                        ) : report.qrCode?.status ===
                                          SampleStatusEnum.ANALYZED ? (
                                          getApprovalBlockReason(report) ===
                                          'report-data' ? (
                                            <span
                                              className="private-chip private-chip-red"
                                              title="ข้อมูลเกษตรกรหรือข้อมูลแปลงยังไม่ครบสำหรับออก Report"
                                            >
                                              ข้อมูลไม่ครบ
                                            </span>
                                          ) : (
                                            <span
                                              className="private-chip private-chip-gray"
                                              title="ยังไม่ได้กำหนดเกณฑ์สี/คะแนนจริง"
                                            >
                                              รอเกณฑ์
                                            </span>
                                          )
                                        ) : (
                                          ''
                                        )}
                                      </td>
                                      <td className="text-center">
                                        <GenButtonCircle
                                          color="btn-info"
                                          icon="fa fa-info"
                                          link={`/officer/analysis-report/${report.qrCode?.book?.sampleCode}`}
                                        />
                                      </td>
                                      <td className="text-center">
                                        {report.qrCode?.book?.sampleCode}
                                      </td>
                                      <td className="text-center">
                                        {report.qrCode?.book.land?.quotaCode}
                                      </td>
                                      <td className="text-center">
                                        {formatThaiNationalId(
                                          report.qrCode?.book.farmer
                                            ?.thaiNationalId ?? ''
                                        )}
                                      </td>
                                      <td className="text-center">
                                        {report.qrCode?.book.land?.landCode}
                                      </td>
                                      <td className="px-3 py-2 text-center align-middle">
                                        <span
                                          className={`badge rounded-pill fw-semibold border-0 ${
                                            report.analyzedResult ===
                                            report.totalResult
                                              ? 'text-success'
                                              : 'text-danger'
                                          }`}
                                          style={{
                                            backgroundColor:
                                              report.analyzedResult ===
                                              report.totalResult
                                                ? 'rgba(209, 250, 229, 1)'
                                                : 'rgba(255, 228, 230, 1)',
                                          }}
                                        >
                                          {report.analyzedResult}/
                                          {report.totalResult}
                                        </span>
                                      </td>
                                      <td className="text-center">
                                        {getApprovalBlockReason(report) ===
                                        'report-data' ? (
                                          <span className="text-danger">
                                            เติมข้อมูลเกษตรกร/แปลงก่อน
                                          </span>
                                        ) : report.hasCompleteGradeConfig ===
                                          false ? (
                                          <span className="text-muted">
                                            ยังไม่พร้อมอนุมัติ
                                          </span>
                                        ) : (
                                          ''
                                        )}
                                      </td>
                                      <td className="text-center">
                                        {TimeStampToDate(
                                          report.qrCode?.book?.sampleReceivedAt
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={10}>
                                      ไม่พบข้อมูลผลการวิเคราะห์ดิน
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* print report table */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="private-card">
                <div className="private-card-header d-flex align-items-center justify-content-between">
                  <h4 className="private-card-title mb-0">
                    <i className="fas fa-file-alt me-2" />
                    รายงานผลการวิเคราะห์ดิน (อนุมัติแล้ว)
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-warning text-white"
                      onClick={() => handleDownload()}
                    >
                      <i className="fas fa-download me-2" />
                      ดาวน์โหลด
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handlePrint()}
                    >
                      <i className="fas fa-print me-2" />
                      พิมพ์
                    </button>
                  </div>
                </div>
                <div className="private-card-body">
                  {loading ? (
                    <div className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      />
                    </div>
                  ) : (
                    (() => {
                      const baseApproved = reports.filter(
                        report =>
                          report.qrCode?.status === SampleStatusEnum.APPROVED
                      );
                      const term = searchApproved.toLowerCase();
                      const approvedReports = term
                        ? baseApproved.filter(
                            r =>
                              (r.qrCode?.book?.sampleCode ?? '')
                                .toLowerCase()
                                .includes(term) ||
                              (r.qrCode?.book?.land?.landCode ?? '')
                                .toLowerCase()
                                .includes(term) ||
                              (
                                r.qrCode?.book?.farmer?.thaiNationalId ?? ''
                              ).includes(term)
                          )
                        : baseApproved;
                      return (
                        <>
                          {/* Filter + Summary */}
                          <div className="row g-2 mb-3 align-items-end">
                            <div className="col-md-6">
                              <label className="form-label small mb-1">
                                ค้นหา (รหัสตัวอย่าง / รหัสแปลง / เลขบัตร)
                              </label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="พิมพ์เพื่อค้นหา..."
                                value={searchApproved}
                                onChange={e =>
                                  setSearchApproved(e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-6 d-flex align-items-end gap-2">
                              <span className="private-chip private-chip-green">
                                อนุมัติแล้ว: {baseApproved.length}
                              </span>
                              <span className="private-chip private-chip-blue">
                                เลือกแล้ว: {selectedPrints.length}
                              </span>
                              {approvedReports.length !==
                                baseApproved.length && (
                                <span className="private-chip private-chip-blue">
                                  กรองแล้ว: {approvedReports.length}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="table-responsive">
                            <table
                              id="multi-filter-select-approved"
                              className="display table table-striped table-hover"
                            >
                              <thead>
                                <tr>
                                  <th style={{ width: 40 }}>#</th>
                                  <th className="text-center">
                                    {baseApproved.length > 0 ? (
                                      <input
                                        type="checkbox"
                                        checked={isAllPrints}
                                        onChange={() =>
                                          handleSelectAll('print')
                                        }
                                      />
                                    ) : (
                                      ''
                                    )}
                                  </th>
                                  <th className="text-center">ไฟล์รายงาน</th>
                                  <th className="text-center">รหัสตัวอย่าง</th>
                                  <th className="text-center">
                                    รหัสโควต้าอ้อย
                                  </th>
                                  <th className="text-center">
                                    หมายเลขบัตรประชาชน
                                  </th>
                                  <th className="text-center">รหัสแปลง</th>
                                  <th className="text-center">สถานะ</th>
                                  <th className="text-center">ผลวิเคราะห์</th>
                                  <th className="text-center">แก้ไขล่าสุด</th>
                                </tr>
                              </thead>
                              <tbody className="text-center">
                                {approvedReports.length > 0 ? (
                                  approvedReports.map((report, index) => (
                                    <tr key={report.qrCode?.book?.bookId}>
                                      <td className="text-muted small">
                                        {index + 1}
                                      </td>
                                      <td>
                                        <input
                                          type="checkbox"
                                          checked={selectedPrints.includes(
                                            report.qrCode?.book?.sampleCode ||
                                              ''
                                          )}
                                          onChange={() =>
                                            handleSelectRow(
                                              null,
                                              report.qrCode?.book?.sampleCode ||
                                                ''
                                            )
                                          }
                                        />
                                      </td>
                                      <td>
                                        <GenButtonCircle
                                          color="btn-warning text-white"
                                          icon="fa-solid fa-download"
                                          onClick={() => {
                                            const sampleCode =
                                              report.qrCode?.book?.sampleCode;
                                            if (sampleCode)
                                              handleDownload([sampleCode]);
                                          }}
                                        />
                                        <GenButtonCircle
                                          className="mx-1"
                                          color="btn-secondary"
                                          icon="fas fa-file-alt"
                                          onClick={() => {
                                            const sampleCode =
                                              report.qrCode?.book?.sampleCode;
                                            if (sampleCode)
                                              handlePrint([sampleCode]);
                                          }}
                                        />
                                        <GenButtonCircle
                                          color="btn-info"
                                          icon="fa fa-info"
                                          link={`/officer/analysis-report/${report.qrCode?.book?.sampleCode}`}
                                        />
                                      </td>
                                      <td>{report.qrCode?.book?.sampleCode}</td>
                                      <td>
                                        {report.qrCode?.book.land?.quotaCode}
                                      </td>
                                      <td>
                                        {formatThaiNationalId(
                                          report.qrCode?.book.farmer
                                            ?.thaiNationalId ?? ''
                                        )}
                                      </td>
                                      <td>
                                        {report.qrCode?.book.land?.landCode}
                                      </td>
                                      <td>
                                        {report.analyzedResult}/
                                        {report.totalResult}
                                      </td>
                                      <td></td>
                                      <td>
                                        {TimeStampToDate(
                                          report.qrCode?.book?.sampleReceivedAt
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={10}>
                                      ไม่พบข้อมูลผลการวิเคราะห์ดิน
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 alert alert-light text-center shadow-sm">
          <i className="fas fa-calendar-day me-2" />
          ไม่พบข้อมูลการให้บริการในวันนี้
        </div>
      )}
    </>
  );
};

export default AnalysisReport;
