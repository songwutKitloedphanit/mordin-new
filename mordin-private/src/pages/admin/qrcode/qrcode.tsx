import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { GenFormSelect, GenFormText1 } from '@/components/gui/GuiForm';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import { LabelProps } from '@/components/printable/Label';
import PrintableCard from '@/components/printable/PrintableCard';
import PrintablePage from '@/components/printable/PrintablePage';
import {
  deleteQrCode,
  generateQrCode,
  getEncryptQrCode,
  getQrCodeSummary,
  searchQrCode,
} from '@/services/api/qr-code/QrCodeApi';
import {
  getAllFactories,
  getFactoryById,
} from '@/services/api/service-area/FactoryApi';
import { BaseSearchAndPaginationParams } from '@/types/common/BaseSearch';
import {
  QrCodeInfo,
  QrCodeInput,
  QrCodeSearch,
  QrCodeSummary,
  QrCodeTypeEnum,
  typeLabels,
} from '@/types/qr-code/QrCode';
import { FactoryInfoInterface } from '@/types/service-area/Factories';
import { ServiceAreaInterface } from '@/types/service-area/ServiceAreas';
import { TimeStampToDate } from '@/utils/Date';

type KpiItem = { label: string; icon: string; accent: string; unit: string };

const KPI_CONFIG: KpiItem[] = [
  {
    label: 'QR Code ทั้งหมด',
    icon: 'fas fa-qrcode',
    accent: '#18a05c',
    unit: 'ใบ',
  },
  {
    label: 'QR Code ว่าง',
    icon: 'fas fa-inbox',
    accent: '#d98f0c',
    unit: 'ใบ',
  },
  { label: 'จองวิเคราะห์', icon: 'fas fa-vial', accent: '#3b9bd9', unit: 'ใบ' },
  {
    label: 'วิเคราะห์แล้ว',
    icon: 'fas fa-check-circle',
    accent: '#2fb380',
    unit: 'ใบ',
  },
];

const QRCode = () => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1].map(y =>
    y.toString()
  );

  const [summary, setSummary] = useState<QrCodeSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [searchParam, setSearchParam] = useState<QrCodeSearch>({
    year: currentYear,
  } as QrCodeSearch);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const [qrCodeSheetAmount, setQrCodeSheetAmount] = useState<number>(1);
  const [factories, setFactories] = useState<FactoryInfoInterface[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaInterface[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<string>('');
  const [selectedService_area, setSelectedService_area] = useState<string>('');

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
    setSummaryLoading(true);
    getQrCodeSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const factoriesList = await getAllFactories();
        const factory = await getFactoryById(factoriesList[0]?.factoryId);
        setFactories(factoriesList);
        setServiceAreas(factory.serviceAreas);
        if (factoriesList.length) {
          setSelectedFactory(factoriesList[0].factoryId.toString());
        }
        if (factory?.serviceAreas?.length) {
          setSelectedService_area(
            factory.serviceAreas[0].serviceAreaId.toString()
          );
        }
      } catch (error) {
        console.error('Failed to load factories', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedFactory) return;
    getFactoryById(Number(selectedFactory))
      .then(factory => {
        setServiceAreas(factory.serviceAreas);
        setSelectedService_area(
          factory.serviceAreas[0]?.serviceAreaId.toString() ?? ''
        );
      })
      .catch(console.error);
  }, [selectedFactory]);

  const fetchQrCodes = useCallback(
    async ({
      search = '',
      page = 1,
      limit = 10,
      sortBy = '',
      order = 'DESC',
    }: Partial<BaseSearchAndPaginationParams> = {}) => {
      const response = await searchQrCode({
        ...searchParam,
        factoryId: selectedFactory ? Number(selectedFactory) : undefined,
        serviceAreaId: selectedService_area
          ? Number(selectedService_area)
          : undefined,
        search,
        page,
        limit,
        sortBy,
        order,
      });

      const normalized = response.data.map((item: QrCodeInfo) => ({
        ...item,
        createdAt:
          typeof item.createdAt === 'string'
            ? parseInt(item.createdAt, 10)
            : item.createdAt,
      }));

      return {
        data: normalized,
        total: response.total,
        totalPages: Math.ceil(response.total / limit),
      };
    },
    [searchParam, selectedFactory, selectedService_area]
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

  useEffect(() => {
    if (labels.length > 0) {
      const printKey = labels.map(label => label.qrValue).join('|');
      if (lastPrintKeyRef.current === printKey) return;
      lastPrintKeyRef.current = printKey;
      window.setTimeout(() => handlePrint(), 100);
    }
  }, [handlePrint, labels]);

  const handleAmountQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 20) {
      setQrCodeSheetAmount(value);
    }
  };

  const printMultiLabel = async () => {
    if (!selectedService_area) return;
    const qrInput: QrCodeInput = {
      type: QrCodeTypeEnum.Spread,
      serviceAreaId: Number(selectedService_area),
    };
    const qrList = await generateQrCode(qrCodeSheetAmount * 8, qrInput);
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

  const printSingleLabel = async (qr: QrCodeInfo) => {
    const encryptQr = await getEncryptQrCode(qr.qrCode);
    setLabels([
      {
        qrValue: getPublicCollectSampleUrl(encryptQr),
        qrText: qr.qrCode,
      },
    ]);
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
    ? [
        summary.total,
        summary.total - summary.reserved,
        summary.reserved,
        summary.completed,
      ]
    : [0, 0, 0, 0];

  return (
    <>
      {/* Year Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-calendar-alt me-2" />
                ปีที่ให้บริการ
              </h4>
            </div>
            <div className="private-card-body py-2">
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: 140 }}
                value={selectedYear}
                onChange={e => {
                  setSearchParam({ year: Number(e.target.value) });
                  setSelectedYear(e.target.value);
                }}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    ปี {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

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

      {/* Print Controls Card */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-print me-2" />
                พิมพ์ QR Code
              </h4>
            </div>
            <div className="private-card-body">
              <div className="row align-items-end">
                <div className="col-md-3">
                  <GenFormSelect
                    id="factory"
                    name="factory"
                    label="โรงงาน"
                    options={factories.map(f => ({
                      value: f.factoryId.toString(),
                      name: `${f.name} (${f.initial})`,
                    }))}
                    value={selectedFactory}
                    onChange={e => setSelectedFactory(e.target.value)}
                    isRequired={false}
                    disabled={factories.length === 0}
                  />
                </div>
                <div className="col-md-3">
                  <GenFormSelect
                    id="service_area"
                    name="service_area"
                    label="เขตส่งเสริม"
                    options={serviceAreas.map(a => ({
                      value: a.serviceAreaId.toString(),
                      name: `เขต ${a.code} ${a.name}`,
                    }))}
                    value={selectedService_area}
                    onChange={e => setSelectedService_area(e.target.value)}
                    isRequired={false}
                  />
                </div>
                <div className="col-md-3">
                  <GenFormText1
                    label="จำนวนแผ่น"
                    id="qrCodeSheetAmount"
                    isRequired={false}
                    name="qrCodeSheetAmount"
                    placeholder="จำนวนแผ่น (1-20)"
                    type="number"
                    value={qrCodeSheetAmount}
                    onChange={handleAmountQrCodeChange}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-center pb-3">
                  <button
                    type="button"
                    className="btn btn-success w-100"
                    onClick={printMultiLabel}
                    disabled={!selectedService_area}
                  >
                    <i className="fas fa-print me-2" />
                    Print QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Table */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-qrcode me-2" />
                QR Code
              </h4>
            </div>
            <div className="private-card-body">
              <SearchAndPaginationTable<QrCodeInfo>
                fetchData={fetchQrCodes}
                refreshKey={refreshKey}
                columns={[
                  {
                    header: 'หมายเลข QR Code',
                    accessor: q => q.qrCode,
                    sortable: true,
                    sortKey: 'qrCode',
                  },
                  {
                    header: 'พนักงาน',
                    accessor: q =>
                      `${q.createdUser?.firstName ?? ''} ${q.createdUser?.lastName ?? ''}`.trim(),
                  },
                  {
                    header: 'วันที่',
                    accessor: q => TimeStampToDate(q.createdAt),
                    sortable: true,
                    sortKey: 'createdAt',
                  },
                  {
                    header: 'ประเภท',
                    accessor: q => typeLabels[q.type],
                    sortable: true,
                    sortKey: 'type',
                    filterable: true,
                  },
                  {
                    header: 'จอง',
                    accessor: () => '',
                  },
                  {
                    header: 'วิเคราะห์',
                    accessor: q =>
                      TimeStampToDate(q.book?.results?.[0]?.recordedAt ?? ''),
                  },
                  {
                    header: 'โรงงาน',
                    accessor: q => q.serviceArea?.factory?.name ?? '-',
                    filterable: true,
                  },
                  {
                    header: 'เขตส่งเสริม',
                    accessor: q => q.serviceArea?.name ?? '-',
                    filterable: true,
                  },
                  {
                    header: 'จัดการ',
                    accessor: q => (
                      <>
                        <GenButtonCircle
                          icon={B_LIST.print.icon}
                          color={B_LIST.print.color}
                          onClick={() => printSingleLabel(q)}
                          className="mx-1"
                        />
                        <GenButtonCircle
                          icon={B_LIST.del.icon}
                          color={B_LIST.del.color}
                          onClick={() =>
                            setShowConfirm({
                              qrCode: q.qrCode,
                              qrCodeId: q.qrCodeId,
                            })
                          }
                          className="mx-1"
                        />
                      </>
                    ),
                  },
                  {
                    header: 'แก้ไขล่าสุด',
                    accessor: q => TimeStampToDate(q.createdAt),
                    sortable: true,
                    sortKey: 'createdAt',
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

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

export default QRCode;
