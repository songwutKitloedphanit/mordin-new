import { useCallback, useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { GenFormText1 } from '@/components/gui/GuiForm';
import { MultiPointSlider2 } from '@/components/gui/RangeSlider';
import FertilizerUsagesSummaryCard from '@/components/pages/fertilizer-usages/FertilizerUsagesSummaryCard';
import {
  getResultGradeById,
  updateResultGrade,
} from '@/services/api/result-grade/ResultGradeApi';
import {
  ResultGradeInfo,
  ResultGradeUpdate,
} from '@/types/result-grade/ResultGrade';

const ResultGradeEdit: React.FC = () => {
  const navigate = useNavigate();
  const { resultGradeId } = useParams();
  const [showColorPalate, setShowColorPalate] = useState<{
    [key: number]: boolean;
  }>({});
  const [resultGradeData, setResultGradeData] = useState<ResultGradeInfo>();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  //formdata schema bro
  const [formData, setFormData] = useState<ResultGradeUpdate>({
    resultGradeLevels: [],
  });

  //serviceFertilizerMinorUsages state
  const [range, setRange] = useState<number[]>([]);
  const getFinalCutoff = useCallback(() => {
    return resultGradeData?.laboratory?.rangeMax ?? 99999;
  }, [resultGradeData?.laboratory?.rangeMax]);

  const [stepText, setStepText] = useState<string>('');

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getResultGradeById(Number(resultGradeId));
        setResultGradeData(data);
        setFormData({
          resultGradeLevels: data?.resultGradeLevels ?? [],
        });
        // setUnit(mockUnits);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (resultGradeId) fetchData();
  }, [resultGradeId]);

  useEffect(() => {
    const length = formData.resultGradeLevels?.length ?? 0;
    if (stepText === '' && length > 0) {
      setStepText(length.toString());
    }
  }, [formData.resultGradeLevels, stepText]);

  const [isSyncing, setIsSyncing] = useState(false);

  // useEffect สำหรับ sync range จาก formData.resultGradeLevels
  useEffect(() => {
    if (isSyncing || !formData.resultGradeLevels) return;

    const cutoffValues = formData.resultGradeLevels
      .map(r => r.cutoffValue)
      .filter((v): v is number => typeof v === 'number');

    if (JSON.stringify(cutoffValues) !== JSON.stringify(range)) {
      setIsSyncing(true);
      setRange(cutoffValues);
      setIsSyncing(false);
    }
  }, [formData.resultGradeLevels, isSyncing, range]);

  console.log('step: ', stepText);
  console.log('range', range);

  useEffect(() => {
    if (range.length === 0) return;
    setFormData(prev => {
      const finalCutoff = getFinalCutoff();
      const prevLevels = prev.resultGradeLevels || [];

      const updatedResultGrade = range.map((cutoff, i) => {
        const prevCutoff = i === 0 ? null : range[i - 1];
        let cutoffText = '';
        if (i === 0) {
          cutoffText = `< ${cutoff}`;
        } else if (cutoff !== finalCutoff) {
          cutoffText = `${prevCutoff} - ${cutoff}`;
        } else {
          cutoffText = `> ${prevCutoff}`;
        }

        const existing = prevLevels[i] || {};

        return {
          ...existing,
          level: i + 1,
          cutoffValue: cutoff,
          cutoffText: cutoffText,
        };
      });

      if (JSON.stringify(prevLevels) === JSON.stringify(updatedResultGrade)) {
        return prev;
      }

      setIsSyncing(true);
      return {
        ...prev,
        resultGradeLevels: updatedResultGrade,
      };
    });
  }, [getFinalCutoff, range]);

  const handleRange = (value: string) => {
    const count = parseInt(value, 10);
    if (isNaN(count) || count < 1) {
      setRange([]);
      return;
    }

    const finalCutoff = getFinalCutoff();
    const min = resultGradeData?.laboratory?.rangeMin || 0;

    // จำนวนหัว slider จริงคือ count - 1 (เพราะหัวสุดท้ายคือ finalCutoff)
    const sliderHandlesCount = count - 1;

    // สร้าง range ใหม่
    const newUsageRange = Array(sliderHandlesCount)
      .fill(min)
      .map((_, i) => range[i] ?? min);

    // เพิ่ม finalCutoff เข้าไปเป็นค่าสุดท้าย
    newUsageRange.push(finalCutoff);

    if (JSON.stringify(newUsageRange) !== JSON.stringify(range)) {
      setRange(newUsageRange);
    }
  };

  const handleUsage = (index: number, inputValue: string) => {
    // ใช้ setFormData เพื่ออัปเดต state ของ formData
    setFormData(prev => {
      // Clone array เดิม เพื่อไม่แก้ไขโดยตรง
      const newUsages = [...prev.resultGradeLevels];

      // อัปเดต object ที่ตำแหน่ง index ด้วยค่าที่ใหม่
      newUsages[index] = {
        ...newUsages[index], // เก็บค่าเดิมไว้
        scoreName: inputValue,
      };

      // คืนค่า formData ใหม่ พร้อมรายการที่ถูกแก้ไข
      return {
        ...prev,
        resultGradeLevels: newUsages,
      };
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await updateResultGrade(Number(resultGradeId), formData);
      console.log('update success', res);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'บันทึกข้อมูลการให้คะแนนสำเร็จ',
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
        text: 'ไม่สามารถบันทึกข้อมูลการให้คะแนนได้',
        icon: 'error',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
    }
  };

  const paletteRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      paletteRefs.current.forEach((ref, idx) => {
        if (ref && !ref.contains(event.target as Node)) {
          setShowColorPalate(prev => ({ ...prev, [idx]: false }));
        }
      });
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  console.log('form data', formData);

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
                  การให้คะแนน {resultGradeData?.laboratory?.shortNameAfter} (
                  {resultGradeData?.laboratory?.unitAfter})
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
                    setRange([]);
                  } else handleRange(e.target.value);
                }}
                type="number"
              />

              <div className="row">
                <div className="col-md-4 col-lg-4">
                  <div className="form-group">
                    <label></label>
                  </div>
                </div>
                <div className="col-md-8 col-lg-8">
                  <MultiPointSlider2
                    value={range.slice(0, -1)} // ตัดค่าสุดท้ายออก (finalCutoff)
                    step={
                      resultGradeData?.laboratory?.shortNameAfter === 'OM' ||
                      resultGradeData?.laboratory?.shortNameAfter.toLocaleUpperCase() ===
                        'EC'
                        ? 0.01
                        : 0.1
                    }
                    min={resultGradeData?.laboratory?.rangeMin as number}
                    max={resultGradeData?.laboratory?.rangeMax as number}
                    onChange={newValues => {
                      // นำค่าสุดท้ายเดิมกลับมาใส่
                      setRange([...newValues, range[range.length - 1]]);
                    }}
                  />
                </div>
              </div>
              {formData.resultGradeLevels.map((v, i) => (
                <div
                  className="row position-relative"
                  key={`result-${v.level}`}
                >
                  <div className="col-md-6">
                    <GenFormText1
                      isRequired={true}
                      id={`result-${v.level}`}
                      name={`result-${v.level}`}
                      label={`ระดับที่ ${v.level}`}
                      placeholder="กรดจัด, ต่ำมาก..."
                      value={v.scoreName ?? ''}
                      onChange={e => handleUsage(i, e.target.value)}
                    />
                  </div>

                  <div className="col-md-6 d-flex align-items-center gap-2 mt-5 position-relative">
                    <p className="mb-0">สี:</p>
                    <button
                      className="border border-dark p-0"
                      type="button"
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: v.color ?? '#ffffff',
                        borderRadius: '5px',
                        cursor: 'pointer',
                      }}
                      onClick={() =>
                        setShowColorPalate(prev => ({
                          ...prev,
                          [i]: !prev[i],
                        }))
                      }
                    />

                    {showColorPalate[i] && (
                      <div
                        ref={el => {
                          paletteRefs.current[i] = el;
                        }}
                        className="position-absolute"
                        style={{
                          top: '-50px',
                          left: '80px',
                          zIndex: 10,
                          background: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '0.5rem',
                          padding: '0.5rem',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {/* ลูกศรทางซ้าย */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '65px',
                            left: '-10px',
                            width: 0,
                            height: 0,
                            borderTop: '8px solid transparent',
                            borderBottom: '8px solid transparent',
                            borderRight: '10px solid #ccc',
                          }}
                        ></div>

                        {/* Color Picker */}
                        <HexColorPicker
                          color={v.color ?? '#ffffff'}
                          onChange={newColor =>
                            setFormData(prev => ({
                              ...prev,
                              resultGradeLevels: prev.resultGradeLevels.map(
                                (item, idx) =>
                                  idx === i
                                    ? { ...item, color: newColor }
                                    : item
                              ),
                            }))
                          }
                        />

                        {/* Input สำหรับกรอกโค้ดสี */}
                        <input
                          type="text"
                          placeholder="เช่น #ffffff"
                          value={v.color ?? '#ffffff'}
                          onChange={e => {
                            const newColor = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              resultGradeLevels: prev.resultGradeLevels.map(
                                (item, idx) =>
                                  idx === i
                                    ? { ...item, color: newColor }
                                    : item
                              ),
                            }));
                          }}
                          style={{
                            marginTop: '0.5rem',
                            width: '100%',
                            padding: '0.25rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="private-action-footer mt-4 d-flex justify-content-between">
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ width: '130px' }}
                  onClick={handleSubmit}
                >
                  บันทึก
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
          text={'คุณต้องการยกเลิกการให้คะแนนหรือไม่?'}
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
                  ระดับการให้คะแนน {resultGradeData?.laboratory?.shortNameAfter}{' '}
                  ({resultGradeData?.laboratory?.unitAfter})
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
                    {resultGradeData?.laboratory?.shortNameAfter} (
                    {resultGradeData?.laboratory?.unitAfter})
                  </th>
                  <th>ระดับคะแนน</th>
                </tr>
              </thead>
              <tbody>
                {formData.resultGradeLevels.map(v => {
                  return (
                    <tr key={v.level}>
                      <td>{v.cutoffText}</td>
                      <td style={{ backgroundColor: `${v.color}` }}>
                        {v.scoreName ?? ''}
                      </td>
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

export default ResultGradeEdit;
