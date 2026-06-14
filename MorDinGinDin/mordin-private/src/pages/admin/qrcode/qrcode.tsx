import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { GenFormSelect, GenFormText1 } from '@/components/gui/GuiForm';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import QRCodeSummaryCard from '@/components/pages/qrcode/QRCodeSummaryCard';
import { LabelProps } from '@/components/printable/Label';
import PrintableCard from '@/components/printable/PrintableCard';
import PrintablePage from '@/components/printable/PrintablePage';
import {
  generateQrCode,
  deleteQrCode,
  getEncryptQrCode,
  searchQrCode,
} from '@/services/api/qr-code/QrCodeApi';
import Swal from 'sweetalert2';
import {
  getAllFactories,
  getFactoryById,
} from '@/services/api/service-area/FactoryApi';
import { BaseSearchAndPaginationParams } from '@/types/common/BaseSearch';
import {
  QrCodeInfo,
  QrCodeInput,
  QrCodeSearch,
  QrCodeTypeEnum,
  typeLabels,
} from '@/types/qr-code/QrCode';
import { FactoryInfoInterface } from '@/types/service-area/Factories';
import { ServiceAreaInterface } from '@/types/service-area/ServiceAreas';
import { TimeStampToDate } from '@/utils/Date';

const years = ['2025', '2026', '2027'];
const QRCode = () => {
  const [searchParam, setSearchParam] = useState<QrCodeSearch>(
    {} as QrCodeSearch
  );

  const [qrCodeSheetAmount, setQrCodeSheetAmount] = useState<number>(1);
  const [factories, setFactories] = useState<FactoryInfoInterface[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaInterface[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<string>('');
  const [selectedService_area, setSelectedService_area] = useState<string>('');
  // const [qrCodes, setQrCodes] = useState<QrCodeInfo[]>([]);
  const [labels, setLabels] = useState<LabelProps[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showConfirm, setShowConfirm] = useState<null | {
    type: 'delete' | 'cancel';
    index?: number;
    qrCode?: string;
    qrCodeId?: number;
  }>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const factoriesList = await getAllFactories();
        const factory = await getFactoryById(factoriesList[0]?.factoryId);
        setFactories(factoriesList);
        setServiceAreas(factory.serviceAreas);

        if (factoriesList.length) {
          const defaultFactory = factoriesList[0];
          setSelectedFactory(defaultFactory.factoryId.toString());
        }
        if (factory) {
          setSelectedService_area(
            factory.serviceAreas[0].serviceAreaId.toString()
          );
        }
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedFactory) return;
    (async () => {
      try {
        const factory = await getFactoryById(Number(selectedFactory));
        setServiceAreas(factory.serviceAreas);
        if (factory.serviceAreas.length) {
          setSelectedService_area(
            factory.serviceAreas[0].serviceAreaId.toString()
          );
        } else {
          setSelectedService_area('');
        }
      } catch (err) {
        console.error('Failed to load service areas for factory', err);
      }
    })();
  }, [selectedFactory]);

  const fetchQrCodes = async ({
    search = '',
    page = 1,
    limit = 10,
    sortBy = '',
    order = 'DESC',
  }: Partial<BaseSearchAndPaginationParams> = {}) => {
    // กำหนด default เป็น {} เพื่อให้เรียกเปล่า ๆ ได้เลย
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
  };

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
      setLabels([]);
      fetchQrCodes();
      console.log('🧼 Printable component cleared after print.');
    },
  });

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
    console.log('📦 Generated QR List:', qrList); // ✅ ดูค่าที่ส่งกลับ

    setLabels(
      qrList.map(
        ({
          qrCode,
          encryptedCode,
        }: {
          qrCode: string;
          encryptedCode: string;
        }) => ({
          qrValue: `${import.meta.env.VITE_BASE_URL}/collect-sample/${encryptedCode}`,
          qrText: qrCode,
        })
      )
    );
  };

  // useEffect(() => {
  //   const fetchQrCodesForCard = async () => {
  //     const response = await searchQrCode({
  //       ...searchParam,
  //       page: 1,
  //       limit: 9999, // ดึงมาทั้งหมดเพื่อให้สามารถนับได้
  //     });

  //     const normalized = response.data.map((item: QrCodeInfo) => ({
  //       ...item,
  //       createdAt:
  //         typeof item.createdAt === 'string'
  //           ? parseInt(item.createdAt, 10)
  //           : item.createdAt,
  //     }));

  //     setQrCodes(normalized); // อันนี้เก็บใน state ไว้ใช้กับ Card
  //   };
  //   fetchQrCodesForCard();
  // }, [searchParam]);

  useEffect(() => {
    if (labels.length > 0) {
      handlePrint();
    } else {
      console.log('🧼 Printable component cleared.');
    }
  }, [handlePrint, labels]);

  const printSingleLabel = async (qr: QrCodeInfo) => {
    const encryptQr = await getEncryptQrCode(qr.qrCode);
    setLabels([
      {
        qrValue: `${import.meta.env.VITE_BASE_URL}/collect-sample/${encryptQr}`,
        qrText: qr.qrCode,
      },
    ]);
  };

  return (
    <div>
      {/* Tab Year */}
      <div className="row mb-4">
        <div className="col-12 text-start">
          <ul
            className="nav nav-pills nav-secondary"
            id="pills-tab"
            role="tablist"
          >
            {years.map(year => (
              <li className="nav-item" key={year}>
                <button
                  type="button"
                  className={`nav-link ${selectedYear === year ? 'active' : ''
                    }`}
                  onClick={() => {
                    setSearchParam({ year: Number(year) });
                    setSelectedYear(year);
                  }}
                >
                  {year}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary Cards */}
      <QRCodeSummaryCard />

      {/* Select + Download */}
      <div className="row">
        <div className="col-12 text-center">
          <div className="card p-4">
            <div className="row">
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
              <div className="col-md-3 d-flex align-items-center justify-content-center">
                <GenFormText1
                  label="จำนวนแผ่น"
                  id="qrCodeSheetAmount"
                  isRequired={false}
                  name="qrCodeSheetAmount"
                  placeholder="จำนวนแผ่น"
                  type="number"
                  value={qrCodeSheetAmount}
                  onChange={e => handleAmountQrCodeChange(e)}
                />
              </div>
              <div className="col-md-3 d-flex align-items-center justify-content-center">
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ width: 150 }}
                  onClick={printMultiLabel}
                >
                  Print QR code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title">QR Code</h4>
            </div>
            <div className="card-body">
              <SearchAndPaginationTable<QrCodeInfo>
                fetchData={fetchQrCodes}
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
                    header: 'โรงงาน',
                    accessor: qrCodeData =>
                      qrCodeData.serviceArea?.factory?.name,
                  },
                  {
                    header: 'เขตส่งเสริม',
                    accessor: qrCodeData => qrCodeData.serviceArea?.name,
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
      </div>
      <div style={{ display: 'none' }}>
        {labels.length === 1 ? (
          <PrintableCard ref={printRef} labels={labels} rotate />
        ) : (
          <PrintablePage ref={printRef} labels={labels} />
        )}
      </div>
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
                fetchQrCodes();
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
    </div>
  );
};

export default QRCode;
