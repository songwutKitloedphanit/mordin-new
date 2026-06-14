import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';

import '../../../../public/assets/css/table.css';
import CollectionWizardModal from './CollectionWizardModal';

import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import SearchModal from '@/components/pages/collect-exam/SearchModal';
import { getFarmerById, searchFarmers } from '@/services/api/FarmerApi';
import {
  getBookingsByCalendar,
  settingOwnerData,
} from '@/services/api/qr-code/BookApi';
import {
  getQrCodeByQrCode,
  receivedSampleByDecryptedCode,
} from '@/services/api/qr-code/QrCodeApi';
import { FarmerInfo } from '@/types/Farmer';
import { LandInfoInterface } from '@/types/Land';
import { Book, QrCodeInfo, SampleStatusEnum } from '@/types/qr-code/QrCode';
import { TimeStampToDate } from '@/utils/Date';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';
import { swalSuccessTimer, swalError } from '@/utils/swal';

const normalizeLandCode = (value?: string | null) => value?.trim() ?? '';
const normalizeDigits = (value?: string | null) =>
  String(value ?? '').replace(/\D/g, '');

const getUniqueFarmer = (farmers: FarmerInfo[]) => {
  const uniqueFarmers = farmers.filter(
    (farmer, index, list) =>
      list.findIndex(item => item.farmerId === farmer.farmerId) === index
  );

  return uniqueFarmers.length === 1 ? uniqueFarmers[0] : null;
};

// ข้อมูลสำหรับ cards
// const cardData = [
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

interface InfoTableProps {
  title: string;
  data: { [key: string]: string | number | null };
  loading: boolean;
}

const InfoTable: React.FC<InfoTableProps> = ({ title, data, loading }) => {
  return (
    <div className="col-md-4">
      <div className="private-card">
        <div className="private-card-header">
          <div className="row row-demo-grid">
            <div className="col-md-8 col-sm-8 col-8 text-start">
              <h4 className="private-card-title">{title}</h4>
            </div>
          </div>
        </div>
        <div className="private-card-body">
          <div className="col-md-12 ms-auto me-auto">
            <div className="row p-4">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <table style={{ minHeight: '120px' }}>
                  <tbody>
                    {Object.entries(data).map(([key, value]) => (
                      <tr key={key}>
                        <th>{key}</th>
                        <td>{value || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SampleReceivingInfo: React.FC = () => {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState<MapMarkerData[]>([]);
  const [loading, setLoadiing] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<QrCodeInfo>({} as QrCodeInfo);
  const [searchModal, setSearchModal] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStartStep, setWizardStartStep] = useState(1);
  const [isShowMap, setIsShowMap] = useState(false);
  const locationId = useLocation();
  const searchParams = new URLSearchParams(locationId.search);
  const stateServiceCalendarId = locationId.state?.serviceCalendarId as
    | number
    | undefined;
  const stateBookingData = locationId.state?.bookingData as Book | undefined;
  const queryServiceCalendarId = Number(
    searchParams.get('serviceCalendarId') || ''
  );
  const queryBookId = Number(searchParams.get('bookId') || '');
  const [resolvedBookingData, setResolvedBookingData] = useState<Book | null>(
    stateBookingData ?? null
  );
  const effectiveServiceCalendarId =
    stateServiceCalendarId ||
    (Number.isFinite(queryServiceCalendarId) && queryServiceCalendarId > 0
      ? queryServiceCalendarId
      : undefined) ||
    resolvedBookingData?.receivedServiceCalendarId ||
    qrCodeData.book?.receivedServiceCalendarId ||
    qrCodeData.serviceCalendarId;
  const isPairingMode = Boolean(resolvedBookingData); // true = Pairing mode, false = Walk-in mode

  const [isIndependentSample, setIsIndependentSample] = useState(false);

  const findMatchedFarmerFromQr = async (data: QrCodeInfo) => {
    const thaiNationalId = normalizeDigits(data.thaiNationalId);
    const phoneNumber = normalizeDigits(data.phoneNumber);

    const [idResult, phoneResult] = await Promise.all([
      thaiNationalId
        ? searchFarmers({ search: thaiNationalId, all: true })
        : Promise.resolve({ data: [] }),
      phoneNumber
        ? searchFarmers({ search: phoneNumber, all: true })
        : Promise.resolve({ data: [] }),
    ]);

    const idFarmers = Array.isArray(idResult?.data) ? idResult.data : [];
    const phoneFarmers = Array.isArray(phoneResult?.data)
      ? phoneResult.data
      : [];

    const idMatchedFarmer = getUniqueFarmer(
      idFarmers.filter(
        (farmer: FarmerInfo) =>
          normalizeDigits(farmer.thaiNationalId) === thaiNationalId
      )
    );
    const phoneMatchedFarmer = getUniqueFarmer(
      phoneFarmers.filter(
        (farmer: FarmerInfo) => normalizeDigits(farmer.phone) === phoneNumber
      )
    );

    if (
      idMatchedFarmer &&
      phoneMatchedFarmer &&
      idMatchedFarmer.farmerId !== phoneMatchedFarmer.farmerId
    ) {
      return null;
    }

    return idMatchedFarmer ?? phoneMatchedFarmer;
  };

  const syncBookFarmerFromQrIdentity = async (data: QrCodeInfo) => {
    const book = data.book;

    if (!book?.bookId || book.farmerId || book.farmer) {
      return data;
    }

    try {
      const matchedFarmer = await findMatchedFarmerFromQr(data);
      if (!matchedFarmer) {
        return data;
      }

      await settingOwnerData(book.bookId, {
        farmerId: matchedFarmer.farmerId,
      });

      return await getQrCodeByQrCode(String(qrCode));
    } catch (error) {
      console.warn('Cannot auto-link farmer from QR identity:', error);
      return data;
    }
  };

  const syncBookLandFromQrLandCode = async (data: QrCodeInfo) => {
    const book = data.book;
    const qrLandCode = normalizeLandCode(data.landCode);

    if (!book?.bookId || !book.farmerId || book.landId || !qrLandCode) {
      return data;
    }

    try {
      const farmer = await getFarmerById(book.farmerId);
      const matchedLand = farmer.lands?.find(
        (land: LandInfoInterface) =>
          normalizeLandCode(land.landCode) === qrLandCode
      );

      if (!matchedLand) {
        return data;
      }

      await settingOwnerData(book.bookId, {
        farmerId: book.farmerId,
        landId: matchedLand.landId,
        serviceTypeId: book.serviceTypeId ?? data.serviceTypeId ?? null,
        latitude:
          matchedLand.latitude !== undefined && matchedLand.latitude !== null
            ? String(matchedLand.latitude)
            : (book.latitude ?? null),
        longitude:
          matchedLand.longitude !== undefined && matchedLand.longitude !== null
            ? String(matchedLand.longitude)
            : (book.longitude ?? null),
      });

      return await getQrCodeByQrCode(String(qrCode));
    } catch (error) {
      console.warn('Cannot auto-link land from QR landCode:', error);
      return data;
    }
  };

  const fetchQrCode = async (isActive: () => boolean = () => true) => {
    try {
      setLoadiing(true);
      setLoadError(null);
      const loadedData = await getQrCodeByQrCode(String(qrCode));
      const syncedFarmerData = await syncBookFarmerFromQrIdentity(loadedData);
      const data = await syncBookLandFromQrLandCode(syncedFarmerData);
      if (!isActive()) return;
      setQrCodeData(data);

      // Check if land has valid coordinates
      if (data.book?.land?.latitude && data.book?.land?.longitude) {
        setLocation([
          {
            id: data.book.land.landId,
            lat: data.book.land.latitude,
            lng: data.book.land.longitude,
          },
        ]);
        setIsShowMap(true);
      }
      // Otherwise check if book has valid coordinates
      else if (data.book?.latitude && data.book?.longitude) {
        setLocation([
          {
            id: data.book.bookId || 0,
            lat: data.book.latitude,
            lng: data.book.longitude,
          },
        ]);
        setIsShowMap(true);
      }
      // No valid coordinates found
      else {
        setIsShowMap(false);
      }
    } catch (error) {
      if (!isActive()) return;
      console.error('Error loading QR code:', error);
      setLoadError('ไม่สามารถโหลดข้อมูลตัวอย่างได้ในขณะนี้');
      setIsShowMap(false);
    } finally {
      if (isActive()) setLoadiing(false);
    }
  };
  useEffect(() => {
    let cancelled = false;
    fetchQrCode(() => !cancelled);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode]);

  useEffect(() => {
    if (stateBookingData) {
      setResolvedBookingData(stateBookingData);
      return;
    }

    if (
      !effectiveServiceCalendarId ||
      !Number.isFinite(queryBookId) ||
      queryBookId <= 0
    ) {
      setResolvedBookingData(null);
      return;
    }

    const fetchBookingFromCalendar = async () => {
      try {
        const bookings = await getBookingsByCalendar(
          Number(effectiveServiceCalendarId)
        );
        const matchedBooking =
          bookings.find((book: Book) => book.bookId === queryBookId) ?? null;
        setResolvedBookingData(matchedBooking);
      } catch (error) {
        console.error('Error recovering booking data:', error);
        setResolvedBookingData(null);
      }
    };

    fetchBookingFromCalendar();
  }, [effectiveServiceCalendarId, queryBookId, stateBookingData]);

  const handleRecivedQrCode = async () => {
    try {
      if (
        !effectiveServiceCalendarId ||
        isNaN(Number(effectiveServiceCalendarId))
      ) {
        console.error(
          'serviceCalendarId ไม่ถูกต้อง:',
          effectiveServiceCalendarId
        );
        return; // หรือโชว์ alert ก็ได้
      }

      await receivedSampleByDecryptedCode(qrCodeData.qrCode, {
        serviceCalendarId: Number(effectiveServiceCalendarId),
      });

      swalSuccessTimer('สำเร็จ!', 'ยืนยันผลการวิเคราะห์ดิน').then(() => {
        navigate('/officer/sample-receiving');
      });
    } catch (error) {
      console.log(error);
      swalError('เกิดข้อผิดพลาด!', 'ไม่สามารถยืนยันผลการวิเคราะห์ดิน');
    }
  };

  // Handler สำหรับยืนยันการ Pair Booking กับ QR Code
  const handlePairConfirm = async () => {
    try {
      if (
        !resolvedBookingData ||
        !qrCodeData.qrCode ||
        !effectiveServiceCalendarId
      ) {
        swalError('ข้อผิดพลาด', 'ข้อมูลไม่ครบถ้วน');
        return;
      }

      // เรียก API โดยส่ง bookId ไปด้วย
      await receivedSampleByDecryptedCode(qrCodeData.qrCode, {
        serviceCalendarId: Number(effectiveServiceCalendarId),
        bookId: resolvedBookingData.bookId, // ส่ง bookId เพื่อ pair
      });

      swalSuccessTimer('สำเร็จ!', 'จับคู่ข้อมูลเรียบร้อยแล้ว').then(() => {
        navigate('/officer/sample-receiving');
      });
    } catch (error) {
      console.error(error);
      swalError('เกิดข้อผิดพลาด!', 'ไม่สามารถจับคู่ข้อมูลได้');
    }
  };

  const openCollectionWizard = () => {
    const step = !qrCodeData.book?.farmerId
      ? 2
      : !qrCodeData.book?.landId
        ? 3
        : 1;
    setWizardStartStep(step);
    setIsWizardOpen(true);
  };

  const handleSetupClick = () => {
    if (!qrCodeData.book?.farmerId || !qrCodeData.book?.landId) {
      openCollectionWizard();
      return;
    }

    setSearchModal(true);
  };

  let isDisabled = true;

  if (isPairingMode) {
    isDisabled = !resolvedBookingData || !qrCodeData.qrCode;
  } else if (isIndependentSample) {
    isDisabled = false;
  } else {
    const hasFarmer = qrCodeData.book?.farmerId;
    const hasLand = qrCodeData.book?.landId;
    const hasServiceType = qrCodeData.book?.serviceTypeId;
    isDisabled = !hasFarmer || !hasLand || !hasServiceType;
  }

  const renderTimeline = (status: SampleStatusEnum) => {
    const steps = [
      {
        label: 'กระจายรหัส QR',
        statuses: [
          SampleStatusEnum.DISTRIBUTED,
          SampleStatusEnum.COLLECTED,
          SampleStatusEnum.RECEIVED,
          SampleStatusEnum.ANALYZING,
          SampleStatusEnum.ANALYZED,
          SampleStatusEnum.APPROVED,
        ],
        icon: 'fas fa-qrcode',
      },
      {
        label: 'เก็บตัวอย่างดิน',
        statuses: [
          SampleStatusEnum.COLLECTED,
          SampleStatusEnum.RECEIVED,
          SampleStatusEnum.ANALYZING,
          SampleStatusEnum.ANALYZED,
          SampleStatusEnum.APPROVED,
        ],
        icon: 'fas fa-map-marker-alt',
      },
      {
        label: 'รับเข้าระบบ',
        statuses: [
          SampleStatusEnum.RECEIVED,
          SampleStatusEnum.ANALYZING,
          SampleStatusEnum.ANALYZED,
          SampleStatusEnum.APPROVED,
        ],
        icon: 'fas fa-check-circle',
      },
      {
        label: 'วิเคราะห์แล็บ',
        statuses: [
          SampleStatusEnum.ANALYZING,
          SampleStatusEnum.ANALYZED,
          SampleStatusEnum.APPROVED,
        ],
        icon: 'fas fa-vial',
      },
      {
        label: 'ออกรายงาน',
        statuses: [SampleStatusEnum.ANALYZED, SampleStatusEnum.APPROVED],
        icon: 'fas fa-file-invoice',
      },
    ];

    return (
      <div className="private-card mb-4">
        <div className="private-card-body py-4">
          <h5 className="fw-bold text-dark mb-4 text-center">
            <i className="fas fa-route me-2 text-primary" />
            สถานะขั้นตอนของตัวอย่างดิน
          </h5>
          <div className="flow">
            {steps.map((step, idx) => {
              const isDone =
                step.statuses.includes(status) && status !== step.statuses[0];
              const isNow =
                status === step.statuses[0] || (idx === 0 && !status);
              const stepClass = isDone
                ? 'flow-step done'
                : isNow
                  ? 'flow-step now'
                  : 'flow-step';

              return (
                <div key={idx} className={stepClass}>
                  <div className="flow-dot">
                    {isDone ? (
                      <i className="fas fa-check" />
                    ) : (
                      <i className={step.icon} style={{ fontSize: '10px' }} />
                    )}
                  </div>
                  <span className="flow-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="private-page-transition">
      {/* Page Header */}
      <div className="page-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-start align-items-sm-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-icon"
            onClick={() => navigate('/officer/sample-receiving')}
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            title="ย้อนกลับ"
          >
            <i className="fas fa-arrow-left" />
          </button>
          <div>
            <h1 className="h3 fw-bold text-dark mb-1">
              รายละเอียดตัวอย่าง {qrCodeData.qrCode || qrCode}
            </h1>
            <p className="text-muted mb-0">
              {isPairingMode
                ? 'โหมดจับคู่ข้อมูลการจองคิวก่อนลงระบบ'
                : qrCodeData.phoneNumber || qrCodeData.thaiNationalId
                  ? `รหัสตัวอย่าง: ${qrCodeData.book?.sampleCode || '-'}`
                  : 'ตัวอย่างอิสระ (ไม่ระบุตัวตน)'}
            </p>
          </div>
        </div>
        {!isPairingMode && (
          <button
            type="button"
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={handleSetupClick}
          >
            <i className="fas fa-cog" />
            ตั้งค่าและเชื่อมโยงข้อมูล
          </button>
        )}
      </div>

      {loadError && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="fas fa-exclamation-triangle me-2" />
          {loadError}
        </div>
      )}

      {!loading && (
        <>
          {/* Timeline Status Step */}
          {renderTimeline(qrCodeData.status)}

          {/* [PAIRING MODE] */}
          {isPairingMode ? (
            <>
              <div
                className="alert alert-warning border-0 shadow-sm mb-4"
                style={{ backgroundColor: '#fffbeb', color: '#854d0e' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <i className="fas fa-link fs-4 text-warning" />
                  <div>
                    <strong>โหมดจับคู่ข้อมูล:</strong>{' '}
                    กำลังเชื่อมโยงข้อมูลคิวจองล่วงหน้ากับถุงตัวอย่างดิน รหัส{' '}
                    <strong>{qrCodeData.qrCode}</strong>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                {/* Left side: Booking details */}
                <div className="col-lg-6">
                  <div className="private-card private-card-accent-primary h-100">
                    <div className="private-card-header bg-primary text-white py-3">
                      <h5 className="mb-0 text-white">
                        <i className="fas fa-clipboard-list me-2" />
                        ข้อมูลการจองและแปลงเกษตรกร
                      </h5>
                    </div>
                    <div className="private-card-body">
                      <div className="row g-3">
                        <InfoTable
                          title="เกษตรกร"
                          data={{
                            'ชื่อ-นามสกุล': `${resolvedBookingData?.farmer?.firstName || ''} ${resolvedBookingData?.farmer?.lastName || ''}`,
                            เบอร์โทรศัพท์:
                              resolvedBookingData?.farmer?.phone || '-',
                            เลขบัตรประชาชน: formatThaiNationalId(
                              resolvedBookingData?.farmer?.thaiNationalId || ''
                            ),
                          }}
                          loading={false}
                        />
                        <InfoTable
                          title="แปลง"
                          data={{
                            รหัสแปลง:
                              resolvedBookingData?.land?.landCode || '-',
                            ชื่อแปลง: resolvedBookingData?.land?.name || '-',
                          }}
                          loading={false}
                        />
                        <InfoTable
                          title="บริการ"
                          data={{
                            ประเภทบริการ:
                              resolvedBookingData?.serviceType?.name || '-',
                          }}
                          loading={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Scanned QR Info */}
                <div className="col-lg-6">
                  <div className="private-card private-card-accent-success h-100">
                    <div className="private-card-header bg-success text-white py-3">
                      <h5 className="mb-0 text-white">
                        <i className="fas fa-qrcode me-2" />
                        รายละเอียดรหัส QR ที่สแกน
                      </h5>
                    </div>
                    <div className="private-card-body">
                      <div className="row g-3">
                        <InfoTable
                          title="ข้อมูล QR"
                          data={{
                            'รหัส QR': qrCodeData.qrCode || '-',
                            สถานะ: qrCodeData.status || '-',
                            สร้างเมื่อ: TimeStampToDate(qrCodeData.createdAt),
                          }}
                          loading={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map coordinates */}
              {(() => {
                const lat =
                  resolvedBookingData?.land?.latitude ??
                  parseFloat(resolvedBookingData?.latitude ?? '');
                const lng =
                  resolvedBookingData?.land?.longitude ??
                  parseFloat(resolvedBookingData?.longitude ?? '');
                if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
                return (
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="private-card">
                        <div className="private-card-header">
                          <h5 className="mb-0 text-dark fw-bold">
                            <i className="fas fa-map-marked-alt me-2 text-primary" />
                            พิกัดแปลงปลูกจากข้อมูลการจอง
                          </h5>
                        </div>
                        <div className="private-card-body p-0">
                          <LeafletMap
                            markers={[
                              {
                                id: resolvedBookingData?.land?.landId ?? 0,
                                lat,
                                lng,
                                title:
                                  resolvedBookingData?.land?.name ?? 'แปลงปลูก',
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Confirm Pairing Action */}
              <div className="d-flex justify-content-center mt-4">
                <button
                  className="btn btn-lg btn-primary px-5 py-3 shadow-lg d-flex align-items-center gap-2 fw-bold"
                  disabled={isDisabled}
                  onClick={handlePairConfirm}
                >
                  <i className="fas fa-check" />
                  ยืนยันการจับคู่ข้อมูลคิวจอง
                </button>
              </div>
            </>
          ) : (
            /* [WALK-IN MODE] */
            <>
              {/* If Independent Sample Toggle */}
              {!qrCodeData.phoneNumber && !qrCodeData.thaiNationalId && (
                <div
                  className="private-card mb-4"
                  style={{ borderLeft: '4px solid #0aa2c0' }}
                >
                  <div className="private-card-body py-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fas fa-circle-info text-info" />
                      <div>
                        <span className="fw-bold text-dark">
                          ตัวอย่างอิสระ (Walk-in ด่วน)
                        </span>
                        <p className="text-muted small mb-0">
                          ทำเครื่องหมายหากไม่มีข้อมูลเกษตรกรและไม่ต้องการผูกประวัติชาวไร่
                        </p>
                      </div>
                    </div>
                    <div className="form-check form-switch fs-5">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="exampleIndependentCheckbox"
                        checked={isIndependentSample}
                        onChange={e => setIsIndependentSample(e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="row g-4">
                {/* Farmer Info */}
                <div className="col-md-4">
                  <div className="private-card h-100">
                    <div className="private-card-header d-flex align-items-center justify-content-between">
                      <h4 className="private-card-title mb-0">
                        <i className="fas fa-user me-2 text-primary" />
                        ข้อมูลเกษตรกร
                      </h4>
                      <div className="d-flex gap-1">
                        <GenButtonCircle
                          color={B_LIST.list.color}
                          icon={B_LIST.list.icon}
                          link="/admin/farmer"
                        />
                        {qrCodeData?.book?.farmerId ? (
                          <GenButtonCircle
                            color={B_LIST.edit.color}
                            icon={B_LIST.edit.icon}
                            link={`/admin/farmer/${qrCodeData?.book?.farmerId}/edit`}
                          />
                        ) : (
                          <GenButtonCircle
                            color={B_LIST.add.color}
                            icon={B_LIST.add.icon}
                            onClick={() => {
                              setWizardStartStep(2);
                              setIsWizardOpen(true);
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="private-card-body">
                      {loading ? (
                        <div className="text-center py-5">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          />
                        </div>
                      ) : !qrCodeData.book?.farmer ? (
                        <div className="text-center py-4 text-muted">
                          {qrCodeData.phoneNumber ? (
                            <div className="text-start">
                              <p className="fw-semibold text-danger mb-2">
                                ไม่พบข้อมูลเกษตรกรในระบบ:
                              </p>
                              <table className="table table-sm table-borderless mb-0 small">
                                <tbody>
                                  <tr>
                                    <th
                                      className="ps-0"
                                      style={{ width: '80px' }}
                                    >
                                      บัตรประชาชน
                                    </th>
                                    <td>
                                      {formatThaiNationalId(
                                        qrCodeData.thaiNationalId
                                      )}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th className="ps-0">ชื่อ-สกุล</th>
                                    <td>
                                      {qrCodeData.firstName}{' '}
                                      {qrCodeData.lastName}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th className="ps-0">เบอร์โทร</th>
                                    <td>{qrCodeData.phoneNumber}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div>
                              <i className="fas fa-user-slash fa-2x mb-2 opacity-50" />
                              <p className="mb-0">
                                ไม่มีข้อมูลเกษตรกรที่ผูกไว้
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <table
                          className="table table-sm table-borderless mb-0"
                          style={{ minHeight: '180px' }}
                        >
                          <tbody className="small">
                            <tr>
                              <th
                                className="ps-0 text-muted"
                                style={{ width: '90px' }}
                              >
                                หมายเลขบัตร
                              </th>
                              <td>
                                {formatThaiNationalId(
                                  qrCodeData?.book?.farmer?.thaiNationalId ?? ''
                                )}
                              </td>
                            </tr>
                            <tr>
                              <th className="ps-0 text-muted">ชื่อ-นามสกุล</th>
                              <td className="fw-bold">
                                {qrCodeData?.book?.farmer?.firstName}{' '}
                                {qrCodeData?.book?.farmer?.lastName}
                              </td>
                            </tr>
                            <tr>
                              <th className="ps-0 text-muted">เบอร์โทรศัพท์</th>
                              <td>{qrCodeData?.book?.farmer?.phone || '-'}</td>
                            </tr>
                            <tr>
                              <th className="ps-0 text-muted">โรงงาน</th>
                              <td>
                                {qrCodeData.book?.farmer?.factory?.name || '-'}{' '}
                                (
                                {qrCodeData.book?.farmer?.factory?.initial ||
                                  '-'}
                                )
                              </td>
                            </tr>
                            <tr>
                              <th className="ps-0 text-muted">เขตพื้นที่</th>
                              <td>
                                เขต{' '}
                                {qrCodeData.book?.farmer?.serviceArea.code ||
                                  '-'}{' '}
                                {qrCodeData.book?.farmer?.serviceArea.name ||
                                  '-'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plot Info */}
                <div className="col-md-4">
                  <div className="private-card h-100">
                    <div className="private-card-header d-flex align-items-center justify-content-between">
                      <h4 className="private-card-title mb-0">
                        <i className="fas fa-map-pin me-2 text-primary" />
                        ข้อมูลแปลงปลูก
                      </h4>
                      <div className="d-flex gap-1">
                        <GenButtonCircle
                          color={B_LIST.list.color}
                          icon={B_LIST.list.icon}
                          link="/admin/land"
                        />
                        {qrCodeData?.book?.landId ? (
                          <GenButtonCircle
                            color={B_LIST.edit.color}
                            icon={B_LIST.edit.icon}
                            link={`/admin/land/${qrCodeData?.book?.landId}/edit`}
                          />
                        ) : (
                          <GenButtonCircle
                            color={B_LIST.add.color}
                            icon={B_LIST.add.icon}
                            onClick={() => {
                              const step = qrCodeData.book?.farmerId ? 3 : 2;
                              setWizardStartStep(step);
                              setIsWizardOpen(true);
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="private-card-body">
                      {loading ? (
                        <div className="text-center py-5">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          />
                        </div>
                      ) : !qrCodeData.book?.land ? (
                        <div className="text-center py-4 text-muted">
                          {qrCodeData.landCode ? (
                            <div className="text-start">
                              <p className="fw-semibold text-danger mb-2">
                                ไม่พบข้อมูลแปลงในระบบ:
                              </p>
                              <table className="table table-sm table-borderless mb-0 small">
                                <tbody>
                                  <tr>
                                    <th
                                      className="ps-0"
                                      style={{ width: '80px' }}
                                    >
                                      รหัสแปลง
                                    </th>
                                    <td>{qrCodeData.landCode}</td>
                                  </tr>
                                  <tr>
                                    <th className="ps-0">ชื่อแปลง</th>
                                    <td>{qrCodeData.landName}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div>
                              <i className="fas fa-map-marked fa-2x mb-2 opacity-50" />
                              <p className="mb-0">
                                ไม่มีข้อมูลแปลงปลูกที่ผูกไว้
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <table
                          className="table table-sm table-borderless mb-0"
                          style={{ minHeight: '180px' }}
                        >
                          <tbody className="small">
                            <tr>
                              <th
                                className="ps-0 text-muted"
                                style={{ width: '90px' }}
                              >
                                รหัสโควต้าอ้อย
                              </th>
                              <td>
                                {qrCodeData?.book?.land?.quotaCode ?? '-'}
                              </td>
                            </tr>
                            <tr>
                              <th className="ps-0 text-muted">หมายเลขแปลง</th>
                              <td className="fw-bold">
                                {qrCodeData?.book?.land?.landCode}
                              </td>
                            </tr>
                            <tr>
                              <th className="ps-0 text-muted">ชื่อแปลง</th>
                              <td>{qrCodeData?.book?.land?.name || '-'}</td>
                            </tr>
                            <tr>
                              <th className="ps-0 text-muted">พิกัดแปลง</th>
                              <td>
                                {qrCodeData.book?.latitude
                                  ? `${qrCodeData.book.latitude}, ${qrCodeData.book.longitude}`
                                  : '-'}
                              </td>
                            </tr>
                            <tr>
                              <th className="ps-0 text-muted">พื้นที่</th>
                              <td>
                                {qrCodeData.book?.land?.areaSize
                                  ? `${qrCodeData.book.land.areaSize} ไร่`
                                  : '-'}
                              </td>
                            </tr>
                            <tr>
                              <th className="ps-0 text-muted">ที่อยู่แปลง</th>
                              <td
                                style={{
                                  fontSize: '0.75rem',
                                  lineHeight: '1.2',
                                }}
                              >
                                {qrCodeData.book?.land?.village} ต.
                                {qrCodeData.book?.land?.subdistrict?.nameTh} อ.
                                {
                                  qrCodeData.book?.land?.subdistrict?.district
                                    ?.nameTh
                                }{' '}
                                จ.
                                {
                                  qrCodeData.book?.land?.subdistrict?.district
                                    ?.province?.nameTh
                                }{' '}
                                {qrCodeData.book?.land?.zipCode}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plot Map & Actions */}
                <div className="col-md-4">
                  <div className="private-card h-100">
                    <div className="private-card-header">
                      <h4 className="private-card-title mb-0">
                        <i className="fas fa-map-marked-alt me-2 text-primary" />
                        แผนที่แปลง
                      </h4>
                    </div>
                    <div
                      className="private-card-body p-0 d-flex flex-column justify-content-between"
                      style={{ minHeight: '260px' }}
                    >
                      <div
                        className="flex-grow-1"
                        style={{ height: '180px', overflow: 'hidden' }}
                      >
                        {loading ? (
                          <div className="text-center py-5">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            />
                          </div>
                        ) : isShowMap ? (
                          <LeafletMap markers={location} />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                            ไม่พบข้อมูลพิกัดแปลงปลูก
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-light border-top">
                        <button
                          type="button"
                          className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold"
                          disabled={isDisabled}
                          onClick={handleRecivedQrCode}
                        >
                          <i className="fas fa-check-circle" />
                          ยืนยันรับเข้าห้องแล็บ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Info Tables */}
              <div className="row g-4 mt-1">
                <InfoTable
                  title="ข้อมูลการจองและการเก็บดิน"
                  data={{
                    'รหัส QR code จอง': qrCodeData.qrCode,
                    'วัน-เวลา ดำเนินการจอง': TimeStampToDate(
                      qrCodeData.book?.bookedAt
                    ),
                    'วัน-เวลา เก็บดิน': TimeStampToDate(
                      qrCodeData.book?.collectSampleAt
                    ),
                  }}
                  loading={loading}
                />
                <InfoTable
                  title="การรับบริการ"
                  data={{
                    รหัสตัวอย่าง: qrCodeData.book?.sampleCode || '-',
                    'วัน-เวลา ส่งดินวิเคราะห์': TimeStampToDate(
                      qrCodeData.book?.sampleReceivedAt
                    ),
                    ประเภทการรับบริการ:
                      qrCodeData.book?.serviceType?.name ||
                      resolvedBookingData?.serviceType?.name ||
                      '-',
                    ห้องปฏิบัติการ:
                      qrCodeData?.result
                        ?.map(
                          res => res.laboratorySetting.laboratory.shortNameAfter
                        )
                        .join(', ') || '-',
                  }}
                  loading={loading}
                />
              </div>
            </>
          )}
        </>
      )}

      {searchModal && (
        <SearchModal
          onClose={() => {
            setSearchModal(false);
          }}
          onSubmit={() => {
            setSearchModal(false);
            fetchQrCode();
          }}
          qrCodeData={qrCodeData}
        />
      )}

      {isWizardOpen && (
        <CollectionWizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onSuccess={() => {
            setIsWizardOpen(false);
            fetchQrCode();
          }}
          qrCodeData={qrCodeData}
          startStep={wizardStartStep}
        />
      )}
    </div>
  );
};

export default SampleReceivingInfo;
