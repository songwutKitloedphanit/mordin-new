import { ServiceFertilizerMinorInfo } from '../../../types/fertilizer/ServiceFertilizerMinor';
import { B_LIST, GenButtonCircle } from '../../gui/GuiButton';

interface ServiceFertilizerMinorInterface {
  serviceFertilizerMinors: ServiceFertilizerMinorInfo;
  loading: boolean;
}

const ServiceFertilizerMinor = ({
  serviceFertilizerMinors,
  loading,
}: ServiceFertilizerMinorInterface) => {
  return (
    <div className="col-md-4">
      <div className="private-card">
        <div className="private-card-header">
          <div className="row row-demo-grid d-flex justify-content-between">
            <div
              className="col-md-8 col-sm-6 col-6 "
              style={{ textAlign: 'left' }}
            >
              <h4 className="private-card-title">
                {serviceFertilizerMinors?.fertilizerMinor?.name}
              </h4>
            </div>
            <div
              className="col-md-4 col-sm-6 col-6 ms-auto"
              style={{ textAlign: 'right' }}
            >
              <GenButtonCircle
                color={B_LIST.edit.color}
                icon={B_LIST.edit.icon}
                link={`/admin/fertilizer-usages/${serviceFertilizerMinors?.serviceFertilizerMinorId}/edit-minor`}
              />
            </div>
          </div>
        </div>
        <div className="private-card-body">
          <div className="table-responsive">
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : // ตรวจสอบว่ามีข้อมูลใน ratonCane หรือไม่
              serviceFertilizerMinors?.serviceFertilizerMinorUsages?.length ===
                0 ? (
                <p className="text-center text-muted text-danger">
                  ยังไม่มีการบันทึกข้อมูล
                </p>
              ) : (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>
                        {serviceFertilizerMinors?.laboratory?.shortNameAfter}(
                        {serviceFertilizerMinors?.laboratory?.unitAfter})
                      </th>
                      <th>
                        อัตราการใช้ (
                        {serviceFertilizerMinors?.fertilizerMinor?.unit?.initial}
                        /ไร่)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceFertilizerMinors?.serviceFertilizerMinorUsages?.map(
                      (usages, index) => (
                        <tr key={index}>
                          <td>{usages?.cutoffText}</td>
                          <td>{usages?.fertilizerUsageValue}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFertilizerMinor;

