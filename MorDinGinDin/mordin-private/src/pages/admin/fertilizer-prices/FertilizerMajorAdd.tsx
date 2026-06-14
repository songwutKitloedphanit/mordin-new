// D:\mitrpol\mordin-private\src\pages\admin\fertilizer-prices\FertilizerMajorAdd.tsx this page for add main fertilizer
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert.tsx';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton.tsx';
import {
  GenFormText1,
  GenFormSelect,
} from '../../../components/gui/GuiForm.tsx';
//type
import { createFertilizerMajor } from '../../../services/api/fertilizer/FertilizerMajorApi.ts';
import { getAllUnits } from '../../../services/api/reference-data/UnitApi.ts';
import {
  FertilizerMajorTypes,
  FertilizerMajorInput,
} from '../../../types/fertilizer/FertilizerMajor.ts';
import { Unit } from '../../../types/reference-data/Units.ts';

import FertilizerPriceSummaryCard from '@/components/pages/fertilizer-prices/FertilizerPriceSummaryCard.tsx';
//api

// Mapping for fertilizer types
const fertilizerMajorTypeLabels: Record<FertilizerMajorTypes, string> = {
  [FertilizerMajorTypes.Foliar]: 'ปุ๋ยเกล็ด',
  [FertilizerMajorTypes.Liquid]: 'ปุ๋ยน้ำ',
  [FertilizerMajorTypes.Granular]: 'ปุ๋ยเม็ด',
  [FertilizerMajorTypes.Organic]: 'ปุ๋ยอินทรีย์',
};
const FertilizerMajorAdd: React.FC = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  // const [mainData, setMainData] = useState<FertilizerMajor[]>([]);
  // const [secData, setSecData] = useState<FertilizerMinor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState<FertilizerMajorInput>(
    {} as FertilizerMajorInput
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof FertilizerMajorInput, string>>
  >({});
  // --- Effects for fetching data ---
  useEffect(() => {
    // Fetch summary data
    // const fetchFertilizers = async () => {
    //   try {
    //     const [majors, minors] = await Promise.all([
    //       getAllFertilizerMajors(),
    //       getAllFertilizerMinors(),
    //     ]);
    //     setMainData(majors);
    //     setSecData(minors);
    //   } catch (err) {
    //     console.error('Failed to load fertilizer data:', err);
    //   }
    // };
    // fetchFertilizers();
    // Fetch units
    const fetchUnits = async () => {
      try {
        const data = await getAllUnits();
        setUnits(data);

        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            unitId: data[0].unitId,
            type: Object.values(FertilizerMajorTypes)[0] ?? '',
          }));
        }
      } catch (err) {
        console.error('Failed to load units:', err);
      }
    };
    fetchUnits();
  }, []);
  // const mainCount = mainData.length;
  // const avgBagPrice = mainCount
  //   ? mainData.reduce((sum, f) => sum + f.price, 0) / mainCount
  //   : 0;

  // const secCount = secData.length;
  // const numericSec = secData.filter(
  //   item => typeof item.pricePerUnit === 'number'
  // );
  // const avgSecPrice = numericSec.length
  //   ? numericSec.reduce((sum, f) => sum + f.pricePerUnit, 0) / numericSec.length
  //   : 0;

  const unitOptions = units.map(u => ({
    value: u.unitId.toString(),
    name: u.initial,
  }));

  // --- Form submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    const vals = [formData.N, formData.P, formData.K];
    const allEmptyOrZero = vals.every(v => v == null || v === 0);
    if (allEmptyOrZero) {
      const msg =
        'กรุณาระบุค่า N, P หรือ K อย่างน้อยหนึ่งค่าให้ไม่เป็น 0 หรือค่าว่าง';
      newErrors.N = msg;
      newErrors.P = msg;
      newErrors.K = msg;
    }
    vals.forEach((v, i) => {
      if (v != null && isNaN(v)) {
        const field = ['N', 'P', 'K'][i] as keyof FertilizerMajorInput;
        newErrors[field] = 'กรุณาระบุเป็นตัวเลขเท่านั้น';
      }
    });
    if (formData.unitId == null || formData.unitId === 0) {
      newErrors.unitId = 'กรุณาระบุหน่วย';
    }
    if (
      formData.quantity == null ||
      isNaN(formData.quantity) ||
      formData.quantity <= 0
    ) {
      newErrors.quantity = 'กรุณาระบุปริมาณให้มากกว่า 0';
    }
    if (
      formData.price == null ||
      isNaN(formData.price) ||
      formData.price <= 0
    ) {
      newErrors.price = 'กรุณาระบุราคาให้มากกว่า 0';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      await createFertilizerMajor(formData);
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'เพิ่มปุ๋ยเรียบร้อยแล้ว',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
      navigate('/admin/fertilizer-prices');
    } catch (err) {
      console.error('Cannot create fertilizer:', err);
      Swal.fire({
        icon: 'error',
        title: 'ผิดพลาด',
        text: 'ไม่สามารถเพิ่มปุ๋ยได้ กรุณาลองใหม่อีกครั้ง',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
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
              <h4 className="card-title mb-0">เพิ่มปุ๋ยหลัก</h4>
              <GenButtonCircle
                color={B_LIST.list.color}
                icon={B_LIST.list.icon}
                link="/admin/fertilizer-prices"
              />
            </div>
            <div className="card-body">
              <div className="col-md-6 mx-auto">
                <div className="mb-3">
                  <GenFormSelect
                    isRequired
                    id="type"
                    name="type"
                    label="ประเภทปุ๋ย"
                    options={Object.values(FertilizerMajorTypes).map(t => ({
                      value: t,
                      name: fertilizerMajorTypeLabels[t],
                    }))}
                    value={formData.type}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        type: e.target.value as FertilizerMajorTypes,
                      })
                    }
                  />
                  {errors.type && (
                    <div className="text-danger small mt-1">{errors.type}</div>
                  )}
                </div>

                <div className="row ">
                  <div className="col-md-4">
                    <GenFormText1
                      isRequired
                      id="inputN"
                      name="N"
                      label="สูตร N"
                      placeholder="Enter N"
                      maxLength={2}
                      value={formData.N != null ? formData.N.toString() : ''}
                      onChange={e => {
                        const v = e.target.value.trim();
                        // restrict length
                        if (v.length > 2) return;
                        const parsed = parseInt(v, 10);
                        setFormData({
                          ...formData,
                          N: v === '' || isNaN(parsed) ? null : parsed,
                        });
                      }}
                      errorMessage={errors.N}
                    />
                  </div>
                  <div className="col-md-4">
                    <GenFormText1
                      isRequired
                      id="inputP"
                      name="P"
                      label="สูตร P"
                      placeholder="Enter P"
                      maxLength={2}
                      value={formData.P != null ? formData.P.toString() : ''}
                      onChange={e => {
                        const v = e.target.value.trim();
                        if (v.length > 2) return;
                        const parsed = parseInt(v, 10);
                        setFormData({
                          ...formData,
                          P: v === '' || isNaN(parsed) ? null : parsed,
                        });
                      }}
                      errorMessage={errors.P}
                    />
                  </div>
                  <div className="col-md-4">
                    <GenFormText1
                      isRequired
                      id="inputK"
                      name="K"
                      label="สูตร K"
                      placeholder="Enter K"
                      maxLength={2}
                      value={formData.K != null ? formData.K.toString() : ''}
                      onChange={e => {
                        const v = e.target.value.trim();
                        if (v.length > 2) return;
                        const parsed = parseInt(v, 10);
                        setFormData({
                          ...formData,
                          K: v === '' || isNaN(parsed) ? null : parsed,
                        });
                      }}
                      errorMessage={errors.K}
                    />
                  </div>
                </div>
                <GenFormSelect
                  isRequired
                  id="unitId"
                  name="unitId"
                  label="หน่วย"
                  options={unitOptions}
                  value={
                    formData.unitId != null ? formData.unitId.toString() : ''
                  }
                  onChange={e => {
                    const v = e.target.value.trim();
                    const parsed = parseInt(v, 10);
                    setFormData({
                      ...formData,
                      unitId: v === '' || isNaN(parsed) ? null : parsed,
                    });
                  }}
                />
                <GenFormText1
                  isRequired
                  id="quantity"
                  name="quantity"
                  label={`ปริมาณ (${units.find(u => u.unitId === formData.unitId)?.initial || ''})`}
                  placeholder="ระบุปริมาณ"
                  value={
                    formData.quantity != null
                      ? formData.quantity.toString()
                      : ''
                  }
                  onChange={e => {
                    const v = e.target.value.trim();
                    const parsed = parseInt(v, 10);
                    setFormData({
                      ...formData,
                      quantity: v === '' || isNaN(parsed) ? null : parsed,
                    });
                  }}
                  errorMessage={errors.quantity}
                />
                <GenFormText1
                  isRequired
                  id="inputPrice"
                  name="price"
                  label="ราคา(บาท)"
                  placeholder="ระบุราคา"
                  value={
                    formData.price != null ? formData.price.toString() : ''
                  }
                  onChange={e => {
                    const v = e.target.value.trim();
                    const parsed = parseInt(v, 10);
                    setFormData({
                      ...formData,
                      price: v === '' || isNaN(parsed) ? null : parsed,
                    });
                  }}
                  errorMessage={errors.price}
                />
                <GenFormText1
                  isRequired={false}
                  id="inputNote"
                  name="note"
                  label="หมายเหตุ"
                  placeholder="หมายเหตุ (ถ้ามี)"
                  value={(formData.note ?? '').toString()}
                  onChange={e =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  errorMessage={errors.note}
                />
                <div className="card-action d-flex justify-content-between mt-4">
                  <button
                    type="submit"
                    className="btn btn-success me-auto"
                    style={{ width: 140 }}
                    onClick={handleSubmit}
                  >
                    เพิ่มปุ๋ยหลัก
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger ms-auto"
                    style={{ width: 120 }}
                    onClick={() => setShowConfirm(true)}
                  >
                    ยกเลิก
                  </button>
                </div>
                {showConfirm && (
                  <ConfirmAlert
                    title={'ยืนยันการยกเลิก'}
                    text={'ต้องการยกเลิกการบันทึกข้อมูลปุ๋ยใช่หรือไม่?'}
                    action={'cancel'}
                    onConfirm={() => navigate(-1)}
                    onCancel={() => setShowConfirm(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FertilizerMajorAdd;
