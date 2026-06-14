import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';

import '../../../../public/assets/css/table.css';
import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import { SampleReceivingInfoSummaryCard } from '@/components/pages/collect-exam/SampleReceivingSummaryCard';
import SearchModal from '@/components/pages/collect-exam/SearchModal';
import {
  getQrCodeByQrCode,
  receivedSampleByDecryptedCode,
} from '@/services/api/qr-code/QrCodeApi';
import { QrCodeInfo } from '@/types/qr-code/QrCode';
import { TimeStampToDate } from '@/utils/Date';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';

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
      <div className="card">
        <div className="card-header">
          <div className="row row-demo-grid">
            <div className="col-md-8 col-sm-8 col-8 text-start">
              <h4 className="card-title">{title}</h4>
            </div>
          </div>
        </div>
        <div className="card-body">
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
  const [qrCodeData, setQrCodeData] = useState<QrCodeInfo>({} as QrCodeInfo);
  const [searchModal, setSearchModal] = useState(false);
  const [isShowMap, setIsShowMap] = useState(false);
  const locationId = useLocation();
  const { serviceCalendarId, bookingData } = locationId.state || {};
  const isPairingMode = Boolean(bookingData); // true = Pairing mode, false = Walk-in mode

  const [isIndependentSample, setIsIndependentSample] = useState(false);

  console.log('qr - code', qrCodeData);
  console.log('booking data', bookingData);
  console.log('isPairingMode', isPairingMode);
  const fetchQrCode = async () => {
    setLoadiing(true);
    const data = await getQrCodeByQrCode(String(qrCode));
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

    setLoadiing(false);
    console.log('loading success');
  };
  useEffect(() => {
    fetchQrCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode]);

  const handleRecivedQrCode = async () => {
    try {
      if (!serviceCalendarId || isNaN(Number(serviceCalendarId))) {
        console.error('serviceCalendarId ไม่ถูกต้อง:', serviceCalendarId);
        return; // หรือโชว์ alert ก็ได้
      }

      const response = await receivedSampleByDecryptedCode(qrCodeData.qrCode, {
        serviceCalendarId: Number(serviceCalendarId),
      });

      console.log('response: ', response);

      Swal.fire({
        title: 'สำเร็จ!',
        text: 'ยืนยันผลการวิเคราะห์ดิน',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate('/officer/sample-receiving');
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถยืนยันผลการวิเคราะห์ดิน',
        icon: 'error',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
    }
  };

  // Handler สำหรับยืนยันการ Pair Booking กับ QR Code
  const handlePairConfirm = async () => {
    try {
      if (!bookingData || !qrCodeData.qrCode || !serviceCalendarId) {
        Swal.fire('ข้อผิดพลาด', 'ข้อมูลไม่ครบถ้วน', 'error');
        return;
      }

      // เรียก API โดยส่ง bookId ไปด้วย
      const response = await receivedSampleByDecryptedCode(qrCodeData.qrCode, {
        serviceCalendarId: Number(serviceCalendarId),
        bookId: bookingData.bookId,  // ส่ง bookId เพื่อ pair
      });

      console.log('Pair response:', response);

      Swal.fire({
        title: 'สำเร็จ!',
        text: 'จับคู่ข้อมูลเรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate('/officer/sample-receiving');
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถจับคู่ข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  let isDisabled = true;

  if (isPairingMode) {
    // Pairing mode: ต้องมี bookingData และ qrCode
    isDisabled = !bookingData || !qrCodeData.qrCode;
  } else if (isIndependentSample) {
    isDisabled = false;
  } else {
    // Walk-in mode: validation เดิม
    const hasFarmer = qrCodeData.book?.farmerId;
    const hasLand = qrCodeData.book?.landId;
    const hasServiceType = qrCodeData.book?.serviceTypeId;
    isDisabled = !hasFarmer || !hasLand || !hasServiceType;
  }

  console.log(isIndependentSample);

  return (
    <>
      {/* Cards Section */}
      <SampleReceivingInfoSummaryCard />

      {!loading && (
        <>
          {/* [PAIRING MODE] กรณีรับงานจาก Booking */}
          {isPairingMode ? (
            <>
              <div className="alert alert-warning border-warning">
                <div className="d-flex align-items-center">
                  <i className="fas fa-link me-3 fs-4"></i>
                  <div>
                    <strong>โหมดจับคู่ข้อมูล:</strong> กำลังเชื่อมข้อมูลการจองกับ QR Code ที่สแกน
                  </div>
                </div>
              </div>

              <div className="row mt-4">
                {/* ฝั่งซ้าย: ข้อมูลจาก Booking */}
                <div className="col-md-6">
                  <div className="card border-primary shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">
                        <i className="fas fa-clipboard-list me-2"></i>
                        ข้อมูลการจอง
                      </h5>
                    </div>
                    <div className="card-body">
                      <InfoTable
                        title="เกษตรกร"
                        data={{
                          'ชื่อ-นามสกุล': `${bookingData.farmer?.firstName || ''} ${bookingData.farmer?.lastName || ''}`,
                          'เบอร์โทรศัพท์': bookingData.farmer?.phone || '-',
                          'เลขบัตรประชาชน': formatThaiNationalId(bookingData.farmer?.thaiNationalId || '')
                        }}
                        loading={false}
                      />
                      <InfoTable
                        title="แปลง"
                        data={{
                          'รหัสแปลง': bookingData.land?.landCode || '-',
                          'ชื่อแปลง': bookingData.land?.name || '-'
                        }}
                        loading={false}
                      />
                      <InfoTable
                        title="บริการ"
                        data={{
                          'ประเภทบริการ': bookingData.serviceType?.name || '-'
                        }}
                        loading={false}
                      />
                    </div>
                  </div>
                </div>

                {/* ฝั่งขวา: QR Code ที่สแกน */}
                <div className="col-md-6">
                  <div className="card border-success shadow-sm">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0">
                        <i className="fas fa-qrcode me-2"></i>
                        QR Code ที่สแกน
                      </h5>
                    </div>
                    <div className="card-body">
                      <InfoTable
                        title="ข้อมูล QR"
                        data={{
                          'รหัส QR': qrCodeData.qrCode || '-',
                          'สถานะ': qrCodeData.status || '-',
                          'สร้างเมื่อ': TimeStampToDate(qrCodeData.createdAt)
                        }}
                        loading={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ปุ่มยืนยันการ Pair */}
              <div className="d-flex justify-content-center mt-4">
                <button
                  className="btn btn-lg btn-primary px-5"
                  disabled={isDisabled}
                  onClick={handlePairConfirm}
                >
                  <i className="fas fa-check me-2"></i>
                  ยืนยันการจับคู่ข้อมูล
                </button>
              </div>
            </>
          ) : (
            /* [WALK-IN MODE] กรณีรับงานปกติ */
            <>
              <div className="d-flex">
                <h2 className="fw-bold mb-3">QR Code {qrCodeData.qrCode}</h2>
                <span>
                  <GenButtonCircle
                    color={B_LIST.info.color}
                    icon="fas fa-cog"
                    className="ms-2 mt-1"
                    onClick={() => setSearchModal(true)}
                  />
                </span>
              </div>
              {qrCodeData.phoneNumber || qrCodeData.thaiNationalId ? (
                <h2 className="fw-bold mb-3">
                  รหัสตัวอย่าง {qrCodeData.book?.sampleCode || '-'}
                </h2>
              ) : (
                <div className="d-flex flex-column mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <h2 className="mb-0">ตัวอย่างอิสระ</h2>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="exampleIndependentCheckbox"
                        checked={isIndependentSample}
                        onChange={e => setIsIndependentSample(e.target.checked)}
                      />
                    </div>
                  </div>
                  {!qrCodeData.book?.serviceTypeId && !isDisabled ? (
                    <h6 className="text-muted mt-1 ms-2">
                      กรุณาตั้งค่าประเภทการให้บริการ
                    </h6>
                  ) : (
                    ''
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {searchModal && (
        <SearchModal
          onClose={() => {
            setSearchModal(false); // ปิด modal เฉยๆ
          }}
          onSubmit={() => {
            setSearchModal(false); // ปิด modal แล้ว fetch ข้อมูลใหม่
            fetchQrCode();
          }}
          qrCodeData={qrCodeData}
        />
      )}

      {/* OLD UI - Show only in Walk-in mode */}
      {!isPairingMode && (
        <>
          <div className="row">
            {/* Farmer Info */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <div className="row row-demo-grid">
                    <div
                      className="col-md-8 col-sm-8 col-8"
                      style={{ textAlign: 'left' }}
                    >
                      <h4 className="card-title">
                        ข้อมูลเกษตรกร{' '}
                        {qrCodeData?.book?.farmer?.phone
                          ? '(' + qrCodeData?.book?.farmer?.phone + ')'
                          : ''}
                      </h4>
                    </div>
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
                          onClick={() =>
                            navigate(`/admin/farmer/add`, {
                              state: {
                                thaiNationalId: qrCodeData.thaiNationalId,
                                firstName: qrCodeData.firstName,
                                lastName: qrCodeData.lastName,
                                phoneNumber: qrCodeData.phoneNumber,
                                serviceAreaId: qrCodeData.serviceAreaId,
                              },
                            })
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="col-md-12 ms-auto me-auto">
                    <div className="row p-4">
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
                        <table style={{ minHeight: '205px' }}>
                          <tbody>
                            {!qrCodeData.book?.farmer ? (
                              <div className="space-y-4">
                                {qrCodeData.phoneNumber ? (
                                  <>
                                    <p>ไม่พบข้อมูลเกษตรกรที่ตรงกับ:</p>
                                    <tr>
                                      <th>หมายเลขบัตรประชาชน:</th>
                                      <td>
                                        {formatThaiNationalId(
                                          qrCodeData.thaiNationalId
                                        )}
                                      </td>
                                    </tr>
                                    <tr>
                                      <th>ชื่อ นามสกุล:</th>
                                      <td>
                                        {qrCodeData.firstName}{' '}
                                        {qrCodeData.lastName}
                                      </td>
                                    </tr>
                                    <tr>
                                      <th>โทรศัพท์:</th>
                                      <td>{qrCodeData.phoneNumber}</td>
                                    </tr>
                                  </>
                                ) : (
                                  <div>ไม่พบข้อมูลเกษตรกร</div>
                                )}
                              </div>
                            ) : (
                              <>
                                <tr>
                                  <th>ประเภทบัตร</th>
                                  <td>บัตรประชาชน</td>
                                </tr>
                                <tr>
                                  <th>หมายเลขบัตร</th>
                                  <td>
                                    {formatThaiNationalId(
                                      qrCodeData?.book?.farmer?.thaiNationalId ??
                                      ''
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <th>ชื่อ นามสกุล</th>
                                  <td>
                                    {qrCodeData?.book?.farmer?.firstName}{' '}
                                    {qrCodeData?.book?.farmer?.lastName}
                                  </td>
                                </tr>
                                <tr>
                                  <td colSpan={2}>&nbsp;</td>
                                </tr>
                                <tr>
                                  <th>โทรศัพท์</th>
                                  <td>{qrCodeData?.book?.farmer?.phone}</td>
                                </tr>
                                <tr>
                                  <td colSpan={2}>&nbsp;</td>
                                </tr>
                                <tr>
                                  <th>โรงงาน</th>
                                  <td>
                                    {qrCodeData.book?.farmer?.factory?.name} (
                                    {qrCodeData.book?.farmer?.factory?.initial})
                                  </td>
                                </tr>
                                <tr>
                                  <th>เขตพื้นที่</th>
                                  <td>
                                    เขต{' '}
                                    {qrCodeData.book?.farmer?.serviceArea.code}{' '}
                                    {qrCodeData.book?.farmer?.serviceArea.name}
                                  </td>
                                </tr>
                                <tr>
                                  <td colSpan={2}>&nbsp;</td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plot Info */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <div className="row row-demo-grid">
                    <div
                      className="col-md-8 col-sm-8 col-8"
                      style={{ textAlign: 'left' }}
                    >
                      <h4 className="card-title">
                        ข้อมูลแปลง{' '}
                        {qrCodeData?.book?.land?.name
                          ? '(' + qrCodeData?.book?.land?.name + ')'
                          : ''}
                      </h4>
                    </div>
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
                          onClick={() =>
                            navigate(`/admin/land/add`, {
                              state: {
                                farmerId: qrCodeData.book?.farmerId,
                                landCode: qrCodeData.landCode,
                                landName: qrCodeData.landName,
                                latitude: qrCodeData.book?.latitude,
                                longitude: qrCodeData.book?.longitude,
                              },
                            })
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="col-md-12 ms-auto me-auto">
                    <div className="row p-4">
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
                        <table style={{ minHeight: '205px' }}>
                          <tbody>
                            {!qrCodeData.book?.land ? (
                              <div className="space-y-4">
                                {qrCodeData.landCode ? (
                                  <>
                                    <p>ไม่พบข้อมูลแปลงสำหรับ:</p>
                                    <tr>
                                      <th>หมายเลขแปลง: </th>
                                      <td>{qrCodeData.landCode}</td>
                                    </tr>
                                    <tr>
                                      <th>ชื่อแปลง: </th>
                                      <td>{qrCodeData.landName}</td>
                                    </tr>
                                  </>
                                ) : (
                                  <div>ไม่พบข้อมูลแปลง</div>
                                )}
                              </div>
                            ) : (
                              <>
                                <tr>
                                  <th>รหัสโควต้าอ้อย</th>
                                  <td>
                                    {qrCodeData?.book?.land?.quotaCode ?? '-'}
                                  </td>
                                </tr>
                                <tr>
                                  <th>หมายเลขแปลง</th>
                                  <td>{qrCodeData?.book?.land?.landCode}</td>
                                </tr>
                                <tr>
                                  <th>ชื่อแปลง</th>
                                  <td>{qrCodeData?.book?.land?.name}</td>
                                </tr>
                                <tr>
                                  <td colSpan={2}>&nbsp;</td>
                                </tr>
                                <tr>
                                  <th>พิกัด</th>
                                  <td>
                                    {qrCodeData.book?.latitude
                                      ? `${qrCodeData?.book?.latitude},
                                  ${qrCodeData?.book?.longitude}`
                                      : '-'}
                                  </td>
                                </tr>
                                <tr>
                                  <td colSpan={2}>&nbsp;</td>
                                </tr>
                                <tr>
                                  <th>อำเภอ</th>
                                  <td>
                                    {
                                      qrCodeData.book?.land?.subdistrict?.district
                                        ?.nameTh
                                    }
                                  </td>
                                </tr>
                                <tr>
                                  <th>จังหวัด</th>
                                  <td>
                                    {
                                      qrCodeData.book?.land?.subdistrict?.district
                                        ?.province?.nameTh
                                    }
                                  </td>
                                </tr>
                                <tr>
                                  <th>ที่อยู่</th>
                                  <td>
                                    {qrCodeData.book?.land?.village} ต.
                                    {
                                      qrCodeData.book?.land?.subdistrict?.nameTh
                                    }{' '}
                                    อ.
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
                                <tr>
                                  <td colSpan={2}>&nbsp;</td>
                                </tr>
                                <tr>
                                  <th>พื้นที่</th>
                                  <td>{qrCodeData.book?.land?.areaSize} ไร่</td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plot Coordinates */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">พิกัดแปลง</div>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center p-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : isShowMap ? (
                    <LeafletMap markers={location} />
                  ) : (
                    <div>ไม่พบข้อมูลพิกัดแปลง</div>
                  )}
                </div>
              </div>

              {/* Confirmation Button */}
              <div
                className="d-flex justify-content-center mt-3"
                style={isDisabled ? { cursor: 'not-allowed' } : {}}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isDisabled}
                  onClick={handleRecivedQrCode}
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <InfoTable
              title="การจองและการเก็บดิน"
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
                // รถวิเคราะห์: qrCodeData.analysisCarCode,
                ประเภทการรับบริการ: qrCodeData.book?.serviceType?.name || bookingData?.serviceType?.name || '-',
                ทดสอบ:
                  qrCodeData?.result
                    ?.map(res => res.laboratorySetting.laboratory.shortNameAfter)
                    .join(', ') || '-',
              }}
              loading={loading}
            />
          </div>
        </>
      )}
    </>
  );
};

export default SampleReceivingInfo;
