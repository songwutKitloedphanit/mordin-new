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
import {
  createLaboratory,
  getAllLaboratories,
} from '@/services/api/laboratory/LaboratoryApi';
import { getAllMachineTypes } from '@/services/api/laboratory/MachineTypeApi';
import {
  LaboratoryInfoInterface,
  LaboratoryInput,
  MachineType,
} from '@/types/Laboratory';

const KPI_CONFIG = [
  {
    key: 'total' as const,
    label: 'ค่าวิเคราะห์ทั้งหมด',
    icon: 'fas fa-flask',
    accent: '#31CE36',
    unit: 'รายการ',
  },
  {
    key: 'main' as const,
    label: 'ค่าหลัก',
    icon: 'fas fa-star',
    accent: '#337AB7',
    unit: 'รายการ',
  },
  {
    key: 'minor' as const,
    label: 'ค่ารอง',
    icon: 'fas fa-vial',
    accent: '#F39C12',
    unit: 'รายการ',
  },
];

const LaboratoryAdd = () => {
  const navigate = useNavigate();

  const [kpi, setKpi] = useState({ total: 0, main: 0, minor: 0 });
  const [kpiLoading, setKpiLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<{ [key: string]: string }>({});
  const [laboratoryData, setLaboratoryData] = useState<LaboratoryInput>(
    {} as LaboratoryInput
  );
  const [machine, setMachine] = useState<MachineType[]>([]);

  useEffect(() => {
    getAllLaboratories()
      .then((data: LaboratoryInfoInterface[]) => {
        setKpi({
          total: data.length,
          main: data.filter(p => p.isMain).length,
          minor: data.filter(p => !p.isMain).length,
        });
      })
      .catch(console.error)
      .finally(() => setKpiLoading(false));
  }, []);

  useEffect(() => {
    getAllMachineTypes()
      .then((machineTypes: MachineType[]) => {
        setMachine(machineTypes);
        setLaboratoryData(prev => ({
          ...prev,
          machineTypeId: machineTypes[0]?.machineTypeId ?? 0,
        }));
      })
      .catch(console.error);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let updatedValue: string | number | boolean = value;
    if (name === 'machineTypeId') {
      updatedValue = parseInt(value, 10);
      if (isNaN(updatedValue as number)) return;
    } else if (name === 'isMain') {
      updatedValue = value === 'true' || value === '1';
    }

    setLaboratoryData(prev => ({ ...prev, [name]: updatedValue }));
  };

  const handleSubmit = async () => {
    setError({});
    const validationErrors: Record<string, string> = {};

    if (!laboratoryData.laboratoryCode)
      validationErrors.laboratoryCode = 'กรุณากรอกรหัส';
    if (!laboratoryData.name) validationErrors.name = 'กรุณากรอกชื่อ';
    if (!laboratoryData.shortNameBefore)
      validationErrors.shortNameBefore = 'กรุณากรอกชื่อย่อ (ก่อนแปลงค่า)';
    if (!laboratoryData.unitBefore)
      validationErrors.unitBefore = 'กรุณากรอกหน่วยวัด (ก่อนแปลงค่า)';
    if (!laboratoryData.unitAfter)
      validationErrors.unitAfter = 'กรุณากรอกหน่วยวัด (หลังแปลงค่า)';
    if (!laboratoryData.shortNameAfter)
      validationErrors.shortNameAfter = 'กรุณากรอกชื่อย่อ (หลังแปลงค่า)';
    if (!laboratoryData.rangeMin && laboratoryData.rangeMin != 0)
      validationErrors.rangeMin = 'กรุณากรอกขอบเขตล่าง';
    if (!laboratoryData.rangeMax && laboratoryData.rangeMax != 0)
      validationErrors.rangeMax = 'กรุณากรอกขอบเขตบน';

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    laboratoryData.rangeMin = Number(laboratoryData.rangeMin);
    laboratoryData.rangeMax = Number(laboratoryData.rangeMax);

    try {
      await createLaboratory(laboratoryData);
      await Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มข้อมูลการทดลองเรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
      navigate('/admin/laboratory');
    } catch (error: unknown) {
      console.error(error);
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message = err?.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้';
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
          const value = kpi[cfg.key];
          return (
            <div key={cfg.key} className="col-sm-6 col-lg-4">
              {kpiLoading ? (
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
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-flask me-2" />
                เพิ่มแล็บ
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle
                  color={B_LIST.list.color}
                  icon={B_LIST.list.icon}
                  link="/admin/laboratory"
                />
              </div>
            </div>
            <div className="private-card-body">
              <GenFormText2
                  isRequired
                  id="laboratoryCode"
                  name="laboratoryCode"
                  label="รหัส"
                  placeholder="รหัส"
                  desc="ใช้ในการเชื่อมโยงการคำนวณต่าง ๆ"
                  value={laboratoryData.laboratoryCode}
                  onChange={handleChange}
                  errorMessage={error.laboratoryCode}
                />
                <GenFormText1
                  isRequired
                  id="name"
                  name="name"
                  label="ชื่อ"
                  placeholder="ระบุชื่อ"
                  value={laboratoryData.name}
                  onChange={handleChange}
                  errorMessage={error.name}
                />
                <GenFormText1
                  isRequired
                  id="shortNameBefore"
                  name="shortNameBefore"
                  label="ชื่อย่อ (ก่อนแปลงค่า)"
                  placeholder="ระบุชื่อย่อ"
                  value={laboratoryData.shortNameBefore}
                  onChange={handleChange}
                  errorMessage={error.shortNameBefore}
                />
                <GenFormText1
                  isRequired
                  id="unitBefore"
                  name="unitBefore"
                  label="หน่วยวัด (ก่อนแปลงค่า)"
                  placeholder="ระบุหน่วยวัด (ก่อนแปลงค่า)"
                  value={laboratoryData.unitBefore}
                  onChange={handleChange}
                  errorMessage={error.unitBefore}
                />
                <GenFormText1
                  isRequired
                  id="shortNameAfter"
                  name="shortNameAfter"
                  label="ชื่อย่อ (หลังแปลงค่า)"
                  placeholder="ระบุชื่อย่อ (หลังแปลงค่า)"
                  value={laboratoryData.shortNameAfter}
                  onChange={handleChange}
                  errorMessage={error.shortNameAfter}
                />
                <GenFormText1
                  isRequired
                  id="unitAfter"
                  name="unitAfter"
                  label="หน่วยวัด (หลังแปลงค่า)"
                  placeholder="ระบุหน่วยวัด (หลังแปลงค่า)"
                  value={laboratoryData.unitAfter}
                  onChange={handleChange}
                  errorMessage={error.unitAfter}
                />
                <div className="row">
                  <div className="col-md-6">
                    <GenFormText1
                      isRequired
                      id="rangeMin"
                      name="rangeMin"
                      label="ขอบเขตล่าง"
                      placeholder="ระบุขอบเขตล่าง"
                      value={laboratoryData.rangeMin}
                      onChange={handleChange}
                      errorMessage={error.rangeMin}
                      type="number"
                      step="any"
                    />
                  </div>
                  <div className="col-md-6">
                    <GenFormText1
                      isRequired
                      id="rangeMax"
                      name="rangeMax"
                      label="ขอบเขตบน"
                      placeholder="ระบุขอบเขตบน"
                      value={laboratoryData.rangeMax}
                      onChange={handleChange}
                      errorMessage={error.rangeMax}
                      type="number"
                      step="any"
                    />
                  </div>
                </div>
                <GenFormSelect
                  isRequired
                  id="machineType"
                  name="machineTypeId"
                  label="ประเภท"
                  options={machine.map(item => ({
                    value: item.machineTypeId,
                    name: item.name,
                  }))}
                  value={laboratoryData.machineTypeId}
                  onChange={handleChange}
                />

                <div className="private-action-footer mt-4 d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: 150 }}
                    onClick={handleSubmit}
                  >
                    เพิ่มแล็บ
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ width: 150 }}
                    onClick={() => setShowConfirm(true)}
                  >
                    ยกเลิก
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ยืนยันการยกเลิก"
          text="คุณต้องการยกเลิกการบันทึกข้อมูลหรือไม่?"
          action="cancel"
          onConfirm={() => {
            navigate('/admin/laboratory');
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default LaboratoryAdd;

