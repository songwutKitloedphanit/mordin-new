import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { GenFormDate2, GenFormSelect } from '@/components/gui/GuiForm';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import { LabelProps } from '@/components/printable/Label';
import PrintableCard from '@/components/printable/PrintableCard';
import PrintablePage from '@/components/printable/PrintablePage';
import {
  checkEncryptQrCode,
  deleteQrCode,
  generateQrCode,
  getEncryptQrCode,
  searchQrCode,
} from '@/services/api/qr-code/QrCodeApi';
import { searchServiceCalendars } from '@/services/api/ServiceCalendarApi';
import { Bus } from '@/types/Bus';
import {
  QrCodeInfo,
  QrCodeInput,
  QrCodeTypeEnum,
  typeLabels,
} from '@/types/qr-code/QrCode';
import {
  CalendarInfoInterface,
  SearchServiceCalendar,
} from '@/types/ServiceCalendar';
import { TimeStampToDate } from '@/utils/Date';

type KpiItem = { label: string; icon: string; accent: string; unit: string };

const KPI_CONFIG: KpiItem[] = [
  {
    label: 'QR Code ทั้งหมด',
    icon: 'fas fa-qrcode',
    accent: '#6c757d',
    unit: 'ใบ',
  },
  {
    label: 'QR Code ว่าง',
    icon: 'fas fa-inbox',
    accent: '#F39C12',
    unit: 'ใบ',
  },
  { label: 'จองวิเคราะห์', icon: 'fas fa-vial', accent: '#337AB7', unit: 'ใบ' },
  {
    label: 'วิเคราะห์แล้ว',
    icon: 'fas fa-check-circle',
    accent: '#26C281',
    unit: 'ใบ',
  },
];

const QRCodeManagement: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [serviceDate, setServiceDate] = useState(today);
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [serviceCalendars, setServiceCalendars] = useState<
    CalendarInfoInterface[]
  >([]);
  const [selectedServiceCalendar, setSelectedServiceCalendar] =
    useState<CalendarInfoInterface | null>(null);
  const [matchCalendar, setMatchCalendar] = useState<CalendarInfoInterface[]>(
    []
  );
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [searchParam, setSearchParam] = useState<SearchServiceCalendar>(
    {} as SearchServiceCalendar
  );

  const [summary, setSummary] = useState<{
    total: number;
    available: number;
    reserved: number;
    completed: number;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterType, setFilterType] = useState<string>('');

  const [labels, setLabels] = useState<LabelProps[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  const lastPrintKeyRef = useRef('');

  const [showConfirm, setShowConfirm] = useState<{
    qrCode: string;
    qrCodeId: number;
  } | null>(null);

  const getPublicCollectSampleUrl = (code: string) => {
    const publicBaseUrl =
      import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;

    return `${publicBaseUrl.replace(/\/+$/, '')}/collect-sample/${code}`;
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
    const matchCal = serviceCalendars.filter(
      c => new Date(c.date).toISOString().split('T')[0] === serviceDate
    );
    if (matchCal.length > 0) {
      setMatchCalendar(matchCal);
      setBuses(matchCal.map(item => item.bus));
      setSelectedBusId(matchCal[0]?.bus?.busId ?? null);
    } else {
      setSelectedServiceCalendar(null);
      setMatchCalendar([]);
      setBuses([]);
      setSelectedBusId(null);
    }
  }, [serviceCalendars, serviceDate]);

  useEffect(() => {
    if (selectedBusId) {
      const select = matchCalendar.find(m => m.busId === selectedBusId);
      setSelectedServiceCalendar(select || null);
    }
  }, [matchCalendar, selectedBusId]);

  useEffect(() => {
    if (!selectedServiceCalendar?.serviceCalendarId) {
      setSummary(null);
      return;
    }
    setSummaryLoading(true);
    searchQrCode({
      serviceCalendarId: selectedServiceCalendar.serviceCalendarId,
      page: 1,
      limit: 9999,
    })
      .then(response => {
        const qrCodes = response.data as QrCodeInfo[];
        const total = qrCodes.length;
        const reserved = qrCodes.filter(qr => qr.book != null).length;
        const completed = qrCodes.filter(
          qr => qr.book?.results && qr.book.results.length > 0
        ).length;
        setSummary({ total, available: total - reserved, reserved, completed });
      })
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, [selectedServiceCalendar?.serviceCalendarId, refreshKey]);

  const fetchQrCodes = useCallback(
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
      const response = await searchQrCode({
        serviceCalendarId: selectedServiceCalendar.serviceCalendarId,
        search,
        page,
        limit,
        sortBy,
        order,
        ...(filterType ? { type: filterType as QrCodeTypeEnum } : {}),
      });
      return {
        data: response.data,
        total: response.total,
        totalPages: response.totalPages,
      };
    },
    [selectedServiceCalendar?.serviceCalendarId, filterType]
  );

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `qrcode_${Date.now()}`,
    pageStyle:
      labels.length === 1
        ? '@page { size: 50mm 80mm ; margin: 0 }'
        : '@page { size: 175mm 212mm; margin: 0 }',
    onBeforePrint: () =>
      new Promise<void>(resolve => requestAnimationFrame(() => resolve())),
    onAfterPrint: () => {
      lastPrintKeyRef.current = '';
      setLabels([]);
      setRefreshKey(prev => prev + 1);
    },
  });

  const printMultiLabel = async () => {
    if (!selectedServiceCalendar?.serviceCalendarId) return;
    const qrInput: QrCodeInput = {
      type: QrCodeTypeEnum.Spread,
      serviceCalendarId: Number(selectedServiceCalendar.serviceCalendarId),
    };
    const qrList = await generateQrCode(8, qrInput);
    setLabels(
      qrList.map(
        ({
          qrCode,
          encryptedCode,
        }: {
          qrCode: string;
          encryptedCode: string;
        }) => ({
          qrValue: getPublicCollectSampleUrl(encryptedCode),
          qrText: qrCode,
        })
      )
    );
  };

  useEffect(() => {
    if (labels.length > 0) {
      const printKey = labels.map(label => label.qrValue).join('|');
      if (lastPrintKeyRef.current === printKey) return;
      lastPrintKeyRef.current = printKey;
      window.setTimeout(() => handlePrint(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels]);

  const printSingleLabel = async (qr: QrCodeInfo) => {
    const isEncrypted = await checkEncryptQrCode(qr.qrCode);
    const qrValue = isEncrypted
      ? getPublicCollectSampleUrl(qr.qrCode)
      : getPublicCollectSampleUrl(await getEncryptQrCode(qr.qrCode));
    setLabels([{ qrValue, qrText: qr.qrCode }]);
  };

  const handleDelete = async (qrCodeId: number, qrCode: string) => {
    try {
      await deleteQrCode(qrCodeId);
      setShowConfirm(null);
      setRefreshKey(prev => prev + 1);
      await Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ',
        text: `ลบ QR Code ${qrCode} เรียบร้อยแล้ว`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message = err?.response?.data?.message || 'ไม่สามารถลบ QR Code ได้';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
      setShowConfirm(null);
    }
  };

  const kpiValues = summary
    ? [summary.total, summary.available, summary.reserved, summary.completed]
    : [0, 0, 0, 0];

  return (
    <>
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {KPI_CONFIG.map((cfg, i) => (
          <div key={cfg.label} className="col-sm-6 col-lg-3">
            {summaryLoading ? (
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
                        width: 64,
                        height: 64,
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
                        className="text-muted fw-semibold text-uppercase mb-2"
                        style={{ fontSize: '0.85rem', letterSpacing: '0.6px' }}
                      >
                        {cfg.label}
                      </div>
                      <div className="d-flex align-items-baseline gap-1">
                        <span
                          className="fw-bold"
                          style={{ fontSize: '3.5rem', lineHeight: 1 }}
                        >
                          {kpiValues[i]}
                        </span>
                        <span
                          className="text-muted"
                          style={{ fontSize: '1rem' }}
                        >
                          {cfg.unit}
                        </span>
                      </div>
                    </div>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 64,
                        height: 64,
                        backgroundColor: `${cfg.accent}1a`,
                      }}
                    >
                      <i
                        className={cfg.icon}
                        style={{ color: cfg.accent, fontSize: '1.8rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Date & Bus selectors */}
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
                    markedDates={markedDates}
                    onMonthYearChange={(year, month) => {
                      setSearchParam({ year, month });
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <GenFormSelect
                    isRequired={false}
                    id="carSelect"
                    name="carSelect"
                    label="รถที่ให้บริการ"
                    value={selectedBusId}
                    onChange={e => setSelectedBusId(Number(e.target.value))}
                    options={buses.map(bus => ({
                      value: bus.busId,
                      name: `${bus.busName} - ${bus.licensePlate}`,
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedServiceCalendar ? (
        <div className="row mb-4">
          <div className="col-12">
            <div className="private-card">
              <div className="private-card-header d-flex align-items-center justify-content-between">
                <h4 className="private-card-title mb-0">
                  <i className="fas fa-qrcode me-2" />
                  QR Code
                </h4>
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ width: 180 }}
                  onClick={printMultiLabel}
                >
                  <i className="fas fa-print me-2" />
                  Print QR Code ใหม่
                </button>
              </div>
              <div className="private-card-body">
                {/* Filter bar */}
                <div className="d-flex flex-wrap gap-3 align-items-center mb-3 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <label className="form-label small mb-0 text-nowrap">
                      ประเภท QR:
                    </label>
                    <select
                      className="form-select form-select-sm w-auto"
                      value={filterType}
                      onChange={e => setFilterType(e.target.value)}
                    >
                      <option value="">ทุกประเภท</option>
                      <option value={QrCodeTypeEnum.Booking}>จอง</option>
                      <option value={QrCodeTypeEnum.Walkin}>Walk-in</option>
                      <option value={QrCodeTypeEnum.Spread}>กระจาย</option>
                    </select>
                    {filterType && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setFilterType('')}
                      >
                        <i className="fas fa-times me-1" />
                        ล้าง
                      </button>
                    )}
                  </div>
                </div>

                <SearchAndPaginationTable<QrCodeInfo>
                  fetchData={fetchQrCodes}
                  refreshKey={refreshKey}
                  columns={[
                    {
                      header: 'หมายเลข QR Code',
                      accessor: qr => qr.qrCode,
                      sortable: true,
                      sortKey: 'qrCode',
                    },
                    {
                      header: 'พนักงาน',
                      accessor: qr =>
                        `${qr.createdUser?.firstName ?? ''} ${qr.createdUser?.lastName ?? ''}`.trim(),
                    },
                    {
                      header: 'วันที่',
                      accessor: qr => TimeStampToDate(qr.createdAt),
                      sortable: true,
                      sortKey: 'createdAt',
                    },
                    {
                      header: 'ประเภท',
                      accessor: qr => typeLabels[qr.type],
                      sortable: true,
                      sortKey: 'type',
                    },
                    {
                      header: 'จอง',
                      accessor: () => '',
                    },
                    {
                      header: 'วิเคราะห์',
                      accessor: qr =>
                        TimeStampToDate(
                          qr.book?.results?.[0]?.recordedAt ?? ''
                        ),
                    },
                    {
                      header: 'จัดการ',
                      accessor: qr => (
                        <>
                          <GenButtonCircle
                            icon={B_LIST.print.icon}
                            color={B_LIST.print.color}
                            onClick={() => printSingleLabel(qr)}
                            className="mx-1"
                          />
                          <GenButtonCircle
                            icon={B_LIST.del.icon}
                            color={B_LIST.del.color}
                            onClick={() =>
                              setShowConfirm({
                                qrCode: qr.qrCode,
                                qrCodeId: qr.qrCodeId,
                              })
                            }
                            className="mx-1"
                          />
                        </>
                      ),
                    },
                    {
                      header: 'แก้ไขล่าสุด',
                      accessor: qr => TimeStampToDate(qr.createdAt),
                      sortable: true,
                      sortKey: 'createdAt',
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-light text-center shadow-sm mt-2">
          <i className="fas fa-calendar-day me-2" />
          ไม่พบข้อมูลการให้บริการในวันนี้
        </div>
      )}

      {/* Hidden printable area */}
      <div style={{ position: 'absolute', left: '-10000px', top: 0 }}>
        {labels.length === 1 ? (
          <PrintableCard ref={printRef} labels={labels} rotate />
        ) : (
          <PrintablePage ref={printRef} labels={labels} />
        )}
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ยืนยันการลบ"
          text={`คุณต้องการลบ ${showConfirm.qrCode} หรือไม่?`}
          action="delete"
          onConfirm={() =>
            handleDelete(showConfirm.qrCodeId, showConfirm.qrCode)
          }
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};

export default QRCodeManagement;
