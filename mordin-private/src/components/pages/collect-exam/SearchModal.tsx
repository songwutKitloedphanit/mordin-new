import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { GenFormSelect } from '@/components/gui/GuiForm';
import {
  createFarmer,
  getFarmerById,
  searchFarmers,
} from '@/services/api/FarmerApi';
import { settingOwnerData } from '@/services/api/qr-code/BookApi';
import { getServiceAreaById } from '@/services/api/service-area/ServiceAreaApi';
import {
  getAllServiceTypes,
  getServiceTypeById,
} from '@/services/api/service-type/ServiceTypeApi';
import { FarmerInfo, FarmerSearch } from '@/types/Farmer';
import { LandInfoInterface } from '@/types/Land';
import {
  CollectExamInput,
  CollectSampleInput,
} from '@/types/qr-code/CollectSample';
import { QrCodeInfo } from '@/types/qr-code/QrCode';
import { ServiceTypeInfo } from '@/types/service-type/ServiceTypes';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';

type SearchModalProps = {
  qrCodeData: QrCodeInfo;
  onClose: () => void;
  onSubmit: () => void;
  initialSearch?: string;
};

const SearchModal: React.FC<SearchModalProps> = ({
  qrCodeData,
  onClose,
  onSubmit,
  initialSearch,
}) => {
  const [creatingFarmer, setCreatingFarmer] = useState(false);

  const handleCreateFromQR = async () => {
    setCreatingFarmer(true);
    try {
      const serviceAreaId =
        qrCodeData.book?.serviceAreaId ??
        qrCodeData.serviceArea?.serviceAreaId ??
        0;
      const serviceArea = await getServiceAreaById(serviceAreaId);

      const newFarmer = await createFarmer({
        firstName: qrCodeData.firstName || '',
        lastName: qrCodeData.lastName || '',
        phone: qrCodeData.phoneNumber?.replace(/\D/g, '') || '',
        thaiNationalId: qrCodeData.thaiNationalId?.replace(/\D/g, ''),
        serviceAreaId,
        factoryId: serviceArea.factoryId,
      });

      // Persist farmerId to book immediately
      const bookId = qrCodeData.book?.bookId;
      if (bookId) {
        await settingOwnerData(bookId, { farmerId: newFarmer.farmerId });
        // Farmer linked — close modal and refresh parent data
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'สร้างและเชื่อมข้อมูลเกษตรกรเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => onSubmit());
        return;
      }

      // bookId not available — let officer pick manually
      setSelectedFarmer(newFarmer);
      const farmerData = await getFarmerById(newFarmer.farmerId);
      setLands(farmerData.lands);
      setLandOptions(
        farmerData.lands?.length > 0
          ? [
              { value: 0, name: '-- กรุณาเลือกแปลง --' },
              ...farmerData.lands.map((l: LandInfoInterface) => ({
                value: l.landId,
                name: l.name,
              })),
            ]
          : []
      );
      setCollectExamInput(prev => ({ ...prev, farmerId: newFarmer.farmerId }));
    } catch (_err: unknown) {
      console.error('handleCreateFromQR error');
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างข้อมูลได้', 'error');
    } finally {
      setCreatingFarmer(false);
    }
  };
  const [searchText, setSearchText] = useState<FarmerSearch>(
    initialSearch ? { search: initialSearch } : ({} as FarmerSearch)
  );

  const [selectedLand, setSelectedLand] = useState<LandInfoInterface | null>(
    null
  );
  const [lands, setLands] = useState<LandInfoInterface[]>([]);
  const [landOptions, setLandOptions] = useState<
    { value: number; name: string }[]
  >([]);
  const [farmers, setFarmers] = useState<FarmerInfo[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerInfo | null>(null);

  const [selectedServiceTypes, setSelectedServiceTypes] =
    useState<ServiceTypeInfo | null>(null);
  const [serviceTypeOptions, setServiceTypeOptions] = useState<
    { value: number; name: string }[]
  >([]);

  const [collectExamInput, setCollectExamInput] = useState<CollectExamInput>(
    {} as CollectSampleInput
  );

  useEffect(() => {
    const SearchFarmer = async () => {
      const results = await searchFarmers(searchText);
      setFarmers(results.data);
    };

    SearchFarmer();
  }, [searchText]);

  const fetchFarmerAndSetLand = async (farmerId: number) => {
    const data = await getFarmerById(farmerId);
    setLands(data.lands);
    if (!selectedFarmer) {
      setSelectedFarmer(data);
    }
    if (data.lands?.length > 0) {
      setLandOptions([
        { value: 0, name: '-- กรุณาเลือกแปลง --' },
        ...data.lands.map((land: LandInfoInterface) => ({
          value: land.landId,
          name: land.name,
        })),
      ]);
    } else {
      setLandOptions([]);
    }
  };

  const fetchAndSetServiceType = async () => {
    const data = await getAllServiceTypes();
    setServiceTypeOptions([
      { value: 0, name: '-- กรุณาเลือกประเภทการให้บริการ --' },
      ...data.map((type: ServiceTypeInfo) => ({
        value: type.serviceTypeId,
        name: type.name,
      })),
    ]);
  };

  const handleSelectFarmer = (farmer: FarmerInfo) => {
    setSelectedLand(null);
    setSelectedFarmer(farmer);
    fetchFarmerAndSetLand(farmer.farmerId);
    setCollectExamInput(prev => ({
      ...prev,
      farmerId: farmer.farmerId,
    }));
  };

  const handleSelectLand = (landId: number) => {
    const land = lands.find(land => land.landId === landId);

    if (land) {
      setSelectedLand(land);
      setCollectExamInput(prev => ({
        ...prev,
        landId: landId,
        latitude: land?.latitude?.toString(),
        longitude: land?.longitude?.toString(),
      }));
    } else {
      setSelectedLand(null);
    }
  };

  const handleSelectServiceType = async (serviceTypeId: number) => {
    if (serviceTypeId) {
      const data = await getServiceTypeById(serviceTypeId);

      setCollectExamInput(prev => ({
        ...prev,
        serviceTypeId: data.serviceTypeId,
      }));

      if (data) {
        setSelectedServiceTypes(data);
      } else {
        console.warn('ไม่พบ serviceType ที่เลือก');
        setSelectedServiceTypes(null);
      }
    } else {
      setSelectedServiceTypes(null);
      setCollectExamInput(prev => ({
        ...prev,
        serviceTypeId: null,
      }));
    }
  };

  useEffect(() => {
    setCollectExamInput({
      farmerId: qrCodeData?.book?.farmerId,
      landId: qrCodeData?.book?.landId,
      latitude: qrCodeData?.book?.land?.latitude?.toString(),
      longitude: qrCodeData?.book?.land?.longitude?.toString(),
      serviceTypeId: qrCodeData?.book?.serviceTypeId,
    });

    fetchFarmerAndSetLand(Number(qrCodeData?.book?.farmerId));
    fetchAndSetServiceType();

    if (qrCodeData?.book?.serviceTypeId) {
      handleSelectServiceType(qrCodeData.book.serviceTypeId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCodeData]);

  useEffect(() => {
    if (lands?.length > 0 && qrCodeData?.book?.landId) {
      handleSelectLand(Number(qrCodeData.book.landId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lands, qrCodeData]);

  const handleUnSelect = () => {
    setSelectedFarmer(null);
    setSelectedLand(null);
    setCollectExamInput(prev => ({
      ...prev,
      farmerId: null,
      landId: null,
    }));
    setLandOptions([]);
  };

  const handleConfirm = async () => {
    try {
      Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const bookId = qrCodeData?.book?.bookId;
      const effectiveFarmerId =
        collectExamInput.farmerId ?? selectedFarmer?.farmerId ?? null;
      const effectiveInput = {
        ...collectExamInput,
        farmerId: effectiveFarmerId,
      };

      if (!bookId) {
        Swal.close();
        Swal.fire('ข้อผิดพลาด', 'ไม่พบรหัส Book กรุณารีเฟรชหน้า', 'error');
        return;
      }

      if (!effectiveFarmerId) {
        Swal.close();
        Swal.fire(
          'กรุณาเลือกเกษตรกร',
          'กรุณาค้นหาและเลือกเกษตรกร หรือกดปุ่ม "สร้างเกษตรกรจากข้อมูล QR"',
          'warning'
        );
        return;
      }

      await settingOwnerData(bookId, effectiveInput);

      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'เพิ่มข้อมูลเกษตรกรสำเร็จ',
        timer: 2000,
        confirmButtonText: 'ตกลง',
      }).then(() => {
        onSubmit();
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถเพิ่มข้อมูลเกษตรกรได้',
        confirmButtonText: 'ตกลง',
      }).then(() => {
        onClose();
      });
    }
  };

  return (
    <div
      className="modal fade show"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">ค้นหารายการ</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div
            className="modal-body d-flex gap-4"
            style={{ height: '700px', overflowY: 'auto' }}
          >
            {/* ฝั่งซ้าย ตาราง */}
            <div className="w-50">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="พิมพ์เพื่อค้นหา..."
                value={searchText.search}
                onChange={e => {
                  const val = e.target.value;
                  setSearchText(prev => ({
                    ...prev,
                    search: val,
                  }));
                }}
              />
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>เลือก</th>
                      <th>เลขบัตร</th>
                      <th>ชื่อ-นามสกุล</th>
                      <th>โทรศัพท์</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFarmer ? (
                      <tr
                        key={selectedFarmer.farmerId}
                        onClick={handleUnSelect}
                        style={{
                          backgroundColor: '#e0f7fa',
                          cursor: 'pointer',
                        }}
                      >
                        <td>
                          <GenButtonCircle
                            color={B_LIST.del.color}
                            icon="fa-solid fa-minus"
                          />
                        </td>
                        <td>
                          {formatThaiNationalId(
                            selectedFarmer.thaiNationalId ?? ''
                          )}
                        </td>
                        <td>
                          {selectedFarmer.firstName} {selectedFarmer.lastName}
                        </td>
                        <td>{selectedFarmer.phone}</td>
                      </tr>
                    ) : farmers.length > 0 ? (
                      farmers.map(farmer => (
                        <tr
                          key={farmer.farmerId}
                          onClick={() => handleSelectFarmer(farmer)}
                          style={{
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          <td>
                            <GenButtonCircle
                              color={B_LIST.add.color}
                              icon="fa-solid fa-plus"
                            />
                          </td>
                          <td>
                            {formatThaiNationalId(farmer.thaiNationalId ?? '')}
                          </td>
                          <td>
                            {farmer.firstName} {farmer.lastName}
                          </td>
                          <td>{farmer.phone}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-3 text-muted">
                          {qrCodeData.thaiNationalId ||
                          qrCodeData.phoneNumber ? (
                            <>
                              ไม่พบข้อมูลเกษตรกรในระบบ
                              <br />
                              <small className="text-muted d-block mb-2">
                                {[qrCodeData.firstName, qrCodeData.lastName]
                                  .filter(Boolean)
                                  .join(' ')}
                                {qrCodeData.thaiNationalId
                                  ? ` · ${qrCodeData.thaiNationalId}`
                                  : ''}
                              </small>
                              <button
                                type="button"
                                className="btn btn-sm btn-primary mt-1"
                                disabled={creatingFarmer}
                                onClick={handleCreateFromQR}
                              >
                                {creatingFarmer ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1" />
                                    กำลังสร้าง...
                                  </>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-plus me-1" />
                                    สร้างเกษตรกรจากข้อมูล QR
                                  </>
                                )}
                              </button>
                            </>
                          ) : (
                            'ไม่พบข้อมูลเกษตรกร'
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="w-100 mt-3">
                <div className="d-flex gap-2">
                  <div className="flex-grow-1">
                    <GenFormSelect
                      isRequired={false}
                      id={'landId'}
                      name={'landId'}
                      value={collectExamInput.landId}
                      options={landOptions}
                      emptyMessage="ไม่พบข้อมูลแปลงของเกษตรกร กรุณาเพิ่มแปลง"
                      onChange={e => {
                        handleSelectLand(Number(e.target.value));
                      }}
                    />
                  </div>
                  {landOptions.length == 0 && (
                    <div style={{ flexShrink: 0 }}>
                      <GenButtonCircle
                        color={B_LIST.add.color}
                        icon={B_LIST.land.icon}
                        link="/admin/land/add"
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-100 mt-3">
                <GenFormSelect
                  isRequired={false}
                  id={'serviceTypeId'}
                  name={'serviceTypeId'}
                  value={collectExamInput.serviceTypeId}
                  options={serviceTypeOptions}
                  onChange={e =>
                    handleSelectServiceType(Number(e.target.value))
                  }
                />
              </div>
            </div>

            {/* ฝั่งขวา แสดงข้อมูล farmer ที่เลือก */}
            <div className="w-50">
              {selectedFarmer ? (
                <div className="border rounded p-3 bg-light">
                  <h6>ข้อมูลเกษตรกรที่เลือก</h6>
                  <p>
                    <strong>ชื่อ:</strong> {selectedFarmer.firstName}{' '}
                    {selectedFarmer.lastName}
                  </p>
                  <p>
                    <strong>หมายเลขบัตรประชาชน:</strong>{' '}
                    {selectedFarmer.thaiNationalId}
                  </p>
                  <p>
                    <strong>โทรศัพท์:</strong> {selectedFarmer.phone}
                  </p>
                  <p>
                    <strong>โรงงาน:</strong> {selectedFarmer.factory?.name}
                  </p>
                  <p>
                    <strong>เขตส่งเสริม:</strong> เขต{' '}
                    {selectedFarmer.serviceArea?.code}{' '}
                    {selectedFarmer.serviceArea?.name}
                  </p>
                </div>
              ) : (
                <p className="text-muted">
                  {/* เลือกเกษตรกรจากด้านซ้ายเพื่อดูข้อมูล */}
                </p>
              )}
              {selectedLand ? (
                <div className="border rounded p-3 bg-light">
                  <h6>ข้อมูลแปลงที่เลือก</h6>
                  <p>
                    <strong>ชื่อแปลง:</strong> {selectedLand.name}
                  </p>
                  <p>
                    <strong>หมายเลขแปลง:</strong> {selectedLand.landCode}
                  </p>
                  <p>
                    <strong>รหัสโควต้าอ้อย:</strong> {selectedLand.quotaCode}
                  </p>
                  <p>
                    <strong>ที่อยู่:</strong> {selectedLand.village} ต.
                    {selectedLand.subdistrict?.nameTh} อ.
                    {selectedLand.subdistrict?.district?.nameTh}
                    จ.{
                      selectedLand.subdistrict?.district?.province?.nameTh
                    }{' '}
                    {selectedLand.zipCode}
                  </p>
                  <p>
                    <strong>พื้นที่:</strong> {selectedLand.areaSize} ไร่
                  </p>
                  {/* เพิ่มข้อมูลอื่นๆ ตามที่ต้องการ */}
                </div>
              ) : (
                <p className="text-muted">
                  {/* เลือกเกษตรกรจากด้านซ้ายเพื่อดูข้อมูล */}
                </p>
              )}
              {selectedServiceTypes ? (
                <div className="border rounded p-3 bg-light">
                  <h6>ข้อมูลประเภทการให้บริการที่เลือก</h6>
                  <p>
                    <strong>ประเภทการให้บริการ:</strong>{' '}
                    {selectedServiceTypes.name}
                  </p>
                  <p>
                    <strong>ประเภทการประเมิน:</strong>{' '}
                    {selectedServiceTypes.serviceCategories
                      .map(cat => cat.isDisplay && cat.name)
                      .join(',')}
                  </p>
                  <p>
                    <strong>ทดสอบ:</strong>{' '}
                    {selectedServiceTypes.serviceLaboratories
                      .filter(
                        lab => lab.isDisplay && lab.laboratories.shortNameBefore
                      )
                      .map(lab => lab.laboratories.shortNameBefore)
                      .join(',')}
                  </p>
                  <p>
                    <strong>ราคา:</strong>{' '}
                    {selectedServiceTypes.price === 0
                      ? 'ฟรี'
                      : selectedServiceTypes.price}{' '}
                    {selectedServiceTypes.unitDetail}
                  </p>
                  {/* เพิ่มข้อมูลอื่นๆ ตามที่ต้องการ */}
                </div>
              ) : (
                <p className="text-muted">
                  {/* เลือกเกษตรกรจากด้านซ้ายเพื่อดูข้อมูล */}
                </p>
              )}
            </div>
          </div>
          <div className="modal-footer d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-secondary "
              onClick={onClose}
            >
              ปิด
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleConfirm}
              // disabled={!selectedFarmer}
            >
              เลือก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
