import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { GenFormDate2, GenFormSelect } from '@/components/gui/GuiForm';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import QrScanner from '@/components/scanner/QrScanner';
import { getBookingsByCalendar } from '@/services/api/qr-code/BookApi';
import {
  getDecryptQrCode,
  searchQrCode,
} from '@/services/api/qr-code/QrCodeApi';
import { searchServiceCalendars } from '@/services/api/ServiceCalendarApi';
import { Bus } from '@/types/Bus';
import { Book, QrCodeInfo, SampleStatusEnum } from '@/types/qr-code/QrCode';
import {
  CalendarInfoInterface,
  SearchServiceCalendar,
} from '@/types/ServiceCalendar';
import {
  convertTimestampToDate,
  getTimeInTimeStamp,
  TimeStampToDate,
} from '@/utils/Date';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';
import { swalError } from '@/utils/swal';

const COLLECTED_SEARCH = {
  status: [SampleStatusEnum.COLLECTED],
  sortBy: 'collectSampleAt',
  order: 'ASC' as const,
};

const RECEIVED_SEARCH = {
  status: [
    SampleStatusEnum.RECEIVED,
    SampleStatusEnum.ANALYZED,
    SampleStatusEnum.ANALYZING,
    SampleStatusEnum.APPROVED,
  ],
  sortBy: 'sampleCode',
};

interface ReceivingSummaryCounts {
  collectedTotal: number;
  receivedTotal: number;
}

type KpiItem = { label: string; icon: string; accent: string; unit: string };

const KPI_CONFIG: KpiItem[] = [
  {
    label: 'รายการทั้งหมด',
    icon: 'fas fa-layer-group',
    accent: '#005092',
    unit: 'รายการ',
  },
  {
    label: 'คิวรอรับ',
    icon: 'fas fa-clipboard-list',
    accent: '#d98f0c',
    unit: 'รายการ',
  },
  { label: 'รอนำส่ง', icon: 'fas fa-inbox', accent: '#0aa2c0', unit: 'รายการ' },
  {
    label: 'รับแล้ว',
    icon: 'fas fa-check-circle',
    accent: '#18a05c',
    unit: 'รายการ',
  },
];

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
              <i className="fas fa-link me-2" />
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
              onScanError={() => {}}
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

interface GeneralScannerModalProps {
  onClose: () => void;
  onScan: (decryptedCode: string) => void;
}

const GeneralScannerModal: React.FC<GeneralScannerModalProps> = ({
  onClose,
  onScan,
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
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title text-white">
              <i className="fas fa-qrcode me-2" />
              สแกน QR Code บนถุงตัวอย่าง
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>
          <div className="modal-body d-flex justify-content-center align-items-center flex-column">
            <p className="text-muted mb-3">
              กรุณาสแกน QR Code ที่ติดอยู่บนถุงตัวอย่างดินเพื่อตรวจรับเข้าระบบ
            </p>
            <QrScanner
              readerId="qr-reader-general"
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
              onScanError={() => {}}
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

// โ”€โ”€ Main Component โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€
const SampleReceivingManagement: React.FC = () => {
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
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const [searchParam, setSearchParam] = useState<SearchServiceCalendar>(
    {} as SearchServiceCalendar
  );

  const [bookingList, setBookingList] = useState<Book[]>([]);
  const [isPairing, setIsPairing] = useState<Book | null>(null);
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(true);
  const [filterReceivedStatus, setFilterReceivedStatus] = useState<string>('');
  const [summaryCounts, setSummaryCounts] = useState<ReceivingSummaryCounts>({
    collectedTotal: 0,
    receivedTotal: 0,
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [scanInputValue, setScanInputValue] = useState('');
  const [isGeneralScanning, setIsGeneralScanning] = useState(false);

  const handleQuickScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInputValue.trim()) return;
    try {
      const parts = scanInputValue.trim().split('/');
      const cleanCode = parts[parts.length - 1];
      const decryptedCode = await getDecryptQrCode(cleanCode);
      if (decryptedCode) {
        setScanInputValue('');
        navigate(
          buildReceivingPath(cleanCode, {
            serviceCalendarId: selectedServiceCalendar?.serviceCalendarId,
          })
        );
      }
    } catch (err) {
      console.error(err);
      swalError(
        'ไม่พบรหัส QR',
        'ไม่สามารถค้นหาหรือถอดรหัส QR Code นี้ได้ หรือรหัสถูกใช้งานไปแล้ว'
      );
    }
  };

  useEffect(() => {
    const fetchCalendar = async () => {
      const payload: SearchServiceCalendar = { ...searchParam, all: true };
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
      if (!selectedBusId) setSelectedBusId(matched[0].bus.busId);
    } else {
      setMatchCalendar([]);
      setBuses([]);
      setSelectedBusId(null);
      setSelectedServiceCalendar(null);
      setBookingList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceCalendars, serviceDate]);

  useEffect(() => {
    if (!selectedBusId) return;
    const found = matchCalendar.find(m => m.bus.busId === selectedBusId);
    setSelectedServiceCalendar(found || null);
  }, [matchCalendar, selectedBusId]);

  const fetchBookings = useCallback(async () => {
    if (!selectedServiceCalendar?.serviceCalendarId) return;
    try {
      const data = await getBookingsByCalendar(
        Number(selectedServiceCalendar.serviceCalendarId)
      );
      setBookingList(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, [selectedServiceCalendar?.serviceCalendarId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    let isMounted = true;

    const fetchSummaryCounts = async () => {
      if (!selectedServiceCalendar?.serviceCalendarId) {
        setSummaryCounts({ collectedTotal: 0, receivedTotal: 0 });
        setIsSummaryLoading(false);
        return;
      }

      try {
        setIsSummaryLoading(true);
        const [collectedResponse, receivedResponse] = await Promise.all([
          searchQrCode({
            ...COLLECTED_SEARCH,
            page: 1,
            limit: 1,
          }),
          searchQrCode({
            receivedServiceCalendarId:
              selectedServiceCalendar.serviceCalendarId,
            ...RECEIVED_SEARCH,
            page: 1,
            limit: 1,
          }),
        ]);

        if (!isMounted) return;

        setSummaryCounts({
          collectedTotal: collectedResponse.total ?? 0,
          receivedTotal: receivedResponse.total ?? 0,
        });
      } catch (error) {
        console.error('Error fetching sample receiving summary:', error);
        if (isMounted) {
          setSummaryCounts({ collectedTotal: 0, receivedTotal: 0 });
        }
      } finally {
        if (isMounted) {
          setIsSummaryLoading(false);
        }
      }
    };

    fetchSummaryCounts();

    return () => {
      isMounted = false;
    };
  }, [selectedServiceCalendar?.serviceCalendarId]);

  const fetchCollected = useCallback(
    async ({
      search,
      page,
      limit,
      sortBy,
      order,
    }: {
      search: string;
      page: number;
      limit: number;
      sortBy: string;
      order: 'ASC' | 'DESC';
    }) => {
      return searchQrCode({
        ...COLLECTED_SEARCH,
        search,
        page,
        limit,
        sortBy: sortBy || COLLECTED_SEARCH.sortBy,
        order,
      });
    },
    []
  );

  const fetchReceived = useCallback(
    async ({
      search,
      page,
      limit,
      sortBy,
      order,
    }: {
      search: string;
      page: number;
      limit: number;
      sortBy: string;
      order: 'ASC' | 'DESC';
    }) => {
      if (!selectedServiceCalendar?.serviceCalendarId) {
        return { data: [], total: 0, totalPages: 0 };
      }
      return searchQrCode({
        receivedServiceCalendarId: selectedServiceCalendar.serviceCalendarId,
        ...RECEIVED_SEARCH,
        ...(filterReceivedStatus
          ? { status: [filterReceivedStatus as SampleStatusEnum] }
          : {}),
        search,
        page,
        limit,
        sortBy: sortBy || RECEIVED_SEARCH.sortBy,
        order,
      });
    },
    [selectedServiceCalendar?.serviceCalendarId, filterReceivedStatus]
  );

  const buildReceivingPath = (
    qrCode: string,
    options?: { serviceCalendarId?: number; bookId?: number }
  ) => {
    const params = new URLSearchParams();
    if (options?.serviceCalendarId)
      params.set('serviceCalendarId', String(options.serviceCalendarId));
    if (options?.bookId) params.set('bookId', String(options.bookId));
    const query = params.toString();
    return `/officer/sample-receiving/${qrCode}${query ? `?${query}` : ''}`;
  };

  const handlePairScan = (qrCode: string) => {
    if (!isPairing) return;
    setIsPairing(null);
    navigate(
      buildReceivingPath(qrCode, {
        serviceCalendarId: selectedServiceCalendar?.serviceCalendarId,
        bookId: isPairing.bookId,
      }),
      {
        state: {
          serviceCalendarId: selectedServiceCalendar?.serviceCalendarId,
          bookingData: isPairing,
        },
      }
    );
  };

  const pendingBookings = bookingList.filter(book => !book.sampleReceivedAt);
  const pendingBookingCount = pendingBookings.length;
  const totalReceivingWork =
    pendingBookingCount +
    summaryCounts.collectedTotal +
    summaryCounts.receivedTotal;
  const kpiValues = [
    totalReceivingWork,
    pendingBookingCount,
    summaryCounts.collectedTotal,
    summaryCounts.receivedTotal,
  ];

  const filteredBookings = pendingBookings.filter(book => {
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

  return (
    <div className="private-page-transition">
      {/* Page Header */}
      <div className="page-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">รับตัวอย่างดิน</h1>
          <p className="text-muted mb-0">
            สแกน QR บนถุงตัวอย่างเพื่อตรวจรับเข้าระบบวิเคราะห์
          </p>
        </div>
        {selectedServiceCalendar && pendingBookingCount > 0 && (
          <span
            className="private-chip private-chip-amber fw-bold"
            style={{ fontSize: '0.85rem', padding: '7px 14px' }}
          >
            <i className="fas fa-hourglass-half me-1" />
            รอรับอีก {pendingBookingCount} ตัวอย่าง
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {KPI_CONFIG.map((cfg, i) => (
          <div key={cfg.label} className="col-sm-6 col-lg-3">
            {isSummaryLoading ? (
              <div
                className="private-metric-card h-100"
                style={{ borderLeft: '4px solid rgba(128,128,128,0.2)' }}
              >
                <div className="private-card-body py-3 px-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="flex-fill">
                      <div className="placeholder-glow mb-2">
                        <span
                          className="placeholder d-block rounded"
                          style={{ height: 11, width: '55%' }}
                        />
                      </div>
                      <div className="placeholder-glow">
                        <span
                          className="placeholder d-block rounded"
                          style={{ height: 40, width: '45%' }}
                        />
                      </div>
                    </div>
                    <div
                      className="rounded-circle flex-shrink-0"
                      style={{
                        width: 56,
                        height: 56,
                        backgroundColor: 'rgba(128,128,128,0.1)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="private-metric-card h-100"
                style={{ borderLeft: `4px solid ${cfg.accent}` }}
              >
                <div className="private-card-body py-3 px-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div
                        className="text-muted fw-semibold text-uppercase mb-1"
                        style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}
                      >
                        {cfg.label}
                      </div>
                      <div className="d-flex align-items-baseline gap-1">
                        <span
                          className="fw-bold"
                          style={{
                            fontSize: '2.5rem',
                            lineHeight: 1,
                            color: '#1a202c',
                          }}
                        >
                          {kpiValues[i]}
                        </span>
                        <span
                          className="text-muted fw-medium"
                          style={{ fontSize: '0.875rem' }}
                        >
                          {cfg.unit}
                        </span>
                      </div>
                    </div>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 56,
                        height: 56,
                        backgroundColor: `${cfg.accent}12`,
                      }}
                    >
                      <i
                        className={cfg.icon}
                        style={{ color: cfg.accent, fontSize: '1.5rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main split-pane layout */}
      <div className="row g-4">
        {/* Left column: Parameters & Quick Scan */}
        <div className="col-lg-4 col-md-5">
          {/* Card 1: Service Round Selection */}
          <div className="private-card mb-4">
            <div className="private-card-header">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-calendar-alt me-2 text-primary" />
                รอบบริการที่เลือก
              </h4>
            </div>
            <div className="private-card-body">
              <div className="d-flex flex-column gap-3">
                <GenFormDate2
                  isRequired={false}
                  id="serviceDate"
                  name="serviceDate"
                  label="วันที่ให้บริการ"
                  value={serviceDate}
                  onChange={setServiceDate}
                  desc={`ค่าเริ่มต้น คือ วันนี้ (${new Date().toLocaleDateString('th-TH')})`}
                  markedDates={markedDates}
                  onMonthYearChange={(year, month) =>
                    setSearchParam({ year, month })
                  }
                />
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
          </div>

          {/* Card 2: Quick Scan / Keyboard input */}
          {selectedServiceCalendar && (
            <div className="private-card">
              <div className="private-card-header">
                <h4 className="private-card-title mb-0">
                  <i className="fas fa-barcode me-2 text-success" />
                  สแกนรับถุงตัวอย่างดิน
                </h4>
              </div>
              <div className="private-card-body">
                {/* Scan-zone hero (mockup .scan-zone) */}
                <div className="private-scan-zone mb-3">
                  <div className="private-scan-zone-icon">
                    <i className="fas fa-qrcode" />
                  </div>
                  <div className="fw-bold mb-1" style={{ fontSize: '0.98rem' }}>
                    สแกน QR Code บนถุงตัวอย่าง
                  </div>
                  <div
                    className="text-muted mb-3"
                    style={{ fontSize: '0.82rem' }}
                  >
                    ระบบจะพาเข้าไปตรวจรับ คัดกรองข้อมูลเกษตรกร
                    และผูกพิกัดแปลงอัตโนมัติ
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setIsGeneralScanning(true)}
                  >
                    <i className="fas fa-camera" />
                    เปิดกล้องสแกนรับดิน
                  </button>
                </div>

                <form onSubmit={handleQuickScanSubmit}>
                  <label className="form-label fw-semibold text-dark small mb-1">
                    <i className="fas fa-keyboard me-1 text-muted" />
                    หรือป้อนรหัส / ยิงสแกนเนอร์ลงช่องนี้
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="สแกน หรือ พิมพ์รหัสที่นี่..."
                      value={scanInputValue}
                      onChange={e => setScanInputValue(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-arrow-right" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Tables */}
        <div className="col-lg-8 col-md-7">
          {selectedServiceCalendar ? (
            <>
              {/* Section: รายชื่อผู้จองคิวล่วงหน้า */}
              <div className="private-card private-card-accent-primary">
                <div
                  className="private-card-header bg-primary text-white sample-receiving-booking-header d-flex align-items-center justify-content-between py-3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsBookingOpen(!isBookingOpen)}
                >
                  <div className="d-flex align-items-center">
                    <i
                      className={`fas fa-chevron-${isBookingOpen ? 'down' : 'right'} me-3`}
                    />
                    <h4 className="private-card-title text-white mb-0">
                      <i className="fas fa-clipboard-list me-2" />
                      รายชื่อผู้จองคิวล่วงหน้า (Booking)
                    </h4>
                  </div>
                  <span className="badge border border-2 border-white text-white fs-6">
                    {filteredBookings.length} รายการรอรับ
                  </span>
                </div>

                {isBookingOpen && (
                  <div className="private-card-body p-0">
                    <div className="p-3 bg-light border-bottom">
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                          <i className="fas fa-search text-muted" />
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
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setBookingSearchTerm('')}
                          >
                            <i className="fas fa-times" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      className="table-responsive"
                      style={{ maxHeight: 350, overflowY: 'auto' }}
                    >
                      <table className="table table-striped table-hover mb-0 align-middle">
                        <thead className="sticky-top">
                          <tr>
                            <th>ชื่อ-นามสกุล</th>
                            <th>เบอร์โทรศัพท์</th>
                            <th>ชื่อแปลง</th>
                            <th>รหัสแปลง</th>
                            <th>วันที่จอง</th>
                            <th className="text-center" style={{ width: 140 }}>
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
                                    <span className="private-chip private-chip-blue">
                                      {book.land.landCode}
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td>{TimeStampToDate(book.bookedAt)}</td>
                                <td className="text-center">
                                  <button
                                    type="button"
                                    className="btn btn-warning btn-sm fw-bold text-dark shadow-sm px-3"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setIsPairing(book);
                                    }}
                                  >
                                    <i className="fas fa-qrcode me-1" />
                                    รับงาน
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="text-center py-4 text-muted"
                              >
                                {bookingSearchTerm ? (
                                  <>
                                    <i className="fas fa-search-minus fs-3 mb-2 d-block opacity-50" />
                                    ไม่พบข้อมูลที่ตรงกับ "{bookingSearchTerm}"
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-check-circle fs-3 mb-2 d-block text-success opacity-50" />
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

              {/* Section: QR Code ที่มีข้อมูลแล้ว (รอนำส่ง) */}
              <div className="private-card mt-4">
                <div className="private-card-header d-flex align-items-center justify-content-between py-3">
                  <h4 className="private-card-title mb-0">
                    <i className="fas fa-inbox me-2 text-primary" />
                    QR Code ที่มีข้อมูลแล้ว (รอนำส่ง)
                  </h4>
                </div>
                <div className="private-card-body">
                  <SearchAndPaginationTable<QrCodeInfo>
                    fetchData={fetchCollected}
                    initialSortBy="collectSampleAt"
                    initialOrder="ASC"
                    columns={[
                      {
                        header: 'รับดิน',
                        accessor: collected => (
                          <div className="d-flex justify-content-center">
                            <GenButtonCircle
                              icon="fa fa-plus"
                              color="btn-warning text-white"
                              onClick={() =>
                                navigate(
                                  buildReceivingPath(collected.qrCode, {
                                    serviceCalendarId:
                                      selectedServiceCalendar.serviceCalendarId,
                                  }),
                                  {
                                    state: {
                                      serviceCalendarId:
                                        selectedServiceCalendar.serviceCalendarId,
                                    },
                                  }
                                )
                              }
                            />
                          </div>
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
                          collected.book?.collectSampleAt
                            ? convertTimestampToDate(
                                collected.book.collectSampleAt
                              )
                            : '-',
                      },
                      {
                        header: 'แก้ไขล่าสุด',
                        accessor: collected =>
                          TimeStampToDate(collected.createdAt),
                        sortable: true,
                        sortKey: 'createdAt',
                      },
                    ]}
                  />
                </div>
              </div>

              {/* Section: รับตัวอย่างดินแล้ว */}
              <div className="private-card mt-4">
                <div className="private-card-header d-flex align-items-center justify-content-between py-3">
                  <h4 className="private-card-title mb-0">
                    <i className="fas fa-check-circle me-2 text-success" />
                    รับตัวอย่างดินแล้ว
                  </h4>
                </div>
                <div className="private-card-body">
                  {/* Filter bar */}
                  <div className="d-flex flex-wrap gap-3 align-items-center mb-3 pb-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <span className="small text-muted fw-semibold">
                        สถานะ:
                      </span>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={filterReceivedStatus}
                        onChange={e => setFilterReceivedStatus(e.target.value)}
                      >
                        <option value="">ทุกสถานะ</option>
                        <option value={SampleStatusEnum.RECEIVED}>
                          รับแล้ว
                        </option>
                        <option value={SampleStatusEnum.ANALYZING}>
                          กำลังวิเคราะห์
                        </option>
                        <option value={SampleStatusEnum.ANALYZED}>
                          วิเคราะห์แล้ว
                        </option>
                        <option value={SampleStatusEnum.APPROVED}>
                          อนุมัติแล้ว
                        </option>
                      </select>
                      {filterReceivedStatus && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                          style={{ height: '28px' }}
                          onClick={() => setFilterReceivedStatus('')}
                        >
                          <i className="fas fa-times me-1" />
                          ล้าง
                        </button>
                      )}
                    </div>
                  </div>

                  <SearchAndPaginationTable<QrCodeInfo>
                    fetchData={fetchReceived}
                    initialSortBy="sampleCode"
                    columns={[
                      {
                        header: 'รหัสตัวอย่าง',
                        accessor: collected => collected.book?.sampleCode,
                        sortable: true,
                        sortKey: 'sampleCode',
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
                          collected.book?.collectSampleAt
                            ? TimeStampToDate(collected.book.collectSampleAt)
                            : '-',
                      },
                      {
                        header: 'รับตัวอย่าง',
                        accessor: collected =>
                          getTimeInTimeStamp(collected.book?.sampleReceivedAt),
                      },
                      {
                        header: 'จัดการ',
                        accessor: collected => (
                          <div className="d-flex justify-content-center">
                            <GenButtonCircle
                              icon={B_LIST.info.icon}
                              color={B_LIST.info.color}
                              onClick={() =>
                                navigate(
                                  `/officer/analysis-report/${collected.book?.sampleCode}`
                                )
                              }
                            />
                          </div>
                        ),
                      },
                      {
                        header: 'แก้ไขล่าสุด',
                        accessor: collected =>
                          TimeStampToDate(collected.book?.collectSampleAt),
                        sortable: true,
                        sortKey: 'collectSampleAt',
                      },
                    ]}
                  />
                </div>
              </div>
            </>
          ) : (
            <div
              className="alert alert-light text-center shadow-sm py-5 border rounded"
              style={{ backgroundColor: '#ffffff' }}
            >
              <i className="fas fa-calendar-day fa-3x mb-3 text-muted opacity-50" />
              <h5 className="fw-semibold text-dark">ไม่พบรอบบริการในวันนี้</h5>
              <p className="text-muted small mb-0">
                กรุณาเลือกวันที่หรือรอบบริการที่มีรถให้บริการเพื่อจัดการการรับดิน
              </p>
            </div>
          )}
        </div>
      </div>

      {isGeneralScanning && (
        <GeneralScannerModal
          onClose={() => setIsGeneralScanning(false)}
          onScan={decryptedCode => {
            setIsGeneralScanning(false);
            navigate(
              buildReceivingPath(decryptedCode, {
                serviceCalendarId: selectedServiceCalendar?.serviceCalendarId,
              })
            );
          }}
        />
      )}

      {isPairing && (
        <PairingScannerModal
          onClose={() => setIsPairing(null)}
          onScan={handlePairScan}
          targetName={`${isPairing.farmer?.firstName} ${isPairing.farmer?.lastName}`}
        />
      )}
    </div>
  );
};

export default SampleReceivingManagement;
