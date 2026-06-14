import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle } from '../../../components/gui/GuiButton';
import {
  GenFormSelect,
  GenFormText1,
  GenFormText2,
} from '../../../components/gui/GuiForm';
import {
  getLaboratoryById,
  updateLaboratoryById,
} from '../../../services/api/laboratory/LaboratoryApi';
import { getAllMachineTypes } from '../../../services/api/laboratory/MachineTypeApi';
import { LaboratoryInput, MachineType } from '../../../types/Laboratory';

import LabCard from '@/components/pages/laboratory/LabCard';

const LaboratoryEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const laboratoryId = Number(id);
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [laboratoryData, setLaboratoryData] = useState<LaboratoryInput>(
    {} as LaboratoryInput
  );
  const [machineType, setMachineType] = useState<MachineType[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  useEffect(() => {
    const fetchLaboratoryData = async () => {
      const lab = await getLaboratoryById(laboratoryId);
      const type = await getAllMachineTypes();

      setMachineType(type);
      setLaboratoryData({
        laboratoryCode: lab.laboratoryCode,
        name: lab.name,
        shortNameBefore: lab.shortNameBefore,
        unitBefore: lab.unitBefore,
        shortNameAfter: lab.shortNameAfter,
        unitAfter: lab.unitAfter,
        rangeMin: lab.rangeMin,
        rangeMax: lab.rangeMax,
        machineTypeId: lab.machineTypeId,
      });
    };
    fetchLaboratoryData();
  }, [laboratoryId]);

  console.log(laboratoryData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLaboratoryData(prev => ({ ...prev, [name]: value }));
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
    console.log('Form submitted:', laboratoryData);

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    laboratoryData.rangeMin = Number(laboratoryData.rangeMin);
    laboratoryData.rangeMax = Number(laboratoryData.rangeMax);
    laboratoryData.machineTypeId = Number(laboratoryData.machineTypeId);

    console.log('Form submitted:', laboratoryData);

    try {
      const response = await updateLaboratoryById(laboratoryId, laboratoryData);
      console.log('Form submitted:', response);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'แก้ไขข้อมูล Laboratory เรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate(`/admin/laboratory/${laboratoryId}`);
      });
    } catch (error) {
      console.error('Error creating calendar:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถแก้ไขข้อมูล Laboratory ได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      throw error;
    }
  };

  return (
    <div className="row">
      <LabCard />

      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <div className="row row-demo-grid">
              <div
                className="col-md-4 col-sm-6 col-6"
                style={{ textAlign: 'left' }}
              >
                <h4 className="card-title">
                  แก้ไขแล็บ ({laboratoryData.laboratoryCode})
                </h4>
              </div>
              <div
                className="col-md-4 col-sm-6 col-6 ms-auto"
                style={{ textAlign: 'right' }}
              >
                <GenButtonCircle
                  color="btn-primary"
                  icon="fa fa-clipboard-list"
                  link="/admin/laboratory"
                />
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="col-md-8 ms-auto me-auto">
              <GenFormText2
                isRequired={true}
                id="laboratoryCode"
                name="laboratoryCode"
                label="รหัส"
                placeholder="รหัส"
                desc="ใช้ในการเชื่อมโรงการคำนวณต่าง ๆ"
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
                isRequired={true}
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
                isRequired={true}
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
                id="machineTypeId"
                name="machineTypeId"
                label="ประเภท"
                options={machineType?.map(t => ({
                  value: t.machineTypeId,
                  name: t.name,
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
                  แก้ไขแล็บ
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: '150px' }}
                  onClick={() => setShowConfirm(true)}
                >
                  ยกเลิก
                </button>
                {showConfirm && (
                  <ConfirmAlert
                    title={'ยืนยันการยกเลิก'}
                    text={'คุณต้องการยกเลิกการแก้ไขข้อมูลหรือไม่?'}
                    action={'cancel'}
                    onConfirm={() => {
                      navigate(-1);
                      setShowConfirm(false);
                    }}
                    onCancel={() => setShowConfirm(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaboratoryEdit;
