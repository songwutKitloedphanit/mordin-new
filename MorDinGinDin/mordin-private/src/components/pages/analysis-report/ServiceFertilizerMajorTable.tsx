import React from 'react';

import { PrintReportInterface } from '@/types/qr-code/Report';
import { TimeStampToDate } from '@/utils/Date';
import { formatNumber } from '@/utils/Number';

interface ServiceFertilizerMajorTableProps {
  reportData: PrintReportInterface;
  loading: boolean;
}

const ServiceFertilizerMajorTable: React.FC<
  ServiceFertilizerMajorTableProps
> = ({ reportData, loading }) => {
  return (
    <div className="card mt-4">
      <div className="card-header">
        <div className="row">
          <div className="col text-start">
            <h4 className="card-title">การให้ธาตุอาหารหลัก</h4>
          </div>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : reportData.ferMajorLandUsages?.length > 0 ? (
          <>
            <p className="text-muted">
              แก้ไขข้อมูการให้ธาตุอาหารล่าสุด:{' '}
              {reportData.ferMajorLandUsages &&
                TimeStampToDate(
                  reportData.ferMajorLandUsages[0]?.updatedAt
                )}{' '}
            </p>

            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th rowSpan={2}>อ้อย</th>
                    <th rowSpan={2}>เกรดดิน</th>
                    {reportData.usageType?.map(usage => (
                      <React.Fragment key={usage.usageTypeId}>
                        <th rowSpan={2}>{usage.name}</th>
                        <th rowSpan={2}>อัตราการใช้</th>
                      </React.Fragment>
                    ))}
                    <th colSpan={3} className="text-center">
                      ธาตุอาหารรวม
                    </th>
                    <th>ต้นทุนปุ๋ยต่อไร่</th>
                  </tr>
                  <tr>
                    <th>N</th>
                    <th>P</th>
                    <th>K</th>
                    <th>(บาท)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.serviceType?.serviceCategories.map(cat => {
                    // ตัวแปรรวมสำหรับต่อไร่
                    let totalNPerRai = 0;
                    let totalPPerRai = 0;
                    let totalKPerRai = 0;
                    let totalPricePerRai = 0;

                    // ตัวแปรรวมสำหรับทั้งหมด (คูณกับ areaSize)
                    let totalNAll = 0;
                    let totalPAll = 0;
                    let totalKAll = 0;
                    let totalPriceAll = 0;

                    return (
                      <React.Fragment key={cat.serviceCategoryId}>
                        {/* แถวแสดงข้อมูลต่อไร่ */}
                        <tr>
                          <td>{cat.name} (ต่อไร่)</td>
                          <td>
                            {reportData.ferMajorLandUsages.find(
                              fer =>
                                fer.serviceFertilizerMajorUsage
                                  .serviceCategoryId === cat.serviceCategoryId
                            )?.gradeText || '-'}
                          </td>

                          {reportData.usageType?.map(usage => {
                            const fertilizer =
                              reportData.ferMajorLandUsages.find(
                                fer =>
                                  fer.serviceFertilizerMajorUsage
                                    .serviceCategoryId ===
                                    cat.serviceCategoryId &&
                                  fer.serviceFertilizerMajorUsage
                                    .usageTypeId === usage.usageTypeId
                              );

                            if (fertilizer) {
                              totalNPerRai +=
                                fertilizer.serviceFertilizerMajorUsage
                                  .fertilizerMajor.N *
                                (fertilizer.useRate / 100);
                              totalPPerRai +=
                                fertilizer.serviceFertilizerMajorUsage
                                  .fertilizerMajor.P *
                                (fertilizer.useRate / 100);
                              totalKPerRai +=
                                fertilizer.serviceFertilizerMajorUsage
                                  .fertilizerMajor.K *
                                (fertilizer.useRate / 100);
                              totalPricePerRai += fertilizer.costPerRai;
                            }

                            return (
                              <React.Fragment key={usage.usageTypeId}>
                                <td className="text-center">
                                  {fertilizer
                                    ? fertilizer.serviceFertilizerMajorUsage
                                        .fertilizerMajor.formular
                                    : '-'}
                                </td>
                                <td className="text-center">
                                  {fertilizer
                                    ? formatNumber(fertilizer.useRate) +
                                      ` ${fertilizer.serviceFertilizerMajorUsage.fertilizerMajor.unit.name}`
                                    : '-'}
                                </td>
                              </React.Fragment>
                            );
                          })}

                          <td className="text-center">
                            {formatNumber(totalNPerRai)}
                          </td>
                          <td className="text-center">
                            {formatNumber(totalPPerRai)}
                          </td>
                          <td className="text-center">
                            {formatNumber(totalKPerRai)}
                          </td>
                          <td className="text-center">
                            {formatNumber(totalPricePerRai)}
                          </td>
                        </tr>

                        {/* แถวแสดงข้อมูลรวมทั้งหมด */}
                        <tr>
                          <td>
                            {cat.name} ({formatNumber(reportData.areaSize)} ไร่)
                          </td>
                          <td>
                            {reportData.ferMajorLandUsages.find(
                              fer =>
                                fer.serviceFertilizerMajorUsage
                                  .serviceCategoryId === cat.serviceCategoryId
                            )?.gradeText || '-'}
                          </td>

                          {reportData.usageType?.map(usage => {
                            const fertilizer =
                              reportData.ferMajorLandUsages.find(
                                fer =>
                                  fer.serviceFertilizerMajorUsage
                                    .serviceCategoryId ===
                                    cat.serviceCategoryId &&
                                  fer.serviceFertilizerMajorUsage
                                    .usageTypeId === usage.usageTypeId
                              );

                            if (fertilizer) {
                              totalNAll +=
                                fertilizer.serviceFertilizerMajorUsage
                                  .fertilizerMajor.N *
                                (fertilizer.useRate / 100) *
                                reportData.areaSize;
                              totalPAll +=
                                fertilizer.serviceFertilizerMajorUsage
                                  .fertilizerMajor.P *
                                (fertilizer.useRate / 100) *
                                reportData.areaSize;
                              totalKAll +=
                                fertilizer.serviceFertilizerMajorUsage
                                  .fertilizerMajor.K *
                                (fertilizer.useRate / 100) *
                                reportData.areaSize;
                              totalPriceAll +=
                                fertilizer.costPerRai * reportData.areaSize;
                            }

                            return (
                              <React.Fragment key={usage.usageTypeId}>
                                <td className="text-center">
                                  {fertilizer
                                    ? fertilizer.serviceFertilizerMajorUsage
                                        .fertilizerMajor.formular
                                    : '-'}
                                </td>
                                <td className="text-center">
                                  {fertilizer
                                    ? formatNumber(
                                        fertilizer.useRate * reportData.areaSize
                                      ) +
                                      ` ${fertilizer.serviceFertilizerMajorUsage.fertilizerMajor.unit.name}`
                                    : '-'}
                                </td>
                              </React.Fragment>
                            );
                          })}

                          <td className="text-center">
                            {formatNumber(totalNAll)}
                          </td>
                          <td className="text-center">
                            {formatNumber(totalPAll)}
                          </td>
                          <td className="text-center">
                            {formatNumber(totalKAll)}
                          </td>
                          <td className="text-center">
                            {formatNumber(totalPriceAll)}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-danger">ไม่พบข้อมูลการให้ธาตุอาหารหลัก</div>
        )}
      </div>
    </div>
  );
};

export default ServiceFertilizerMajorTable;
