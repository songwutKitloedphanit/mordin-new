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

import { TableSkeleton } from '@/components/gui/Skeleton';
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
        setFertilizerData(response);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
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

      return { ...prev, soilGrades: newSoilGrades };
    });
  }, [serviceType]);

  return (
    <>
      {/* KPI Summary */}
      <FertilizerUsagesSummaryCard />

      {/* Service Type Tabs */}
      <GenButtonSquare
        changeIndex={setIndex}
        currentIndex={index}
        names={fertilizerData?.map(st => st.name)}
      />

      {/* Soil Grade Table */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-chart-bar me-2" />
                คะแนนความอุดมสมบูรณ์ของดิน
              </h4>
              <GenButtonCircle
                color={B_LIST.edit.color}
                icon={B_LIST.edit.icon}
                link={`/admin/fertilizer-usages/${serviceType?.serviceTypeId}/edit-score`}
              />
            </div>
            <div className="private-card-body">
              <div className="d-flex flex-wrap gap-3 mb-3">
                <small className="text-muted">
                  <i className="fas fa-clock me-1" />
                  แก้ไขล่าสุด: {TimeStampToDate(serviceType?.updatedAt)}
                </small>
                <small className="text-muted">
                  Total score ={' '}
                  {serviceType?.soilGrades
                    ?.filter(item => item?.laboratory?.shortNameAfter)
                    .map(item => `score( ${item.laboratory?.shortNameAfter} )`)
                    .join(' + ')}
                </small>
              </div>
              <div className="table-responsive">
                {loading ? (
                  <TableSkeleton rows={5} cols={5} />
                ) : serviceType?.soilGrades?.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-inbox fa-2x mb-2 d-block opacity-50" />
                    ยังไม่มีการบันทึกข้อมูล
                  </div>
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
      <div className="row mb-2">
        <div className="col-12">
          <h4 className="fw-bold mb-0">
            <i className="fas fa-star me-2 text-warning" />
            การให้คะแนน
          </h4>
        </div>
      </div>
      <div className="row g-3 mb-4">
        {serviceType?.resultGrades?.map(resultGrade => (
          <ResultGradeCard
            key={resultGrade.resultGradeId}
            ResultGrades={resultGrade}
            loading={loading}
          />
        ))}
      </div>

      {/* Major Fertilizer */}
      {serviceType?.serviceCategories?.map(serviceCategories => (
        <ServiceFertilizerMajor
          key={serviceCategories.serviceCategoryId}
          serviceCategories={serviceCategories}
          loading={loading}
        />
      ))}

      {/* Minor Fertilizer */}
      <div className="row mb-2">
        <div className="col-12">
          <h4 className="fw-bold mb-0">
            <i className="fas fa-seedling me-2 text-success" />
            การปรับปรุงดิน
          </h4>
        </div>
      </div>
      <div className="row g-3 mb-4">
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
