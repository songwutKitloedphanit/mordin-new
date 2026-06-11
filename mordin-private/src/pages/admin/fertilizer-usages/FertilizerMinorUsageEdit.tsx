import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import { GenFormSelect, GenFormText1 } from '../../../components/gui/GuiForm';
import {
  // DoubleRangeSlider,
  MultiPointSlider2,
} from '../../../components/gui/RangeSlider';
import {
  getServiceFertilizerMinorById,
  updateServiceFertilizerMinor,
} from '../../../services/api/fertilizer/ServiceFertilizerMinorApi';
import { getAllLaboratories } from '../../../services/api/laboratory/LaboratoryApi';
import { getAllUnits } from '../../../services/api/reference-data/UnitApi';
import { FertilizerMinor } from '../../../types/fertilizer/FertilizerMinor';
import {
  ServiceFertilizerMinorInput,
  ServiceFertilizerMinorUsage,
} from '../../../types/fertilizer/ServiceFertilizerMinor';
import { Laboratory } from '../../../types/Laboratory';
import { Unit } from '../../../types/reference-data/Units';
import { ServiceType } from '../../../types/service-type/ServiceTypes';
import { User } from '../../../types/User';

import FertilizerUsagesSummaryCard from '@/components/pages/fertilizer-usages/FertilizerUsagesSummaryCard';
// import { parse } from "path";

interface ServiceFertilizerMinor {
  serviceFertilizerMinorId: number;
  serviceTypeId: number;
  fertilizerMinorId: number;
  laboratoryId: number | null;
  unitId: number;
  updateUid: number;
  updatedAt: string;
  updateUser: User;
  fertilizerMinor: FertilizerMinor;
  serviceType: ServiceType;
  laboratory: Laboratory | null;
  serviceFertilizerMinorUsages: ServiceFertilizerMinorUsage[]; // you can specify type if known
}

const FertilizerMinorUsageEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState<ServiceFertilizerMinor>();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  //formdata schema bro
  const [formData, setFormData] = useState<ServiceFertilizerMinorInput>({
    serviceTypeId: 0,
    fertilizerMinorId: 0,
    laboratoryId: 0,
    unitId: 0,
    serviceFertilizerMinorUsages: [],
  });

  //reference data
  const [unit, setUnit] = useState<Unit[]>([]);
  const [lab, setLab] = useState<Laboratory[]>([]);
  const [selectedLab, setSelectedLab] = useState<Laboratory>();
  const [selectedUnit, setSelectedUnit] = useState<Unit>();

  //serviceFertilizerMinorUsages state
  const [usageRange, setUsageRange] = useState<number[]>([]);
  const getFinalCutoff = useCallback(() => {
    return (selectedLab?.rangeMax ?? 99999) + 1;
  }, [selectedLab?.rangeMax]);

  const [stepText, setStepText] = useState<string>(
    usageRange.length.toString()
  );

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, units, labs] = await Promise.all([
          getServiceFertilizerMinorById(Number(id)),
          getAllUnits(),
          getAllLaboratories(),
        ]);

        setUnit(units);
        setLab(labs);
        setData(res);

        setFormData({
          serviceTypeId: res?.serviceTypeId ?? null,
          fertilizerMinorId: res?.fertilizerMinorId ?? null,
          laboratoryId: res?.laboratoryId ?? null,
          unitId: res?.unitId ?? null,
          serviceFertilizerMinorUsages: res?.serviceFertilizerMinorUsages ?? [],
        });
        // setUnit(mockUnits);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (id) fetchData();
  }, [id]);

  // console.log("all data", data);

  //state management
  useEffect(() => {
    setSelectedLab(lab.find(v => v.laboratoryId === formData.laboratoryId));
    setSelectedUnit(unit.find(v => v.unitId === formData.unitId));
    console.log('formdata state', formData);
    // console.log("unit lab", unit, lab);
    console.log('cutoff value current', usageRange);
    // console.log("current selectedLab", selectedLab);
  }, [formData, unit, lab, usageRange]);

  useEffect(() => {
    // Update formData.serviceFertilizerMinorUsages when usageRange changes
    setFormData(prev => {
      const finalCutoff = getFinalCutoff();

      const updatedUsages = usageRange.map((cutoff, i) => {
        const prevCutoff = i === 0 ? null : usageRange[i - 1];
        let cutoffText = '';

        if (i === 0) {
          cutoffText = `< ${cutoff}`;
        } else if (cutoff !== finalCutoff) {
          cutoffText = `${prevCutoff} - ${cutoff}`;
        } else {
          cutoffText = `> ${prevCutoff}`;
        }

        return {
          level: i + 1,
          cutoffValue: cutoff,
          cutoffText: cutoffText,
          fertilizerUsageValue:
            prev.serviceFertilizerMinorUsages[i]?.fertilizerUsageValue ?? null,
        };
      });

      return {
        ...prev,
        serviceFertilizerMinorUsages: updatedUsages,
      };
    });
  }, [getFinalCutoff, usageRange]);

  const handleRange = (value: string) => {
    const count = parseInt(value, 10);
    if (isNaN(count) || count < 1) return;

    // ค่า cutoff ที่จะตั้งค่าใหม่
    const newUsageRange: number[] = [];

    for (let i = 0; i < count; i++) {
      if (i === count - 1) {
        // ตัวสุดท้ายเป็น getFinalCutoff()
        newUsageRange.push(getFinalCutoff());
      } else if (usageRange[i] !== undefined) {
        // ถ้ามีค่าเดิมอยู่แล้วให้เก็บไว้
        newUsageRange.push(usageRange[i]);
      } else {
        // ถ้าไม่มีค่าเดิมให้เติม 0
        newUsageRange.push(0);
      }
    }

    setUsageRange(newUsageRange);
  };

  const handleUsage = (index: number, inputValue: string) => {
    // แปลงค่าที่ผู้ใช้กรอกจาก string เป็น float
    const newValue = parseFloat(inputValue);

    // ใช้ setFormData เพื่ออัปเดต state ของ formData
    setFormData(prev => {
      // Clone array เดิม เพื่อไม่แก้ไขโดยตรง
      const newUsages = [...prev.serviceFertilizerMinorUsages];

      // อัปเดต object ที่ตำแหน่ง index ด้วยค่าที่ใหม่
      newUsages[index] = {
        ...newUsages[index], // เก็บค่าเดิมไว้
        fertilizerUsageValue: isNaN(newValue) ? null : newValue, // ถ้าไม่ใช่ตัวเลขให้ใส่ null
      };

      // คืนค่า formData ใหม่ พร้อมรายการที่ถูกแก้ไข
      return {
        ...prev,
        serviceFertilizerMinorUsages: newUsages,
      };
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await updateServiceFertilizerMinor(Number(id), formData);
      console.log('update success', res);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'บันทึกข้อมูลการปรับปรุงดินสำเร็จ',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate('/admin/fertilizer-usages');
      });
    } catch (error) {
      console.error('update error', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถบันทึกข้อมูลการปรับปรุงดินได้',
        icon: 'error',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
    }
  };

  return (
    <div className="row">
      {/* Card Summary */}
      <FertilizerUsagesSummaryCard />

      {/* Form */}
      <div className="col-md-6">
        <div className="private-card">
          <div className="private-card-header">
            <div className="row row-demo-grid">
              <div
                className="col-md-10 col-sm-10 col-10"
                style={{ textAlign: 'left' }}
              >
                <h4 className="private-card-title">
                  การตั้งค่า {data?.fertilizerMinor.name}
                </h4>
              </div>
              <div
                className="col-md-2 col-sm-2 col-2 ms-auto"
                style={{ textAlign: 'right' }}
              >
                <GenButtonCircle
                  icon={B_LIST.list.icon}
                  color={B_LIST.list.color}
                  link="/admin/fertilizer-usages"
                />
              </div>
            </div>
          </div>
          <div className="private-card-body">
            <div className="col-md-12 ms-auto me-auto">
              <GenFormSelect
                isRequired={true}
                id="unit"
                name="unit"
                label="หน่วยวัด"
                options={[
                  {
                    value: '',
                    name: 'กรุณาเลือกค่า',
                  },
                  ...unit.map(v => ({
                    value: v.unitId,
                    name: v.name,
                  })),
                ]}
                value={formData.unitId ?? ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    unitId:
                      e.target.value === '' ? null : Number(e.target.value), //validate
                  }))
                }
              />
              <GenFormText1
                isRequired={true}
                id="step"
                name="step"
                label="ระบุจำนวนระดับการให้"
                placeholder="ระบุจำนวนระดับ"
                value={stepText}
                onChange={e => {
                  const newValue = e.target.value;
                  setStepText(newValue);
                  if (newValue === '') {
                    setUsageRange([]);
                  } else handleRange(e.target.value);
                }}
                type="number"
              />
              <GenFormSelect
                isRequired={true}
                id="consideration"
                name="consideration"
                label="พิจารณาจากผลตรวจปฏิบัติการ"
                options={[
                  { value: '', name: 'กรุณาเลือกค่า' }, // เพิ่ม option นี้เป็นตัวเลือกแรก
                  ...lab.map(v => ({
                    value: v.laboratoryId,
                    name: v.shortNameAfter + ' (' + v.unitAfter + ')',
                  })),
                ]}
                value={formData.laboratoryId ?? ''} // ถ้า null หรือ undefined ให้เป็น ""
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    laboratoryId:
                      e.target.value === '' ? null : Number(e.target.value), //validate
                  }))
                }
              />
              <div className="row">
                <div className="col-md-4 col-lg-4">
                  <div className="form-group">
                    <label></label>
                  </div>
                </div>
                <div className="col-md-8 col-lg-8">
                  <MultiPointSlider2
                    value={usageRange.filter(
                      v => v <= (selectedLab?.rangeMax as number)
                    )}
                    step={
                      selectedLab?.shortNameAfter === 'OM' ||
                      selectedLab?.shortNameAfter.toLocaleUpperCase() === 'EC'
                        ? 0.01
                        : 0.1
                    }
                    min={selectedLab?.rangeMin as number}
                    max={selectedLab?.rangeMax as number}
                    onChange={newValues => {
                      setUsageRange([...newValues, getFinalCutoff()]);
                    }}
                  />
                </div>
              </div>
              {formData.serviceFertilizerMinorUsages.map((v, i) => (
                <GenFormText1
                  key={`usage-${v.level}`}
                  isRequired={true}
                  id={`usage-${v.level}`}
                  name={`usage-${v.level}`}
                  label={`ระดับที่ ${v.level}`}
                  placeholder="ระบุอัตราการใช้"
                  value={v.fertilizerUsageValue ?? ''}
                  onChange={e => handleUsage(i, e.target.value)}
                />
              ))}

              <div className="private-action-footer mt-4 d-flex justify-content-between">
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ width: '130px' }}
                  onClick={handleSubmit}
                >
                  บันทึกการตั้งค่า
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: '130px' }}
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
          title={'ยืนยันการยกเลิก'}
          text={'คุณต้องการยกเลิกการตั้งค่าหรือไม่?'}
          action={'cancel'}
          onConfirm={() => navigate(-1)}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {/* Table */}
      <div className="col-md-6">
        <div className="private-card">
          <div className="private-card-header">
            <div className="row row-demo-grid">
              <div
                className="col-md-10 col-sm-10 col-10"
                style={{ textAlign: 'left' }}
              >
                <h4 className="private-card-title">
                  คะแนนความอุดมสมบูรณ์ของดิน ({data?.serviceType.name})
                </h4>
              </div>
              <div
                className="col-md-2 col-sm-2 col-2 ms-auto"
                style={{ textAlign: 'right' }}
              ></div>
            </div>
          </div>
          <div className="private-card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>
                    {selectedLab
                      ? `${selectedLab.shortNameAfter} (${selectedLab.unitAfter})`
                      : 'ไม่พบค่า'}
                  </th>
                  <th>อัตราการใช้ ({selectedUnit?.name}/ไร่)</th>
                </tr>
              </thead>
              <tbody>
                {formData.serviceFertilizerMinorUsages.map(v => {
                  return (
                    <tr key={v.level}>
                      <td>{v.cutoffText}</td>
                      <td>{v.fertilizerUsageValue ?? '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilizerMinorUsageEdit;
