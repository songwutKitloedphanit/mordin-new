//GUI
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert.tsx';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import {
  DoubleRangeSlider,
  MultiPointPHSlider,
} from '../../../components/gui/RangeSlider';
//api
// import { getAllFertilizerMajors } from '../../../services/api/fertilizer/FertilizerMajorApi';
// import { getAllFertilizerMinors } from '../../../services/api/fertilizer/FertilizerMinorApi';
import { getServiceTypeForSoilGradeEdit } from '../../../services/api/service-type/ServiceTypeApi.ts';
import { updateSoilGrade } from '../../../services/api/soil-grade/SoilGradeApi.ts';
//type
// import { FertilizerMajor } from '../../../types/fertilizer/FertilizerMajor';
// import { FertilizerMinor } from '../../../types/fertilizer/FertilizerMinor.ts';
import { ServiceTypeWithAllInfo } from '../../../types/service-type/ServiceTypes.ts';
import { SoilGradeLevelUpdateInput } from '../../../types/soil-grade/SoilGradeLevels.ts';
import { SoilGradeUpdateInput } from '../../../types/soil-grade/SoilGrades';

import FertilizerUsagesSummaryCard from '@/components/pages/fertilizer-usages/FertilizerUsagesSummaryCard.tsx';

const SoilGradeEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const serviceTypeId = Number(id);
  // const [mainData, setMainData] = useState<FertilizerMajor[]>([]);
  // const [secData, setSecData] = useState<FertilizerMinor[]>([]);
  const [serviceTypeData, setServiceType] = useState<ServiceTypeWithAllInfo>();
  const [soilGrade, setSoilGrade] = useState<SoilGradeUpdateInput[]>([]);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [sliderValues, setSliderValues] = useState<Map<number, number[]>>(
    new Map()
  );

  // useEffect(() => {
  //   const fetchMain = async () => {
  //     try {
  //       const data = await getAllFertilizerMajors();
  //       setMainData(data);
  //     } catch (error) {
  //       console.error('Failed to load fertilizers:', error);
  //     }
  //   };
  //   fetchMain();

  //   const fetchSec = async () => {
  //     try {
  //       const data = await getAllFertilizerMinors();
  //       setSecData(data);
  //     } catch (error) {
  //       console.error('Failed to load soil amendments:', error);
  //     }
  //   };
  //   fetchSec();
  // }, []);

  useEffect(() => {
    const fetchServiceType = async () => {
      try {
        setLoading(true);
        const data = await getServiceTypeForSoilGradeEdit(serviceTypeId);
        setServiceType(data);
        const soilGradeData = data.soilGrades.map(
          (soil: SoilGradeUpdateInput) => ({
            soilGradeId: soil.soilGradeId,
            serviceTypeId: soil.serviceTypeId,
            laboratoryId: soil.laboratoryId,
            parameter: soil.parameter,
            soilGradeLevels: soil.soilGradeLevels.map(level => ({
              soilGradeLevelId: level.soilGradeLevelId,
              level: level.level,
              cutoffValue: level.cutoffValue,
              cutoffText: level.cutoffText,
              score: level.score,
              scoreName: level.scoreName,
            })),
          })
        );
        setSoilGrade(soilGradeData);

        // Extract initial slider values from the data
        const initialValues = new Map<number, number[]>();
        data.soilGrades.forEach((grade: SoilGradeUpdateInput) => {
          const values = extractSliderValues(grade);
          if (values.length > 0) {
            initialValues.set(grade.soilGradeId, values);
          }
        });
        setSliderValues(initialValues);
      } catch (error) {
        console.error('Failed to load service type:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServiceType();
  }, [serviceTypeId]);

  // Helper function to extract slider values from soil grade levels
  const extractSliderValues = (grade: SoilGradeUpdateInput): number[] => {
    const levels = grade.soilGradeLevels;
    if (!levels || levels.length === 0) return [];

    // Sort by level to ensure correct order
    const sortedLevels = [...levels].sort(
      (a, b) => (a.level ?? 0) - (b.level ?? 0)
    );

    // Extract cutoff values, filtering out null/undefined
    const values = sortedLevels
      .map(level => level.cutoffValue)
      .filter((val): val is number => val !== null && val !== undefined);

    return values.length > 0 ? values : [];
  };

  const updateSoilGradeLevels = (
    existingLevels: SoilGradeLevelUpdateInput[],
    sliderValues: number[],
    name: string | undefined
  ): SoilGradeLevelUpdateInput[] => {
    return existingLevels.map((level, index) => {
      let cutoffValue: number | null = null;
      let cutoffText = '';

      console.log('sliderValue', sliderValues);
      if (name === 'pH') {
        if (level.scoreName === 'ต่ำ') {
          cutoffValue = sliderValues[0];
          cutoffText = `${name} < ${sliderValues[0]} , ${name} > ${sliderValues[2]}`;
        } else if (level.scoreName === 'สูง') {
          cutoffValue = sliderValues[2];
          cutoffText = `${sliderValues[0]} โค ${name} โฅ ${sliderValues[1]}`;
        } else {
          cutoffValue = sliderValues[1];
          cutoffText = `${sliderValues[1]} < ${name} โค ${sliderValues[2]}`;
        }
      } else {
        if (level.scoreName === 'ต่ำ') {
          cutoffValue = sliderValues[0];
          cutoffText = `${name} โค ${cutoffValue}`;
        } else if (level.scoreName === 'สูง') {
          cutoffValue = sliderValues[sliderValues.length - 1];
          cutoffText = `${name} > ${cutoffValue}`;
        } else {
          const lower = sliderValues[index - 1];
          const upper = sliderValues[index];
          cutoffValue = lower;
          cutoffText = `${lower} < ${name} โค ${upper}`;
        }
      }
      return {
        ...level,
        cutoffValue,
        cutoffText,
      };
    });
  };

  const handleSliderChange = (values: number[], targetSoilGradeId: number) => {
    const selectedvalue = serviceTypeData?.soilGrades.find(
      soil => soil.soilGradeId == targetSoilGradeId
    );
    const updatedSoilGrades = soilGrade.map(grade => {
      if (grade.soilGradeId !== targetSoilGradeId) return grade;

      return {
        ...grade,
        soilGradeLevels: updateSoilGradeLevels(
          grade.soilGradeLevels,
          values,
          selectedvalue?.laboratoryId
            ? selectedvalue.laboratory.shortNameAfter
            : selectedvalue?.parameter
        ),
      };
    });

    setSoilGrade(updatedSoilGrades);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      console.log('soilGrade', soilGrade);
      const res = await updateSoilGrade(soilGrade);
      console.log('อัปเดตคะแนนความอุดมสมบูรณ์ของดินสำเร็จ:', res);
      setSaving(false);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'บันทึกคะแนนความอุดมสมบูรณ์ของดินสำเร็จ',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate('/admin/fertilizer-usages');
      });
    } catch (error) {
      setSaving(false);
      console.error('อัปเดตคะแนนความอุดมสมบูรณ์ของดินไม่สำเร็จ:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถบันทึกคะแนนความอุดมสมบูรณ์ของดินได้',
        icon: 'error',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
    }
  };

  // const mainCount = mainData.length;
  // const secCount = secData.length;
  // const numericSec = secData.filter(
  //   item => typeof item.pricePerUnit === 'number'
  // );

  // const avgBagPrice = mainCount
  //   ? mainData.reduce((sum, item) => sum + item.price, 0) / mainCount
  //   : 0;

  // const avgSecPrice = numericSec.length
  //   ? numericSec.reduce((sum, item) => sum + item.pricePerUnit, 0) /
  //     numericSec.length
  //   : 0;

  console.log('soilGrade', soilGrade);

  return (
    <div>
      {/* Card Summary */}
      <FertilizerUsagesSummaryCard />

      {/* Saving Modal */}
      {saving && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="spinner-border text-light"
            role="status"
            style={{ width: '3rem', height: '3rem' }}
          >
            <span className="visually-hidden">Saving...</span>
          </div>
          <p className="text-light mt-3" style={{ fontSize: '1.1rem' }}>
            กำลังบันทึกข้อมูล...
          </p>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-10 col-sm-10 col-10"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="private-card-title">
                    คะแนนความอุดมสมบูรณ์ของดิน ({serviceTypeData?.name})
                  </h4>
                </div>
                <div
                  className="col-md-2 col-sm-2 col-2 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.list.color}
                    icon={B_LIST.list.icon}
                    link="/admin/fertilizer-usages"
                  />
                </div>
              </div>
            </div>
            <div
              className="private-card-body"
              style={{ position: 'relative', minHeight: '300px' }}
            >
              {loading && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                  }}
                >
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              <div className="col-md-12 ms-auto me-auto">
                {!loading &&
                  serviceTypeData?.soilGrades?.map(grade => {
                    const initialValues = sliderValues.get(grade.soilGradeId);
                    return (
                      <div className="row" key={grade.soilGradeId}>
                        <div className="col-md-4 col-lg-4">
                          <div className="form-group">
                            <label>คะแนน {grade.parameter}</label>
                          </div>
                        </div>
                        <div className="col-md-8 col-lg-8">
                          {grade.laboratory?.shortNameAfter === 'pH' &&
                          grade.laboratory != null ? (
                            <MultiPointPHSlider
                              min={grade.laboratory?.rangeMin}
                              max={grade.laboratory?.rangeMax}
                              pointsCount={3}
                              initialValues={initialValues}
                              onChange={values =>
                                handleSliderChange(values, grade.soilGradeId)
                              }
                            />
                          ) : (
                            <DoubleRangeSlider
                              min={grade.laboratory?.rangeMin ?? 0}
                              max={grade.laboratory?.rangeMax ?? 10}
                              step={
                                // Safely access shortNameAfter with optional chaining
                                grade.laboratory?.shortNameAfter?.toUpperCase() ===
                                'EC'
                                  ? 0.01
                                  : 0.1
                              }
                              value={
                                initialValues && initialValues.length >= 2
                                  ? [
                                      initialValues[0],
                                      initialValues[initialValues.length - 1],
                                    ]
                                  : undefined
                              }
                              onChange={values =>
                                handleSliderChange(values, grade.soilGradeId)
                              }
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}

                <div className="private-action-footer">
                  <div className="row row-demo-grid">
                    <button
                      type="submit"
                      className="btn btn-success"
                      style={{ width: '120px' }}
                      onClick={handleSubmit}
                    >
                      แก้ไขคะแนน
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger ms-auto"
                      style={{ width: '120px' }}
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
            title={'ยืนยันการยกเลิก'}
            text={'คุณต้องการยกเลิกการแก้ไขคะแนนความอุดมสมบูรณ์ของดินหรือไม่?'}
            action={'cancel'}
            onConfirm={() => navigate(-1)}
            onCancel={() => setShowConfirm(false)}
          />
        )}
        <div className="col-md-6">
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-10 col-sm-10 col-10"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="private-card-title">
                    คะแนนความอุดมสมบูรณ์ของดิน ({serviceTypeData?.name})
                  </h4>
                </div>
                <div
                  className="col-md-2 col-sm-2 col-2 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  &nbsp;
                </div>
              </div>
            </div>
            <div className="private-card-body">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>ระดับความอุดมสมบูรณ์</th>
                    {soilGrade[0]?.soilGradeLevels.map(level => (
                      <th key={level.soilGradeLevelId}>{level.scoreName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>คะแนน</th>
                    {soilGrade[0]?.soilGradeLevels.map(level => (
                      <td key={level.soilGradeLevelId} align="center">
                        {level.score}
                      </td>
                    ))}
                  </tr>
                  {soilGrade?.map(grade => (
                    <tr key={grade.soilGradeId}>
                      <th>{grade.parameter}</th>
                      {grade.soilGradeLevels.map(level => (
                        <td
                          key={`level-${grade.soilGradeId}-${level.soilGradeLevelId}`}
                          align="center"
                        >
                          {level.cutoffText}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilGradeEdit;
