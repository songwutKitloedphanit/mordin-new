import { FertilizerMinorLandUsages } from '@/types/fertilizer/FertilizerMinor';
import { formatNumber } from '@/utils/Number';

interface ServiceFertilizerMinorTableProps {
  servMinor: FertilizerMinorLandUsages[];
  loading: boolean;
}

const ServiceFertilizerMinorTable: React.FC<
  ServiceFertilizerMinorTableProps
> = ({ servMinor, loading }) => {
  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div className="col text-start">
                  <h4 className="private-card-title">การให้ธาตุอาหารรอง</h4>
                </div>
              </div>
            </div>
            <div className="private-card-body">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : servMinor?.length > 0 ? (
                <>
                  {/* Visual Recommendation Cards */}
                  <div className="mb-4 text-start">
                    <h5 className="fw-bold text-dark mb-3">
                      <i className="fas fa-mountain me-2 text-warning" />
                      คำแนะนำการปรับปรุงดิน (ธาตุอาหารรอง / สารปรับปรุงดิน)
                    </h5>
                    <div className="d-flex flex-column gap-2 mb-4">
                      {servMinor.map(item => (
                        <div
                          key={item.fertilizerMinorLandUsageId}
                          className="d-flex gap-3 align-items-center rounded-3 p-3"
                          style={{
                            backgroundColor: 'rgba(217, 143, 12, 0.06)',
                            borderLeft: '4px solid #d98f0c',
                          }}
                        >
                          <div
                            className="rounded-circle p-2 bg-warning-subtle text-warning d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                          >
                            <i className="fas fa-mountain fs-5 text-warning" />
                          </div>
                          <div className="flex-grow-1">
                            <span className="fw-bold text-dark">
                              {item.fertilizerMinorName}
                            </span>
                            <div className="text-muted small mt-1">
                              อัตรา {formatNumber(item.useRatePerRai)} กก./ไร่
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="fs-5 fw-bold text-warning">
                              {formatNumber(item.totalUsage)} กก.
                            </span>
                            <div className="text-muted small mt-0.5">
                              รวมทั้งหมด
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="my-4 opacity-25" />

                  <div className="table-responsive">
                    <table className="table table-bordered table-striped table-hover">
                      <tbody>
                        <tr>
                          {/* <th align="center">ผลวิเคระห์</th> */}
                          <th align="center">ธาตุอาหารรอง</th>
                          <th align="center">อัตราการใช้ต่อไร่</th>
                          <th align="center">อัตราการใช้ทั้งหมด</th>
                          <th align="center">ราคาต่อไร่</th>
                          <th align="center">ราคาทั้งหมด</th>
                        </tr>

                        {servMinor?.map(item => (
                          <tr key={item.fertilizerMinorLandUsageId}>
                            {/* <td align="center"></td> */}
                            <td align="center">{item.fertilizerMinorName}</td>
                            <td align="center">
                              {formatNumber(item.useRatePerRai)}
                            </td>
                            <td align="center">
                              {formatNumber(item.totalUsage)}
                            </td>
                            <td align="center">
                              {formatNumber(item.pricePerRai)}
                            </td>

                            <td align="center">
                              {formatNumber(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-danger">ไม่พบข้อมูลการให้ธาตุอาหารรอง</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceFertilizerMinorTable;
