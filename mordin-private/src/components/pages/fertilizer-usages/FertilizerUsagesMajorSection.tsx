import React, { useEffect, useMemo, useState } from 'react';

import { ServiceFertilizerMajorUsageInfo } from '../../../types/fertilizer/ServiceFertilizerMajor';
import { ServiceCategoryInfo } from '../../../types/service-type/ServiceCategories';
import { TimeStampToDate } from '../../../utils/Date';
import { B_LIST, GenButtonCircle } from '../../gui/GuiButton';

interface ServiceFertilizerMajorInterface {
  serviceCategories: ServiceCategoryInfo;
  loading: boolean;
}

interface SoilGradeServiceFertilizerMajorInterface {
  scoreName: string;
  score: number;
  serviceFertilizerMajorUsages: ServiceFertilizerMajorUsageInfo[];
  N: number;
  P: number;
  K: number;
  total: number;
}

const ServiceFertilizerMajor = ({
  serviceCategories,
  loading,
}: ServiceFertilizerMajorInterface) => {
  const [soilGrades, setSoilGrades] =
    useState<SoilGradeServiceFertilizerMajorInterface[]>();
  const [tHeadItems, setTHeadItems] =
    useState<ServiceFertilizerMajorUsageInfo[]>();
  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  useEffect(() => {
    const seen = new Set<string>();
    const header = serviceCategories?.serviceFertilizerMajorUsages?.filter(
      item => {
        if (seen.has(item?.usageType?.name)) return false;
        seen.add(item?.usageType?.name);
        return true;
      }
    );

    seen.clear();

    const soilGrade: SoilGradeServiceFertilizerMajorInterface[] = [];
    // วนลูปข้อมูลการใช้ปุ๋ยทั้งหมดจาก serviceCategories
    serviceCategories?.serviceFertilizerMajorUsages?.map(item => {
      if (item?.fertilizerMajor) {
        setIsEmpty(false);
      }

      // ถ้าเกรดดินนี้ถูกเจอมาแล้ว (เคย push แล้ว)
      if (seen.has(item?.soilGradeLevel?.scoreName)) {
        // หา index ของเกรดดินนี้ใน soilGrade
        const index = soilGrade.findIndex(
          obj => obj?.scoreName === item?.soilGradeLevel?.scoreName
        );

        // เพิ่มข้อมูลการใช้ปุ๋ยเข้าไปในรายการเดิม
        soilGrade[index].serviceFertilizerMajorUsages.push(item);

        // อัปเดตค่าธาตุอาหารรวมของเกรดนั้น (คำนวณจากเปอร์เซ็นต์ x ปริมาณ)
        soilGrade[index].N +=
          (item?.fertilizerMajor?.N / 100) * item?.fertilizerMajor?.quantity;
        soilGrade[index].P +=
          (item?.fertilizerMajor?.P / 100) * item?.fertilizerMajor?.quantity;
        soilGrade[index].K +=
          (item?.fertilizerMajor?.K / 100) * item?.fertilizerMajor?.quantity;

        soilGrade[index].total +=
          item?.fertilizerMajor?.price * item?.fertilizerMajor?.quantity;
      } else {
        // ถ้ายังไม่เคยเจอเกรดนี้มาก่อน
        const fertilizerMajorUsages: ServiceFertilizerMajorUsageInfo[] = [item];

        // สร้าง object ใหม่สำหรับเกรดดินนี้
        const grade: SoilGradeServiceFertilizerMajorInterface = {
          scoreName: item?.soilGradeLevel?.scoreName,
          score: item?.soilGradeLevel?.score,
          serviceFertilizerMajorUsages: fertilizerMajorUsages,
          N: (item?.fertilizerMajor?.N / 100) * item?.fertilizerMajor?.quantity,
          P: (item?.fertilizerMajor?.P / 100) * item?.fertilizerMajor?.quantity,
          K: (item?.fertilizerMajor?.K / 100) * item?.fertilizerMajor?.quantity,
          total: item?.fertilizerMajor?.price * item?.volume, // ค่าเริ่มต้นของต้นทุนรวม ยังไม่คำนวณตรงนี้
        };

        // เพิ่มเข้า array และ mark ว่าเจอเกรดนี้แล้ว
        soilGrade.push(grade);
        seen.add(item?.soilGradeLevel?.scoreName);
      }
    });

    setTHeadItems(header);
    setSoilGrades(soilGrade);
  }, [serviceCategories]);

  const fertilizerPriceUpdateDate = useMemo(() => {
    if (!serviceCategories?.serviceFertilizerMajorUsages) return null;

    return serviceCategories.serviceFertilizerMajorUsages.reduce<Date | null>(
      (latest, item) => {
        const updatedAt = new Date(Number(item?.fertilizerMajor?.updatedAt));
        return !latest || updatedAt > latest ? updatedAt : latest;
      },
      null
    );
  }, [serviceCategories]);

  const fertilizerMajorUpdateDate = useMemo(() => {
    if (!serviceCategories?.serviceFertilizerMajorUsages) return null;

    return serviceCategories.serviceFertilizerMajorUsages.reduce<Date | null>(
      (latest, item) => {
        const updatedAt = new Date(Number(item?.updatedAt));
        return !latest || updatedAt > latest ? updatedAt : latest;
      },
      null
    );
  }, [serviceCategories]);

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="private-card">
          <div className="private-card-header">
            <div className="row row-demo-grid">
              <div
                className="col-md-4 col-sm-6 col-6"
                style={{ textAlign: 'left' }}
              >
                <h4 className="private-card-title">
                  การให้ธาตุอาหารหลัก ({serviceCategories?.name})
                </h4>
              </div>
              <div
                className="col-md-4 col-sm-6 col-6 ms-auto"
                style={{ textAlign: 'right' }}
              >
                <GenButtonCircle
                  color={B_LIST.edit.color}
                  icon={B_LIST.edit.icon}
                  link={`/admin/fertilizer-usages/${serviceCategories?.serviceCategoryId}/edit-major`}
                />
              </div>
            </div>
          </div>
          <div className="private-card-body">
            <p className="text-muted text-left">
              แก้ไขข้อมูลการให้ธาตุอาหารล่าสุด:{' '}
              {fertilizerMajorUpdateDate
                ? TimeStampToDate(fertilizerMajorUpdateDate.getTime())
                : ''}{' '}
              แก้ไขข้อมูลราคาปุ๋ยล่าสุด:{' '}
              {fertilizerPriceUpdateDate
                ? TimeStampToDate(fertilizerPriceUpdateDate.getTime())
                : ''}
            </p>
            <div className="table-responsive text-center">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : // ตรวจสอบว่ามีข้อมูลใน ratonCane หรือไม่
              isEmpty ? (
                <p className="text-center text-muted">
                  ยังไม่มีการบันทึกข้อมูล
                </p>
              ) : (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th rowSpan={2}>เกรดดิน</th>
                      {tHeadItems?.map(
                        (serviceFertilizerMajorUsages, index) => (
                          <React.Fragment key={index}>
                            <th rowSpan={2}>
                              {serviceFertilizerMajorUsages?.usageType?.name}
                            </th>
                            <th rowSpan={2}>
                              อัตราการใช้ (
                              {
                                serviceFertilizerMajorUsages?.fertilizerMajor
                                  ?.unit?.name
                              }
                              )
                            </th>
                          </React.Fragment>
                        )
                      )}
                      <th colSpan={3} className="text-center">
                        ธาตุอาหารรวม
                      </th>
                      <th rowSpan={2}>ต้นทุนปุ๋ยต่อไร่ (บาท)</th>
                    </tr>
                    <tr>
                      <th>N</th>
                      <th>P</th>
                      <th>K</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soilGrades?.map((grade, index) => (
                      <tr key={index}>
                        <td>{grade?.scoreName}</td>
                        {Array.from({
                          length: Math.max(
                            ...soilGrades.map(
                              item => item.serviceFertilizerMajorUsages.length
                            )
                          ),
                        }).map((_, index) => (
                          <React.Fragment key={index}>
                            {grade.serviceFertilizerMajorUsages[index] ? (
                              <>
                                <td>
                                  {
                                    grade?.serviceFertilizerMajorUsages[index]
                                      ?.fertilizerMajor?.formular
                                  }
                                </td>
                                <td>
                                  {
                                    grade?.serviceFertilizerMajorUsages[index]
                                      ?.fertilizerMajor?.quantity
                                  }
                                </td>
                              </>
                            ) : (
                              <>
                                <td>-</td>
                                <td>-</td>
                              </>
                            )}
                          </React.Fragment>
                        ))}
                        <td>{grade?.N ? grade.N : '-'}</td>
                        <td>{grade?.P ? grade.P : '-'}</td>
                        <td>{grade?.K ? grade.K : '-'}</td>
                        <td>{grade?.total ? grade.total : '-'}</td>
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
  );
};

export default ServiceFertilizerMajor;
