import { useEffect, useState } from 'react';

import {
  B_LIST,
  GenButtonCircle,
  GenButtonSquare,
} from '../../../components/gui/GuiButton';
import ServiceFertilizerMajor from '../../../components/pages/fertilizer-usages/FertilizerUsagesMajorSection';
import ServiceFertilizerMinor from '../../../components/pages/fertilizer-usages/FertilizerUsagesMinorSection';
import { getAllServiceTypesWithFertilizerUsages } from '../../../services/api/service-type/ServiceTypeApi';
import { ServiceTypeWithAllInfo } from '../../../types/service-type/ServiceTypes';
import { SoilGradeInfo } from '../../../types/soil-grade/SoilGrades';
import { TimeStampToDate } from '../../../utils/Date';

import FertilizerUsagesSummaryCard from '@/components/pages/fertilizer-usages/FertilizerUsagesSummaryCard';
import ResultGradeCard from '@/components/pages/fertilizer-usages/ResultGradeCard';

const FertilizerUsages = () => {
  const [loading, setLoading] = useState(true);
  const [fertilizerData, setFertilizerData] = useState<
    ServiceTypeWithAllInfo[] | undefined
  >();
  const [serviceType, setServiceType] = useState<ServiceTypeWithAllInfo>();
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllServiceTypesWithFertilizerUsages();
        console.log('resp?', response);
        setFertilizerData(response);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (fertilizerData) {
      setServiceType(fertilizerData[index]);
    }
  }, [index, fertilizerData]);

  useEffect(() => {
    const totalScoreObject: SoilGradeInfo | undefined =
      serviceType?.soilGrades?.find(item => item.parameter === 'Total Score');
    if (!totalScoreObject) return;

    setServiceType(prev => {
      if (!prev) return prev;
      const newSoilGrades = (prev.soilGrades ?? [])
        .filter(item => item.parameter !== 'Total Score')
        .concat(totalScoreObject);

      const isSame =
        JSON.stringify(prev.soilGrades) === JSON.stringify(newSoilGrades);
      if (isSame) return prev;

      return {
        ...prev,
        soilGrades: newSoilGrades,
      };
    });
  }, [serviceType]);

  return (
    <>
      {/* Card Summary */}
      <FertilizerUsagesSummaryCard />

      <GenButtonSquare
        changeIndex={setIndex}
        currentIndex={index}
        names={fertilizerData?.map(serviceType => serviceType.name)}
      />

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">คะแนนความอุดมสมบูรณ์ของดิน</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.edit.color}
                    icon={B_LIST.edit.icon}
                    link={`/admin/fertilizer-usages/${serviceType?.serviceTypeId}/edit-score`}
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <p className="text-muted">
                แก้ไขข้อมูลการให้คะแนน:{' '}
                {TimeStampToDate(serviceType?.updatedAt)}
              </p>
              <p className="text-muted">{`Total score = ${serviceType?.soilGrades
                ?.filter(item => item?.laboratory?.shortNameAfter)
                .map(item => `score( ${item.laboratory?.shortNameAfter} )`)
                .join(' + ')}`}</p>
              <div className="table-responsive">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : // ตรวจสอบว่ามีข้อมูลใน ratonCane หรือไม่
                serviceType?.soilGrades?.length === 0 ? (
                  <p className="text-center text-muted">
                    ยังไม่มีการบันทึกข้อมูล
                  </p>
                ) : (
                  <table className="table table-bordered text-center">
                    <thead>
                      <tr>
                        <th>ระดับความอุดมสมบูรณ์</th>
                        <th>คะแนน</th>
                        {serviceType?.soilGrades?.map(soilGrade => (
                          <th key={soilGrade.soilGradeId}>
                            {soilGrade.parameter}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {serviceType?.soilGrades
                        ?.reduce((max, current) =>
                          current.soilGradeLevels.length >
                          max.soilGradeLevels.length
                            ? current
                            : max
                        )
                        .soilGradeLevels?.map(soilGradeLevels => (
                          <tr key={soilGradeLevels.soilGradeLevelId}>
                            <td>{soilGradeLevels.scoreName}</td>
                            <td>{soilGradeLevels.score}</td>
                            {serviceType?.soilGrades?.map(soilGrade => (
                              <td key={soilGrade.soilGradeId}>
                                {
                                  soilGrade?.soilGradeLevels?.find(
                                    obj => obj.score === soilGradeLevels.score
                                  )?.cutoffText
                                }
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Grade */}

      <div className="row">
        <p className="h4 fw-bold">การให้คะแนน</p>
      </div>
      <div className="row mt-4">
        {serviceType?.resultGrades?.map(resultGrade => (
          <ResultGradeCard
            key={resultGrade.resultGradeId}
            ResultGrades={resultGrade}
            loading={loading}
          />
        ))}
      </div>

      {/* Major */}
      {serviceType?.serviceCategories?.map(serviceCategories => (
        <ServiceFertilizerMajor
          key={serviceCategories.serviceCategoryId}
          serviceCategories={serviceCategories}
          loading={loading}
        />
      ))}

      {/* Minor */}
      <div className="row">
        <p className="h4 fw-bold">การปรับปรุงดิน</p>
      </div>
      <div className="row mt-4">
        {serviceType?.serviceFertilizerMinors?.map(serviceFertilizerMinors => (
          <ServiceFertilizerMinor
            key={serviceFertilizerMinors.serviceFertilizerMinorId}
            loading={loading}
            serviceFertilizerMinors={serviceFertilizerMinors}
          />
        ))}
      </div>
    </>
  );
};

export default FertilizerUsages;
