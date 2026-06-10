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
                <div className="table-responsive">
                  <table className="table table-bordered">
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

