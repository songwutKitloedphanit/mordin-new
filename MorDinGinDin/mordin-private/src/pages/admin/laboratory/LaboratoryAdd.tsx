import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle } from '../../../components/gui/GuiButton';
import {
  GenFormSelect,
  GenFormText1,
  GenFormText2,
} from '../../../components/gui/GuiForm';
import { createLaboratory } from '../../../services/api/laboratory/LaboratoryApi';
import { getAllMachineTypes } from '../../../services/api/laboratory/MachineTypeApi';
import { LaboratoryInput, MachineType } from '../../../types/Laboratory';

import LabCard from '@/components/pages/laboratory/LabCard';

const LaboratoryAdd = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [laboratoryData, setLaboratoryData] = useState<LaboratoryInput>(
    {} as LaboratoryInput
  );
  const [machine, setMachine] = useState<MachineType[]>([]);
  const [showConfirm, setShowConfirm] = useState<null | {
    type: 'delete' | 'cancel';
    index?: number;
  }>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const machineTypes = await getAllMachineTypes();
        console.log('machineTypes : ', machineTypes);
        setMachine(machineTypes);

        setLaboratoryData(prev => ({
          ...prev,
          machineTypeId: machineTypes[0]?.machineTypeId ?? 0,
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAllData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let updatedValue: string | number | boolean = value;

    if (name === 'machineTypeId') {
      updatedValue = parseInt(value, 10);
      if (isNaN(updatedValue)) return;
    } else if (name === 'isMain') {
      updatedValue = value === 'true' || value === '1';
    }

    setLaboratoryData(prev => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSubmit = async () => {
    setError({});
    const validationErrors: Record<string, string> = {};

    // Validation checks
    if (!laboratoryData.laboratoryCode) {
      validationErrors.laboratoryCode = 'กรุณากรอกรหัส';
    }
    if (!laboratoryData.name) {
      validationErrors.name = 'กรุณากรอกชื่อ';
    }
    if (!laboratoryData.shortNameBefore) {
      validationErrors.shortNameBefore = 'กรุณากรอกชื่อย่อ (ก่อนแปลงค่า)';
    }
    if (!laboratoryData.unitBefore) {
      validationErrors.unitBefore = 'กรุณากรอกหน่วยวัด (ก่อนแปลงค่า)';
    }
    if (!laboratoryData.unitAfter) {
      validationErrors.unitAfter = 'กรุณากรอกหน่วยวัด (หลังแปลงค่า)';
    }
    if (!laboratoryData.shortNameAfter) {
      validationErrors.shortNameAfter = 'กรุณากรอกชื่อย่อ (หลังแปลงค่า)';
    }
    if (!laboratoryData.rangeMin && laboratoryData.rangeMin != 0) {
      validationErrors.rangeMin = 'กรุณากรอกขอบเขตบน';
    }
    if (!laboratoryData.rangeMax && laboratoryData.rangeMax != 0) {
      validationErrors.rangeMax = 'กรุณากรอกขอบเขตล่าง';
    }

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }
    laboratoryData.rangeMin = Number(laboratoryData.rangeMin);
    laboratoryData.rangeMax = Number(laboratoryData.rangeMax);
    console.log('Form submitted:', laboratoryData);

    try {
      const response = await createLaboratory(laboratoryData);
      console.log('created laboratory:', response.data);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มข้อมูลการทดลองเรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate('/admin/laboratory');
      });
    } catch (error) {
      console.error('Error creating bus:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลรถได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      throw error;
    }
  };

  return (
    <>
      <div className="row">
        <LabCard />

        <div className="col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">เพิ่มแล็บ</h4>
              <GenButtonCircle
                color="btn-primary"
                icon="fa fa-clipboard-list"
                link="/admin/laboratory"
              />
            </div>
            <div className="card-body">
              <div className="col-md-6 mx-auto">
                <GenFormText2
                  isRequired={true}
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
                  isRequired={true}
                  id="name"
                  name="name"
                  label="ชื่อ"
                  placeholder="ระบุชื่อ"
                  value={laboratoryData.name}
                  onChange={handleChange}
                  errorMessage={error.name}
                />

                <GenFormText1
                  isRequired={true}
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
                  isRequired={true}
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
                  isRequired={true}
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

                <div className="card-action mt-4 d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: '150px' }}
                    onClick={handleSubmit}
                  >
                    เพิ่มแล็บ
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ width: '150px' }}
                    onClick={() => setShowConfirm({ type: 'cancel' })}
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
          title={
            showConfirm.type === 'delete' ? 'ยืนยันการลบ' : 'ยืนยันการยกเลิก'
          }
          text={
            showConfirm.type === 'delete'
              ? 'คุณต้องการลบประเภทการประเมินนี้หรือไม่?'
              : 'คุณต้องการยกเลิกการบันทึกข้อมูลหรือไม่?'
          }
          action={showConfirm.type}
          onConfirm={() => {
            if (showConfirm.type === 'cancel') {
              navigate(-1);
            }
            setShowConfirm(null);
          }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};

export default LaboratoryAdd;
