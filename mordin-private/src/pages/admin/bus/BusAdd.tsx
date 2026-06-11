import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import {
  GenFormSelect,
  GenFormText1,
  GenFormText2,
} from '@/components/gui/GuiForm';
import { getAllProvinces } from '@/services/api/address/ProvinceApi';
import { createBus, getBusSummary } from '@/services/api/BusApi';
import { Province } from '@/types/address';
import { BusInput, BusSummary } from '@/types/Bus';

const KPI_CONFIG = [
  {
    key: 'totalBuses' as keyof BusSummary,
    label: 'รถให้บริการ',
    icon: 'fas fa-bus-alt',
    accent: '#7a5af5',
    unit: 'คัน',
  },
];

const BusAdd = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<BusSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [bus, setBus] = useState<BusInput>({
    busNumber: '',
    busName: '',
    licensePlate: '',
    registrationProvinceCode: 0,
    workingArea: '',
    note: '',
  });

  const [errors, setErrors] = useState({
    busNumber: '',
    busName: '',
    licensePlate: '',
    registrationProvinceCode: '',
    workingArea: '',
  });

  useEffect(() => {
    getBusSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    getAllProvinces()
      .then(data => {
        setProvinceList(data);
        if (data[0]?.code) {
          setBus(prev => ({ ...prev, registrationProvinceCode: data[0].code }));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async () => {
    const newErrors = {
      busNumber: bus.busNumber.trim() === '' ? 'กรุณาระบุรหัสรถ' : '',
      busName: bus.busName.trim() === '' ? 'กรุณาระบุชื่อรถ' : '',
      licensePlate: bus.licensePlate.trim() === '' ? 'กรุณาระบุทะเบียนรถ' : '',
      registrationProvinceCode:
        bus.registrationProvinceCode > 0 ? '' : 'กรุณาเลือกจังหวัดจดทะเบียน',
      workingArea:
        bus.workingArea.trim() === '' ? 'กรุณาระบุพื้นที่ปฏิบัติงาน' : '',
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(msg => msg !== '')) return;

    try {
      await createBus(bus);
      await Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มข้อมูลรถเรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
      navigate('/admin/bus');
    } catch (error: unknown) {
      console.error(error);
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message =
        err?.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลรถได้';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
    }
  };

  return (
    <>
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {KPI_CONFIG.map(cfg => {
          const value = summary?.[cfg.key] ?? 0;
          return (
            <div key={cfg.key} className="col-sm-6 col-lg-4">
              {summaryLoading ? (
                <div
                  className="private-metric-card h-100"
                  style={{ borderLeft: '4px solid rgba(128,128,128,0.2)' }}
                >
                  <div className="private-card-body py-3 px-4">
                    <div className="placeholder-glow mb-2">
                      <span
                        className="placeholder d-block rounded"
                        style={{ height: 11, width: '60%' }}
                      />
                    </div>
                    <div className="placeholder-glow">
                      <span
                        className="placeholder d-block rounded"
                        style={{ height: 32, width: '40%' }}
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
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span
                        className="text-muted fw-semibold text-uppercase"
                        style={{ fontSize: '0.7rem', letterSpacing: '0.6px' }}
                      >
                        {cfg.label}
                      </span>
                      <i
                        className={cfg.icon}
                        style={{
                          color: cfg.accent,
                          fontSize: '1.1rem',
                          opacity: 0.75,
                        }}
                      />
                    </div>
                    <div className="d-flex align-items-baseline gap-2">
                      <span
                        className="fw-bold"
                        style={{ fontSize: '2rem', lineHeight: 1.1 }}
                      >
                        {value}
                      </span>
                      <span
                        className="text-muted"
                        style={{ fontSize: '0.78rem' }}
                      >
                        {cfg.unit}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-bus-alt me-2" />
                เพิ่มรถคันใหม่
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle
                  color={B_LIST.list.color}
                  icon={B_LIST.list.icon}
                  link="/admin/bus"
                />
              </div>
            </div>
            <div className="private-card-body">
              <div className="col-md-6 mx-auto">
                <GenFormText1
                  isRequired
                  id="busNumber"
                  name="busNumber"
                  label="รหัสรถ"
                  value={bus.busNumber}
                  placeholder="ระบุรหัสรถ"
                  maxLength={2}
                  onChange={e => {
                    setBus({ ...bus, busNumber: e.target.value });
                    setErrors({ ...errors, busNumber: '' });
                  }}
                  errorMessage={errors.busNumber}
                />
                <GenFormText1
                  isRequired
                  id="busName"
                  name="busName"
                  label="ชื่อรถ"
                  value={bus.busName}
                  placeholder="ระบุชื่อรถ"
                  onChange={e => {
                    setBus({ ...bus, busName: e.target.value });
                    setErrors({ ...errors, busName: '' });
                  }}
                  errorMessage={errors.busName}
                />
                <GenFormText2
                  isRequired
                  id="licensePlate"
                  name="licensePlate"
                  label="ทะเบียนรถ"
                  value={bus.licensePlate}
                  placeholder="ระบุเลขทะเบียนรถ"
                  desc=""
                  onChange={e => {
                    setBus({ ...bus, licensePlate: e.target.value });
                    setErrors({ ...errors, licensePlate: '' });
                  }}
                  errorMessage={errors.licensePlate}
                />
                <GenFormSelect
                  isRequired
                  id="registrationProvinceCode"
                  name="registrationProvinceCode"
                  label="จังหวัดจดทะเบียน"
                  options={[
                    { value: '', name: 'เลือกจังหวัด' },
                    ...provinceList.map(p => ({
                      value: p.code.toString(),
                      name: p.nameTh,
                    })),
                  ]}
                  value={
                    bus.registrationProvinceCode
                      ? bus.registrationProvinceCode.toString()
                      : ''
                  }
                  onChange={e => {
                    setBus({
                      ...bus,
                      registrationProvinceCode: Number(e.target.value),
                    });
                    setErrors({
                      ...errors,
                      registrationProvinceCode: '',
                    });
                  }}
                />
                {errors.registrationProvinceCode && (
                  <div className="text-danger small mb-2">
                    {errors.registrationProvinceCode}
                  </div>
                )}
                <GenFormText1
                  isRequired
                  id="workingArea"
                  name="workingArea"
                  label="พื้นที่ปฏิบัติงาน"
                  value={bus.workingArea}
                  placeholder="ระบุพื้นที่ปฏิบัติงาน"
                  onChange={e => {
                    setBus({ ...bus, workingArea: e.target.value });
                    setErrors({ ...errors, workingArea: '' });
                  }}
                  errorMessage={errors.workingArea}
                />
                <GenFormText1
                  isRequired={false}
                  id="note"
                  name="note"
                  label="หมายเหตุ"
                  value={bus.note}
                  placeholder="ระบุหมายเหตุ"
                  onChange={e => setBus({ ...bus, note: e.target.value })}
                />

                <div className="private-action-footer mt-4 d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: '150px' }}
                    onClick={handleSubmit}
                  >
                    เพิ่มรถ
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ width: '150px' }}
                    onClick={() => setShowConfirm(true)}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ยืนยันการยกเลิก"
          text="คุณต้องการยกเลิกการเพิ่มรถหรือไม่?"
          action="cancel"
          onConfirm={() => {
            navigate('/admin/bus');
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default BusAdd;
