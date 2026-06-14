import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import { GenFormDate2, GenFormSelect } from '../../../components/gui/GuiForm';
import QrScanner from '../../../components/scanner/QrScanner';
import { getBookingsByCalendar } from '../../../services/api/qr-code/BookApi';
import {
  getDecryptQrCode,
  searchQrCode,
} from '../../../services/api/qr-code/QrCodeApi';
import { searchServiceCalendars } from '../../../services/api/ServiceCalendarApi';
import { Bus } from '../../../types/Bus';
import {
  Book,
  QrCodeInfo,
  QrCodeSearch,
  SampleStatusEnum,
} from '../../../types/qr-code/QrCode';
import {
  CalendarInfoInterface,
  SearchServiceCalendar,
} from '../../../types/ServiceCalendar';
import {
  convertTimestampToDate,
  getTimeInTimeStamp,
  TimeStampToDate,
} from '../../../utils/Date';

import SearchAndPaginationWithSearchKey from '@/components/gui/SearchAndPaginationWithSearchKey';
// import { SampleReceivingManagementSummaryCard } from '@/components/pages/collect-exam/SampleReceivingSummaryCard';
import PrintableSampleCard from '@/components/printable/PrintableSampleCard';
import { SampleLabelProps } from '@/components/printable/SampleLabel';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';

interface ScannerModalProps {
  selectedServiceCalendar: CalendarInfoInterface;
  onClose: () => void;
}

// ── Scanner Modal (สำหรับรับงานปกติ / Walk-in) ──────────────────────────
const ScannerModal: React.FC<ScannerModalProps> = ({
  onClose,
  selectedServiceCalendar,
}) => {
  const navigate = useNavigate();
  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">สแกน QR Code (รับตัวอย่าง)</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body d-flex justify-content-center align-items-center">
            <QrScanner
              readerId="qr-reader"
              fps={15}
              qrbox={250}
              onScanSuccess={async (decodedText, scannerInstance) => {
                const parts = decodedText.split('/');
                const code = parts[parts.length - 1];

                try {
                  const response = await getDecryptQrCode(code);
                  console.log('scan success ', response);

                  await scannerInstance.stop();
                  scannerInstance.clear();

                  navigate(`/officer/sample-receiving/${response}`, {
                    state: {
                      serviceCalendarId:
                        selectedServiceCalendar.serviceCalendarId,
                    },
                  });
                } catch (error) {
                  console.error('Error receiving QR code:', error);
                  Swal.fire('Error', 'ไม่สามารถอ่าน QR Code ได้', 'error');
                }
              }}
              onScanError={errMsg => console.warn('QR scan error:', errMsg)}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Pairing Scanner Modal (สำหรับจับคู่ Booking) ─────────────────
interface PairingScannerModalProps {
  onClose: () => void;
  onScan: (decryptedCode: string) => void;
  targetName: string;
}

const PairingScannerModal: React.FC<PairingScannerModalProps> = ({
  onClose,
  onScan,
  targetName,
}) => {
  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">
              <i className="fas fa-link me-2"></i>
              สแกนถุงตัวอย่างเพื่อจับคู่กับ: <strong>{targetName}</strong>
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body d-flex justify-content-center align-items-center flex-column">
            <p className="text-muted mb-3">
              กรุณาสแกน QR Code ที่ติดอยู่บนถุงตัวอย่างดิน
            </p>
            <QrScanner
              readerId="qr-reader-pairing"
              fps={15}
              qrbox={250}
              onScanSuccess={async (decodedText, scannerInstance) => {
                const parts = decodedText.split('/');
                const code = parts[parts.length - 1];
                try {
                  const response = await getDecryptQrCode(code);
                  await scannerInstance.stop();
                  scannerInstance.clear();
                  onScan(response);
                } catch (error) {
                  console.error('Error decrypting QR:', error);
                }
              }}
              onScanError={() => { }}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SampleReceivingManagement: React.FC = () => {
  const [deleteTarget, setDeleteTarget] = useState<null | {
    type: string;
    name: string;
    id: number | string;
  }>(null);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [serviceDate, setServiceDate] = useState(today);
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [serviceCalendars, setServiceCalendars] = useState<
    CalendarInfoInterface[]
  >([]);
  const [matchCalendar, setMatchCalendar] = useState<CalendarInfoInterface[]>(
    []
  );
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedServiceCalendar, setSelectedServiceCalendar] =
    useState<CalendarInfoInterface | null>(null);
  const [showScanQrCode, setShowScanQrCode] = useState<boolean>(false);
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const [collectedQrCode, setCollectedQrCode] = useState<QrCodeInfo[]>([]);
  const [receivedBooks, setReceivedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- State สำหรับ Booking & Pairing ---
  const [bookingList, setBookingList] = useState<Book[]>([]);
  const [isPairing, setIsPairing] = useState<Book | null>(null);
  const [bookingSearchTerm, setBookingSearchTerm] = useState(''); // [NEW] คำค้นหา
  const [isBookingOpen, setIsBookingOpen] = useState(true); // [NEW] ย่อ/ขยายตาราง

  // --- State สำหรับพิมพ์ QR ---
  const [printData, setPrintData] = useState<QrCodeInfo[]>([]);
  const [selectedPrints, setSelectedPrints] = useState<number[]>([]);
  const [isAllPrints, setIsAllPrints] = useState(false);

  const [searchParam, setSearchParam] = useState<SearchServiceCalendar>(
    {} as SearchServiceCalendar
  );

  // [UPDATED] ปรับให้ดึงเฉพาะ COLLECTED เพื่อแสดงเฉพาะรายการที่เกษตรกรกรอกข้อมูลแล้วเท่านั้น
  const searchCollected: QrCodeSearch = {
    status: [SampleStatusEnum.COLLECTED], // ตัด DISTRIBUTED ออก
    sortBy: 'collectSampleAt',
    order: 'ASC',
  };

  const searchReceived: QrCodeSearch = {
    status: [
      SampleStatusEnum.RECEIVED,
      SampleStatusEnum.ANALYZED,
      SampleStatusEnum.ANALYZING,
      SampleStatusEnum.APPROVED,
    ],
    sortBy: 'sampleCode',
  };

  useEffect(() => {
    const fetchCalendar = async () => {
      const payload: SearchServiceCalendar = {
        ...searchParam,
        all: true,
      };
      const calData = await searchServiceCalendars(payload);

      setServiceCalendars(calData.data);
      setMarkedDates(
        calData.data.map(
          (c: { date: string | number | Date }) =>
            new Date(c.date).toISOString().split('T')[0]
        )
      );
    };
    fetchCalendar();
  }, [searchParam]);

  useEffect(() => {
    const matched = serviceCalendars.filter(
      c => new Date(c.date).toISOString().split('T')[0] === serviceDate
    );
    if (matched.length > 0) {
      setMatchCalendar(matched);
      setBuses(matched.map(item => item.bus));
      if (!selectedBusId) {
        setSelectedBusId(matched[0].bus.busId);
      }
    } else {
      setMatchCalendar([]);
      setBuses([]);
      setSelectedBusId(null);
      setSelectedServiceCalendar(null);
      setCollectedQrCode([]);
      setReceivedBooks([]);
      setBookingList([]);
      setPrintData([]);
      setLoading(false);
    }
  }, [serviceCalendars, serviceDate]);

  const fetchBookings = async () => {
    if (!selectedServiceCalendar) return;
    try {
      const data = await getBookingsByCalendar(
        Number(selectedServiceCalendar.serviceCalendarId)
      );
      setBookingList(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchTable = async () => {
    setLoading(true);
    try {
      await fetchBookings();

      const collected = await searchQrCode(searchCollected);
      setCollectedQrCode(collected);

      const rec = await searchQrCode(searchReceived);
      setReceivedBooks(rec);
      setPrintData(rec.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!selectedBusId) return;

    const found = matchCalendar.find(m => m.bus.busId === selectedBusId);
    if (!found) {
      setSelectedServiceCalendar(null);
      return;
    }
    setSelectedServiceCalendar(found);
  }, [matchCalendar, selectedBusId]);

  useEffect(() => {
    if (selectedServiceCalendar) {
      fetchTable();
    }
  }, [selectedServiceCalendar]);

  // Handle Pair Scan -> Navigate to Info Page
  const handlePairScan = (qrCode: string) => {
    if (!isPairing) return;

    setIsPairing(null);

    navigate(`/officer/sample-receiving/${qrCode}`, {
      state: {
        serviceCalendarId: selectedServiceCalendar?.serviceCalendarId,
        bookingData: isPairing,
      },
    });
  };

  // [NEW] Filter Booking List Logic
  const filteredBookings = bookingList.filter(book => {
    // 1. กรองเฉพาะที่ยังไม่รับตัวอย่าง (Pending)
    if (book.sampleReceivedAt) return false;

    // 2. กรองตามคำค้นหา (ถ้ามี)
    if (!bookingSearchTerm) return true;

    const term = bookingSearchTerm.toLowerCase();
    const fullName =
      `${book.farmer?.firstName} ${book.farmer?.lastName}`.toLowerCase();
    const phone = (book.farmer?.phone || '').toLowerCase();
    const landCode = (book.land?.landCode || '').toLowerCase();
    const nid = (book.farmer?.thaiNationalId || '').toLowerCase();

    return (
      fullName.includes(term) ||
      phone.includes(term) ||
      landCode.includes(term) ||
      nid.includes(term)
    );
  });

  //qrcode - print
  const handleSelectRow = (id: number) => {
    const next = selectedPrints.includes(id)
      ? selectedPrints.filter(x => x !== id)
      : [...selectedPrints, id];
    setSelectedPrints(next);
    setIsAllPrints(next.length === printData.length);
  };
  const handleSelectAll = () => {
    if (isAllPrints) {
      setSelectedPrints([]);
      setIsAllPrints(false);
    } else {
      setSelectedPrints(printData.filter(r => r.book).map(r => r.book!.bookId));
      setIsAllPrints(true);
    }
  };
  const BASE = import.meta.env.VITE_BASE_URL || window.location.origin;
  const labels: SampleLabelProps[] = printData
    .filter(r => r.book && selectedPrints.includes(r.book.bookId))
    .map(r => ({
      qrValue: `${BASE}/private/officer/sample-receiving/${r.qrCode}`,
      sampleCode: r.book!.sampleCode,
      receivedDate: TimeStampToDate(r.book!.sampleReceivedAt),
      sequence: Number(r.book!.sampleCode.slice(-2)),
    }));
  const printRef = useRef<HTMLDivElement>(null);

  const pageStyle = `
  @page {
    size: 50mm 80mm;
    margin: 0;
  }
  @media print {
    body *:not(.print-area):not(.print-area *) {
      visibility: hidden !important;
    }
    .print-area {
      display: block !important;
      visibility: visible !important;
    }
  }
`;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `sample-label-${Date.now()}`,
    pageStyle,
  });

  const onPrintClick = () => {
    if (selectedPrints.length === 0) {
      Swal.fire({ icon: 'warning', title: 'ยังไม่ได้เลือกตัวอย่าง' });
      return;
    }
    handlePrint();
  };

  // ── Main JSX ───────────────────────────────────────────────────────────
  return (
    <>
      {/* <SampleReceivingManagementSummaryCard /> */}

      {/* Filter Form */}
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
            markedDates={markedDates}
            onMonthYearChange={(year, month) => {
              setSearchParam({ year, month });
            }}
          />
        </div>
        <div className="col-md-4 col-lg-4">
          <GenFormSelect
            isRequired={false}
            id="vehicle"
            name="vehicle"
            label="รถที่ให้บริการ"
            options={buses.map(bus => ({
              value: bus.busId,
              name: `${bus.busNumber}-${bus.busName} (${bus.licensePlate})`,
            }))}
            value={selectedBusId ?? undefined}
            onChange={e => setSelectedBusId(Number(e.target.value))}
          />
        </div>
      </div>

      {selectedServiceCalendar ? (
        <>
          {/* [UPDATED] Section: รายชื่อผู้จองคิวล่วงหน้า */}
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="card border-primary">
                <div
                  className="card-header bg-primary text-white d-flex justify-content-between align-items-center"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsBookingOpen(!isBookingOpen)}
                >
                  <div className="d-flex align-items-center">
                    <i
                      className={`fas fa-chevron-${isBookingOpen ? 'down' : 'right'} me-3`}
                    ></i>
                    <h4 className="card-title text-white m-0">
                      <i className="fas fa-clipboard-list me-2"></i>
                      รายชื่อผู้จองคิวล่วงหน้า (Booking)
                    </h4>
                  </div>
                  <span className="badge bg-white text-primary fs-6">
                    {filteredBookings.length} รายการรอรับ
                  </span>
                </div>

                {/* Collapsible Body */}
                {isBookingOpen && (
                  <div className="card-body p-0">
                    {/* [NEW] Search Bar */}
                    <div className="p-3 bg-light border-bottom">
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="fas fa-search text-muted"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          placeholder="ค้นหาชื่อ, เบอร์โทร, เลขบัตรประชาชน, หรือรหัสแปลง..."
                          value={bookingSearchTerm}
                          onChange={e => setBookingSearchTerm(e.target.value)}
                        />
                        {bookingSearchTerm && (
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setBookingSearchTerm('')}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      className="table-responsive"
                      style={{ maxHeight: '400px', overflowY: 'auto' }}
                    >
                      <table className="table table-striped table-hover mb-0 align-middle">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th>ชื่อ-นามสกุล</th>
                            <th>เบอร์โทรศัพท์</th>
                            <th>ชื่อแปลง</th>
                            <th>รหัสแปลง</th>
                            <th>วันที่จอง</th>
                            <th
                              className="text-center"
                              style={{ width: '180px' }}
                            >
                              ดำเนินการ
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.length > 0 ? (
                            filteredBookings.map(book => (
                              <tr key={book.bookId}>
                                <td>
                                  <div className="fw-bold text-primary">
                                    {book.farmer?.firstName}{' '}
                                    {book.farmer?.lastName}
                                  </div>
                                  <small className="text-muted">
                                    {formatThaiNationalId(
                                      book.farmer?.thaiNationalId ?? ''
                                    )}
                                  </small>
                                </td>
                                <td>{book.farmer?.phone || '-'}</td>
                                <td>{book.land?.name || '-'}</td>
                                <td>
                                  {book.land?.landCode ? (
                                    <span className="badge bg-info text-dark">
                                      {book.land.landCode}
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td>{TimeStampToDate(book.bookedAt)}</td>
                                <td className="text-center">
                                  <button
                                    className="btn btn-warning btn-sm fw-bold text-dark shadow-sm"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setIsPairing(book);
                                    }}
                                  >
                                    <i className="fas fa-qrcode me-1"></i>
                                    รับงาน
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="text-center py-5 text-muted"
                              >
                                {bookingSearchTerm ? (
                                  <>
                                    <i className="fas fa-search-minus fs-2 mb-2 d-block opacity-50"></i>
                                    ไม่พบข้อมูลที่ตรงกับ "{bookingSearchTerm}"
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-check-circle fs-2 mb-2 d-block text-success opacity-50"></i>
                                    ไม่มีรายการจองค้างรับสำหรับวันนี้
                                  </>
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: QR Code (Collected) - [UPDATED] Filtered only COLLECTED */}
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <div className="row row-demo-grid">
                    <div className="col-md-10 col-sm-10 col-10 text-start">
                      <h4 className="card-title">
                        QR Code ที่มีข้อมูลแล้ว (รอนำส่ง){' '}
                        {collectedQrCode.length > 0 &&
                          `(${collectedQrCode.length} ตัวอย่าง)`}
                      </h4>
                    </div>
                    <div className="col-md-2 col-sm-2 col-2 ms-auto text-end">
                      <button
                        type="button"
                        className="btn btn-icon btn-round btn-success shadow"
                        onClick={() => setShowScanQrCode(true)}
                        title="สแกนรับตัวอย่างทั่วไป"
                      >
                        <i className="fa fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  {loading ? (
                    <div className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      ></div>
                    </div>
                  ) : (
                    <SearchAndPaginationWithSearchKey<QrCodeInfo>
                      fetchData={searchQrCode}
                      searchKeys={{ ...searchCollected }}
                      columns={[
                        {
                          header: 'รับดิน',
                          accessor: collected => (
                            <GenButtonCircle
                              icon="fa fa-plus"
                              color="btn-warning text-white"
                              onClick={() => {
                                navigate(
                                  `/officer/sample-receiving/${collected.qrCode}`,
                                  {
                                    state: {
                                      serviceCalendarId:
                                        selectedServiceCalendar.serviceCalendarId,
                                    },
                                  }
                                );
                              }}
                            />
                          ),
                        },
                        {
                          header: 'หมายเลขบัตรประชาชน',
                          accessor: collected =>
                            formatThaiNationalId(collected.thaiNationalId),
                        },
                        {
                          header: 'รหัสแปลง',
                          accessor: collected => collected.landCode ?? '-',
                        },
                        {
                          header: 'รหัส QR CODE',
                          accessor: collected => collected.qrCode,
                        },
                        {
                          header: 'เก็บดินวันที่',
                          accessor: collected =>
                            convertTimestampToDate(
                              collected.book.collectSampleAt
                            ),
                        },
                        // {
                        //   header: 'MANAGEMENT',
                        //   accessor: collected => (
                        //     <>
                        //       <GenButtonCircle
                        //         icon={B_LIST.info.icon}
                        //         color={B_LIST.info.color}
                        //         onClick={() =>
                        //           navigate(
                        //             `/officer/analysis-report/${collected.qrCode}`
                        //           )
                        //         }
                        //       />
                        //       <GenButtonCircle
                        //         icon={B_LIST.del.icon}
                        //         color={B_LIST.del.color}
                        //         className="mx-2"
                        //         onClick={() =>
                        //           setDeleteTarget({
                        //             type: 'collected',
                        //             name: collected.qrCode,
                        //             id: collected.qrCodeId,
                        //           })
                        //         }
                        //       />
                        //     </>
                        //   ),
                        // },
                        {
                          header: 'UPDATE',
                          accessor: collected =>
                            TimeStampToDate(collected.createdAt),
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Received */}
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <div className="row justify-content-between align-items-center">
                    <div className="col-md-10 col-sm-10 col-10 text-start">
                      <h4 className="card-title">
                        รับตัวอย่างดินแล้ว{' '}
                        {receivedBooks.length > 0 &&
                          `(${receivedBooks.length} ตัวอย่าง)`}
                      </h4>
                    </div>
                    {/* <div className="col-md-2 col-sm-2 col-2 ms-auto text-end">
                      <button
                        className="btn btn-success mb-3 shadow-sm"
                        onClick={onPrintClick}
                      >
                        <i className="fas fa-print me-2"></i>Print Qr Code
                      </button>
                    </div> */}
                  </div>
                </div>

                <div className="card-body">
                  {loading ? (
                    <div className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      ></div>
                    </div>
                  ) : (
                    <SearchAndPaginationWithSearchKey<QrCodeInfo>
                      fetchData={searchQrCode}
                      searchKeys={{
                        receivedServiceCalendarId:
                          selectedServiceCalendar.serviceCalendarId,
                        ...searchReceived,
                      }}
                      columns={[
                        {
                          header: 'รหัสตัวอย่าง',
                          accessor: collected => collected.book?.sampleCode,
                        },
                        {
                          header: 'หมายเลขบัตรประชาชน',
                          accessor: collected =>
                            formatThaiNationalId(
                              collected.book?.farmer?.thaiNationalId ?? ''
                            ),
                        },
                        {
                          header: 'รหัสแปลง',
                          accessor: collected => collected.landCode ?? '-',
                        },
                        {
                          header: 'รหัส QR CODE',
                          accessor: collected => collected.qrCode,
                        },
                        {
                          header: 'เก็บดินวันที่',
                          accessor: collected =>
                            TimeStampToDate(collected.book.collectSampleAt),
                        },
                        {
                          header: 'รับตัวอย่าง',
                          accessor: collected =>
                            getTimeInTimeStamp(
                              collected.book?.sampleReceivedAt
                            ),
                        },
                        {
                          header: 'MANAGEMENT',
                          accessor: collected => (
                            <>
                              <GenButtonCircle
                                icon={B_LIST.info.icon}
                                color={B_LIST.info.color}
                                onClick={() =>
                                  navigate(
                                    `/officer/analysis-report/${collected.book?.sampleCode}`
                                  )
                                }
                              />
                            </>
                          ),
                        },
                        // {
                        //   header: (
                        //     <input
                        //       type="checkbox"
                        //       checked={isAllPrints}
                        //       onChange={handleSelectAll}
                        //     />
                        //   ),
                        //   accessor: collected => (
                        //     <input
                        //       type="checkbox"
                        //       checked={selectedPrints.includes(
                        //         collected.book!.bookId
                        //       )}
                        //       onChange={() =>
                        //         handleSelectRow(collected.book!.bookId)
                        //       }
                        //     />
                        //   ),
                        // },
                        {
                          header: 'UPDATE',
                          accessor: collected =>
                            TimeStampToDate(collected.book?.collectSampleAt),
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 alert alert-light text-center shadow-sm">
          <i className="fas fa-calendar-day me-2"></i>
          ไม่พบข้อมูลการให้บริการในวันนี้
        </div>
      )}

      {/* Modals & Hidden Elements */}
      {deleteTarget && (
        <ConfirmAlert
          title="ยืนยันการลบ"
          text={`คุณต้องการลบตัวอย่าง ${deleteTarget.name} หรือไม่?`}
          action="delete"
          onConfirm={() => setDeleteTarget(null)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showScanQrCode && selectedServiceCalendar && (
        <ScannerModal
          onClose={() => setShowScanQrCode(false)}
          selectedServiceCalendar={selectedServiceCalendar}
        />
      )}

      {isPairing && (
        <PairingScannerModal
          onClose={() => setIsPairing(null)}
          onScan={handlePairScan}
          targetName={`${isPairing.farmer?.firstName} ${isPairing.farmer?.lastName}`}
        />
      )}

      <div ref={printRef} className="print-area" style={{ display: 'none' }}>
        {labels.map((label, i) => (
          <div
            key={i}
            className="print-page"
            style={{
              width: '50mm',
              height: '80mm',
              pageBreakAfter: i + 1 === labels.length ? 'auto' : 'always',
            }}
          >
            <PrintableSampleCard labels={[label]} />
          </div>
        ))}
      </div>
    </>
  );
};

export default SampleReceivingManagement;
