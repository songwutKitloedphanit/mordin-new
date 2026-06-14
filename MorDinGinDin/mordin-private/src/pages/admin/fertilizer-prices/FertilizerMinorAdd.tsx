// D:\mitrpol\mordin-private\src\pages\admin\fertilizer-prices\FertilizerPriceAddSoilAmendment.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import {
  GenFormSelect,
  GenFormText1,
  GenFormText2,
} from '../../../components/gui/GuiForm';
import { createFertilizerMinor } from '../../../services/api/fertilizer/FertilizerMinorApi';
import { getAllUnits } from '../../../services/api/reference-data/UnitApi';
import { FertilizerMinorInput } from '../../../types/fertilizer/FertilizerMinor';
import { Unit } from '../../../types/reference-data/Units';

import FertilizerPriceSummaryCard from '@/components/pages/fertilizer-prices/FertilizerPriceSummaryCard';

const MAX_NOTE = 500;

const FertilizerMionorAdd: React.FC = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FertilizerMinorInput>(
    {} as FertilizerMinorInput
  );
  const [unitOptions, setUnitOptions] = useState<Unit[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FertilizerMinorInput, string>>
  >({});

  useEffect(() => {
    const fetchUnits = async () => {
      const units = await getAllUnits();
      setUnitOptions(units);
    };
    fetchUnits();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    // 1) Name
    if (!formData.name) {
      newErrors.name = 'กรุณาระบุประเภทธาตุอาหารรอง';
    }

    // 2) Unit
    if (!formData.unitId) {
      formData.unitId = unitOptions[0].unitId;
    }

    // 3) Price
    if (isNaN(formData.pricePerUnit) || formData.pricePerUnit <= 0) {
      newErrors.pricePerUnit = 'กรุณากรอกราคามากกว่า 0';
    }

    // 4) Benefit
    if (!formData.benefit) {
      newErrors.benefit = 'กรุณากรอกประโยชน์';
    }

    // 5) Note (optional)
    if (formData.note && formData.note.length > MAX_NOTE) {
      newErrors.note = `หมายเหตุต้องไม่เกิน ${MAX_NOTE} ตัวอักษร`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const created = await createFertilizerMinor(formData);
      console.log('✅ Created:', created);

      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'เพิ่มธาตุอาหารรองเรียบร้อยแล้ว',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });

      navigate('/admin/fertilizer-prices');
    } catch (error) {
      console.error('❌ Failed to create soil amendment:', error);
      Swal.fire({
        icon: 'error',
        title: 'ผิดพลาด',
        text: 'ไม่สามารถเพิ่มธาตุอาหารรองได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  return (
    <>
      {/* Summary Cards */}
      <FertilizerPriceSummaryCard />

      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">เพิ่มธาตุอาหารรอง</h4>
              <GenButtonCircle
                color={B_LIST.list.color}
                icon={B_LIST.list.icon}
                link="/admin/fertilizer-prices"
              />
            </div>
            <div className="card-body">
              <div className="col-md-6 mx-auto">
                <GenFormText2
                  isRequired={true}
                  id="add-name"
                  name="name"
                  label="ประเภทธาตุอาหารรอง"
                  placeholder="ระบุประเภทธาตุอาหารรอง"
                  desc="ใช้เพื่อจำแนก"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  errorMessage={errors.name}
                />

                <GenFormText1
                  isRequired={true}
                  id="input-pricePerUnit"
                  name="pricePerUnit"
                  label="ราคาต่อหน่วย (บาท)"
                  placeholder="ระบุราคาต่อหน่วย(บาท)"
                  value={formData.pricePerUnit}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      pricePerUnit: parseFloat(e.target.value) || 0,
                    })
                  }
                  errorMessage={errors.pricePerUnit}
                />

                <GenFormSelect
                  id="input-unit"
                  name="unit"
                  label="หน่วย"
                  value={formData.unitId}
                  options={unitOptions.map(unit => ({
                    value: unit.unitId,
                    name: `${unit.name} (${unit.initial})`,
                  }))}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      unitId: Number(e.target.value),
                    })
                  }
                  isRequired
                />
                {errors.unitId && (
                  <div className="text-danger">{errors.unitId}</div>
                )}

                <GenFormText1
                  isRequired
                  id="input-benefit"
                  name="benefit"
                  label="ประโยชน์"
                  placeholder="ระบุประโยชน์"
                  value={formData.benefit}
                  onChange={e =>
                    setFormData({ ...formData, benefit: e.target.value })
                  }
                  errorMessage={errors.benefit}
                />

                <GenFormText1
                  id="input-note"
                  isRequired={false}
                  name="note"
                  label="หมายเหตุ"
                  placeholder="หมายเหตุ (ถ้ามี)"
                  value={formData.note || ''}
                  onChange={e =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  errorMessage={errors.note}
                />

                <div className="card-action d-flex justify-content-between mt-4">
                  <button
                    type="submit"
                    className="btn btn-success me-auto"
                    style={{ width: 150 }}
                    onClick={handleSubmit}
                  >
                    เพิ่มธาตุอาหารรอง
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger ms-auto"
                    style={{ width: 150 }}
                    onClick={() => setShowConfirm(true)}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>

              {showConfirm && (
                <ConfirmAlert
                  title={'ยืนยันการยกเลิก'}
                  text={'ต้องการยกเลิกการบันทึกข้อมูลใช่หรือไม่?'}
                  action={'cancel'}
                  onConfirm={() => navigate(-1)}
                  onCancel={() => setShowConfirm(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FertilizerMionorAdd;
