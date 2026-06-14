import { Buffer } from 'buffer';

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
// เพิ่ม import สำหรับจัดการ ZIP และ PDF
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

import { GenButtonCircle } from '../../../components/gui/GuiButton';
import 'datatables.net-bs5';
import {
  GenFormDate2,
  GenFormSelect,
  MarkedDateStatus,
} from '../../../components/gui/GuiForm';
import { searchServiceCalendars } from '../../../services/api/ServiceCalendarApi';
import {
  CalendarInfoInterface,
  SearchServiceCalendar,
  ServiceCalendarWithStatus,
} from '../../../types/ServiceCalendar';

import { AnalysisReportSummaryCard } from '@/components/pages/analysis-report/AnalysisReportSummaryCard';
import {
  findSampleForReportPages,
  getReportsPdf,
} from '@/services/api/qr-code/BookApi';
import { approvedQrCodeSampleByBookId } from '@/services/api/qr-code/QrCodeApi';
import { Bus } from '@/types/Bus';
import { SampleStatusEnum } from '@/types/qr-code/QrCode';
import { BookIds, ReportInfo, SampleCodes } from '@/types/qr-code/Report';
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

  const fetchCalendar = async () => {
    const payload: SearchServiceCalendar = {
      ...searchParam,
      all: true,
    };
    const calData = await searchServiceCalendars(payload);

    console.log('service calendar data: ', calData);

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
          .filter(report => report.qrCode?.status === SampleStatusEnum.ANALYZED)
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
        .filter(report => report.qrCode?.status === SampleStatusEnum.ANALYZED)
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
      console.log('approved books', selectedApproves);
      const playload: BookIds = {
        bookIds: selectedApproves,
      };

      if (!playload.bookIds || playload.bookIds.length === 0) {
        Swal.fire({
          title: 'ยังไม่ได้เลือกตัวอย่าง',
          text: 'กรุณาเลือกตัวอย่างที่ต้องการยืนยัน',
          icon: 'warning',
        });
        return;
      }
      const response = await approvedQrCodeSampleByBookId(playload);
      console.log('response', response);
    } catch (error) {
      console.log(error);
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
      Swal.fire({
        title: 'ยังไม่ได้เลือกตัวอย่าง',
        text: 'กรุณาเลือกตัวอย่างที่ต้องการดาวน์โหลด',
        icon: 'warning',
      });
      return;
    }

    Swal.fire({
      title: 'กำลังเตรียมไฟล์...',
      text: 'กรุณารอสักครู่',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const responseBlob = await getReportsPdf(payload);

      if (responseBlob.type === 'application/json') {
        const text = await responseBlob.text();
        const error = JSON.parse(text);
        throw new Error(error.message || 'Server returned JSON error instead of Blob');
      }

      const blobUrl = URL.createObjectURL(responseBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `reports_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      Swal.close();
    } catch (error) {
      console.error('error', error);
      Swal.close();
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถดาวน์โหลดไฟล์ได้ กรุณาลองใหม่',
        icon: 'error',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
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
      Swal.fire({
        title: 'ยังไม่ได้เลือกตัวอย่าง',
        text: 'กรุณาเลือกตัวอย่างที่ต้องการพิมพ์',
        icon: 'warning',
      });
      return;
    }

    Swal.fire({
      title: 'กำลังประมวลผล...',
      text: 'กรุณารอสักครู่ ระบบกำลังรวมไฟล์เพื่อสั่งพิมพ์',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

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
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));

          pdfCount++;
        }
      }

      if (pdfCount === 0) {
        throw new Error('ไม่พบไฟล์ PDF ใน ZIP');
      }

      // 4. บันทึกไฟล์ PDF ที่รวมเสร็จแล้วเป็น Blob
      const mergedPdfBytes = await mergedPdf.save();
      // ใช้ as any เพื่อเลี่ยง Error Type 'Uint8Array'
      const mergedBlob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });

      // 5. เปิดหน้าต่างใหม่เพื่อสั่งพิมพ์
      const blobUrl = URL.createObjectURL(mergedBlob);
      window.open(blobUrl, '_blank');

      Swal.close();
    } catch (error) {
      console.error('Print error:', error);
      Swal.close();
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถเปิดไฟล์เพื่อพิมพ์ได้ กรุณาลองใหม่',
        icon: 'error',
      });
    }
  };

  console.log('report', reports);

  return (
    <>
      {/* Cards Section */}
      {/* <AnalysisReportSummaryCard /> */}

      <div className="row">
        <div className="col-md-4 col-lg-4">
          <GenFormDate2
            isRequired={false}
            id="serviceDate"
            name="serviceDate"
            label="วันที่ให้บริการ"
            value={serviceDate}
            onChange={setServiceDate}
            desc={`ค่าเริ่มต้น คือ วันนี้ (${new Date().toLocaleDateString('th-TH')})`}
            markedDatesWithStatus={markedDates}
            onMonthYearChange={(year, month) => {
              setSearchParam({
                year: year,
                month: month,
              });
            }}
          />
        </div>
        <div className="col-md-4 col-lg-4">
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

      {selectedServiceCalendar ? (
        <>
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <div className="row">
                    <div className="col-md-10 text-start">
                      <h4 className="card-title">ผลการวิเคราะห์ดิน</h4>
                    </div>
                    <div className="col-md-2 text-end">
                      <a
                        className="btn btn-success"
                        style={{ width: '150px' }}
                        onClick={handleApprove}
                      >
                        Approves
                      </a>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table
                        id="multi-filter-select"
                        className="display table table-striped table-hover"
                      >
                        <thead>
                          <tr className="text-center">
                            <th className="text-center">
                              {reports.filter(
                                report =>
                                  report.qrCode?.status ===
                                  SampleStatusEnum.ANALYZED ||
                                  report.qrCode?.status ===
                                  SampleStatusEnum.ANALYZING
                              ).length > 0 ? (
                                <input
                                  type="checkbox"
                                  checked={isAllApproves}
                                  onChange={() => {
                                    handleSelectAll('approve');
                                  }}
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
                            <th className="text-center">UPDATE</th>
                          </tr>
                        </thead>
                        <tfoot>
                          <tr className="text-center">
                            <th></th>
                            <th>ไฟล์รายงาน</th>
                            <th>รหัสตัวอย่าง</th>
                            <th>รหัสโควต้าอ้อย</th>
                            <th>หมายเลขบัตรประชาชน</th>
                            <th>รหัสแปลง</th>
                            <th>สถานะ</th>
                            <th>ผลวิเคราะห์</th>
                            <th className="text-center">UPDATE</th>
                          </tr>
                        </tfoot>
                        <tbody className="text-center">
                          {(() => {
                            const filteredReports = reports.filter(
                              report =>
                                report.qrCode?.status ===
                                SampleStatusEnum.ANALYZED ||
                                report.qrCode?.status ===
                                SampleStatusEnum.ANALYZING
                            );

                            return filteredReports.length > 0 ? (
                              filteredReports.map(report => (
                                <tr key={report.qrCode?.qrCodeId}>
                                  <td>
                                    {report.qrCode?.status ===
                                      SampleStatusEnum.ANALYZING ? (
                                      ''
                                    ) : (
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
                                      className={`badge rounded-pill fw-semibold border-0 ${report.analyzedResult ===
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
                                  <td className="text-center"></td>
                                  <td className="text-center">
                                    {TimeStampToDate(
                                      report.qrCode?.book?.sampleReceivedAt
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={9}>
                                  ไม่พบข้อมูลผลการวิเคราะห์ดิน
                                </td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* print report table */}
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <div className="row">
                    <div className="col-md-8 text-start">
                      <h4 className="card-title">ผลการวิเคราะห์ดิน</h4>
                    </div>
                    <div className="col-md-4 text-end ">
                      <a
                        className="btn btn-warning text-white"
                        style={{ width: '120px' }}
                        onClick={() => handleDownload()}
                      >
                        Download
                      </a>
                      <a
                        className="btn btn-secondary mx-1"
                        style={{ width: '120px' }}
                        onClick={() => handlePrint()}
                      >
                        Print
                      </a>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table
                        id="multi-filter-select"
                        className="display table table-striped table-hover"
                      >
                        <thead>
                          <tr>
                            <th className="text-center">
                              {reports.filter(
                                report =>
                                  report.qrCode?.status ===
                                  SampleStatusEnum.APPROVED
                              ).length > 0 ? (
                                <input
                                  type="checkbox"
                                  checked={isAllPrints}
                                  onChange={() => {
                                    handleSelectAll('print');
                                  }}
                                />
                              ) : (
                                ''
                              )}
                            </th>
                            <th className="text-center">ไฟล์รายงาน</th>
                            <th className="text-center">รหัสตัวอย่าง</th>
                            <th className="text-center">รหัสโควต้าอ้อย</th>
                            <th className="text-center">หมายเลขบัตรประชาชน</th>
                            <th className="text-center">รหัสแปลง</th>
                            <th className="text-center">สถานะ</th>
                            <th className="text-center">ผลวิเคราะห์</th>
                            <th className="text-center">UPDATE</th>
                          </tr>
                        </thead>
                        <tfoot>
                          <tr className="text-center">
                            <th></th>
                            <th>ไฟล์รายงาน</th>
                            <th>รหัสตัวอย่าง</th>
                            <th>รหัสโควต้าอ้อย</th>
                            <th>หมายเลขบัตรประชาชน</th>
                            <th>รหัสแปลง</th>
                            <th>สถานะ</th>
                            <th>ผลวิเคราะห์</th>
                            <th className="text-center">UPDATE</th>
                          </tr>
                        </tfoot>
                        <tbody className="text-center">
                          {(() => {
                            const approvedReports = reports.filter(
                              report =>
                                report.qrCode?.status ===
                                SampleStatusEnum.APPROVED
                            );

                            return (
                              <>
                                {approvedReports.length > 0 ? (
                                  approvedReports.map(report => (
                                    <tr key={report.qrCode?.book?.bookId}>
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
                                        <>
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
                                        </>
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
                                    <td colSpan={9}>
                                      ไม่พบข้อมูลผลการวิเคราะห์ดิน
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4">ไม่พบข้อมูลการให้บริการในวันนี้</div>
      )}
    </>
  );
};

export default AnalysisReport;