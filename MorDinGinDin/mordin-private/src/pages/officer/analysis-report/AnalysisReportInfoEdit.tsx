import { useNavigate } from 'react-router-dom';

import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';

const AnalysisReportInfoEdit = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-9 col-sm-9 col-9"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">
                    แก้ไขตัวอย่าง 68APR27 (รถ B-1 21/04/2025)
                  </h4>
                </div>
                <div
                  className="col-md-3 col-sm-3 col-3 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    icon={B_LIST.list.icon}
                    color={B_LIST.list.color}
                    link="/officer/analysis-report/1"
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="col-md-6 ms-auto me-auto">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>รายการ</th>
                      <th>ค่าก่อนแปลง</th>
                      <th>ค่าหลังแปลง</th>
                    </tr>
                    {[
                      'pH',
                      'EC',
                      'OM',
                      'P',
                      'K',
                      'Ca',
                      'Mg',
                      'Fe',
                      'Mn',
                      'Cu',
                      'Zn',
                    ].map((item, index) => (
                      // eslint-disable-next-line react-x/no-array-index-key
                      <tr key={index}>
                        <th align="center">{item}</th>
                        <td>
                          <input className="form-control" type="text" />
                        </td>
                        <td align="center">xxx</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="card-action">
                  <div className="row row-demo-grid">
                    <button
                      type="submit"
                      className="btn btn-success"
                      style={{ width: '120px' }}
                      onClick={() => navigate(-1)}
                    >
                      แก้ไข
                    </button>
                    <button
                      type="submit"
                      className="btn btn-danger ms-auto"
                      style={{ width: '120px' }}
                      onClick={() => navigate(-1)}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalysisReportInfoEdit;
