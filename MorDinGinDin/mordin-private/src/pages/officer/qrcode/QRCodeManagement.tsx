import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import { GenFormSelect, GenFormDate2 } from '../../../components/gui/GuiForm';
import { LabelProps } from '../../../components/printable/Label';
import PrintableCard from '../../../components/printable/PrintableCard';
import PrintablePage from '../../../components/printable/PrintablePage';
import {
  checkEncryptQrCode,
  deleteQrCode,
  generateQrCode,
  getEncryptQrCode,
  searchQrCode,
} from '../../../services/api/qr-code/QrCodeApi';
import Swal from 'sweetalert2';
import { searchServiceCalendars } from '../../../services/api/ServiceCalendarApi';
import { Bus } from '../../../types/Bus';
import {
  QrCodeInfo,
  QrCodeInput,
  QrCodeTypeEnum,
  typeLabels,
} from '../../../types/qr-code/QrCode';
import {
  CalendarInfoInterface,
  SearchServiceCalendar,
} from '../../../types/ServiceCalendar';

import SearchAndPaginationWithSearchKey from '@/components/gui/SearchAndPaginationWithSearchKey';
import OfficerQRCodeSummaryCard from '@/components/pages/officer-qrcode/QRCodeSummaryCard';
import { TimeStampToDate } from '@/utils/Date';

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
  const [labels, setLabels] = useState<LabelProps[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  // const [, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<null | {
    type: 'delete' | 'cancel';
    qrCode?: string;
    qrCodeId?: number;
  }>(null);

  const [searchParam, setSearchParam] = useState<SearchServiceCalendar>(
    {} as SearchServiceCalendar
  );

  useEffect(() => {
    const fetchCalendar = async () => {
      const payload: SearchServiceCalendar = {
        ...searchParam,
        all: true,
      };
      const calData = await searchServiceCalendars(payload);

      console.log(calData);

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

  const [reloadTrigger, setReloadTrigger] = useState(0);

  const searchKeys = useMemo(
    () => ({
      serviceCalendarId: selectedServiceCalendar?.serviceCalendarId,
      reloadTrigger,
    }),
    [selectedServiceCalendar, reloadTrigger]
  );

  useEffect(() => {
    const matchCalendar = serviceCalendars.filter(
      c => new Date(c.date).toISOString().split('T')[0] === serviceDate
    );

    if (matchCalendar.length > 0) {
      setMatchCalendar(matchCalendar);
      setBuses(matchCalendar.map(item => item.bus));
      setSelectedBusId(matchCalendar[0]?.bus?.busId ?? null);
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
      setLabels([]); // ล้างเพื่อซ่อน PrintableComponent
      setReloadTrigger(prev => prev + 1);
      console.log('✅ Print complete and Printable cleared');
    },
  });

  const printMultiLabel = async () => {
    if (!selectedServiceCalendar?.serviceCalendarId) return;

    const qrInput: QrCodeInput = {
      type: QrCodeTypeEnum.Spread,
      serviceCalendarId: Number(selectedServiceCalendar.serviceCalendarId),
    };

    const qrList = await generateQrCode(8, qrInput);

    console.log('✅ qrList:', qrList); // ตรวจสอบรูปแบบ [{ qrCode, encryptedCode }, ...]

    setLabels(
      qrList.map(
        ({
          qrCode,
          encryptedCode,
        }: {
          qrCode: string;
          encryptedCode: string;
        }) => ({
          qrValue: `${import.meta.env.VITE_BASE_URL}/private/collect-sample/${encryptedCode}`,
          qrText: qrCode,
        })
      )
    );
  };

  //console.log('label', labels);
  useEffect(() => {
    if (labels.length > 0) {
      handlePrint();
    } else {
      console.log('🧼 Printable component cleared.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels]);

  const printSingleLabel = async (qr: QrCodeInfo) => {
    const isEncrypted = await checkEncryptQrCode(qr.qrCode);
    const qrValue = isEncrypted
      ? `${import.meta.env.VITE_BASE_URL}/collect-sample/${qr.qrCodeId}`
      : `${import.meta.env.VITE_BASE_URL}/collect-sample/${await getEncryptQrCode(qr.qrCode)}`;

    setLabels([
      {
        qrValue,
        qrText: qr.qrCode,
      },
    ]);
  };

  return (
    <>
      {/* Summary Cards */}
      <OfficerQRCodeSummaryCard
        serviceCalendarId={selectedServiceCalendar?.serviceCalendarId}
      />

      <div className="row mt-0">
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
            value={selectedBusId}
            onChange={e => setSelectedBusId(Number(e.target.value))}
            options={buses.map(bus => ({
              value: bus.busId,
              name: `${bus.busName} - ${bus.licensePlate}`,
            }))}
          />
        </div>
      </div>

      {selectedServiceCalendar ? (
        <div className="row mt-4">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="card-title m-0">QR code</h4>
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ width: '180px' }}
                  onClick={printMultiLabel}
                >
                  Print a new QR code
                </button>
              </div>
              <div className="card-body">
                <SearchAndPaginationWithSearchKey<QrCodeInfo>
                  searchKeys={searchKeys}
                  fetchData={searchQrCode}
                  columns={[
                    {
                      header: 'หมายเลข QR Code',
                      accessor: qrCodeData => qrCodeData.qrCode,
                      sortable: true,
                      sortKey: 'qrCode',
                    },
                    {
                      header: 'พนักงาน',
                      accessor: qrCodeData =>
                        `${qrCodeData.createdUser?.firstName} ${qrCodeData.createdUser?.lastName}`,
                    },
                    {
                      header: 'วันที่',
                      accessor: qrCodeData =>
                        TimeStampToDate(qrCodeData.createdAt),
                      sortable: true,
                      sortKey: 'createdAt',
                    },
                    {
                      header: 'ประเภท',
                      accessor: qrCodeData => typeLabels[qrCodeData.type],
                      sortable: true,
                      sortKey: 'type',
                    },
                    {
                      header: 'จอง',
                      accessor: () => '',
                    },
                    {
                      header: 'วิเคราะห์',
                      accessor: qrCodeData =>
                        TimeStampToDate(
                          qrCodeData.book?.results?.[0]?.recordedAt ?? ''
                        ),
                    },
                    {
                      header: 'MANAGEMENT',
                      accessor: qrCodeData => (
                        <>
                          <GenButtonCircle
                            icon={B_LIST.print.icon}
                            color={B_LIST.print.color}
                            onClick={() => printSingleLabel(qrCodeData)}
                            className="mx-1"
                          />
                          <GenButtonCircle
                            icon={B_LIST.del.icon}
                            color={B_LIST.del.color}
                            onClick={() =>
                              setShowConfirm({
                                type: 'delete',
                                qrCode: qrCodeData.qrCode,
                                qrCodeId: qrCodeData.qrCodeId,
                              })
                            }
                            className="mx-1"
                          />
                        </>
                      ),
                    },
                    {
                      header: 'UPDATE',
                      accessor: qrCodeData =>
                        TimeStampToDate(qrCodeData.createdAt),
                    },
                  ]}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'none' }}>
            {labels.length === 1 ? (
              <PrintableCard ref={printRef} labels={labels} rotate />
            ) : (
              <PrintablePage ref={printRef} labels={labels} />
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4">ไม่พบข้อมูลการให้บริการในวันนี้</div>
      )}

      {showConfirm && (
        <ConfirmAlert
          title={
            showConfirm.type === 'delete' ? 'ยืนยันการลบ' : 'ยืนยันการยกเลิก'
          }
          text={
            showConfirm.type === 'delete'
              ? `คุณต้องการลบ ${showConfirm.qrCode} หรือไม่?`
              : 'คุณต้องการยกเลิกการแก้ไขหรือไม่?'
          }
          action={showConfirm.type}
          onConfirm={async () => {
            if (showConfirm.type === 'delete' && showConfirm.qrCodeId) {
              try {
                await deleteQrCode(showConfirm.qrCodeId);
                setShowConfirm(null);
                setReloadTrigger(prev => prev + 1);
                Swal.fire({
                  icon: 'success',
                  title: 'ลบสำเร็จ',
                  text: 'ลบ QR Code เรียบร้อยแล้ว',
                  showConfirmButton: false,
                  timer: 1500,
                });
              } catch (error: any) {
                setShowConfirm(null);
                const message =
                  error.response?.data?.message || 'ไม่สามารถลบ QR Code ได้';
                Swal.fire({
                  icon: 'error',
                  title: 'เกิดข้อผิดพลาด',
                  text: message,
                });
              }
            } else {
              setShowConfirm(null);
            }
          }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};

export default QRCodeManagement;
