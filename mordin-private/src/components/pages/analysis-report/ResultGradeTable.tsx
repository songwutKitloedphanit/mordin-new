import { PrintReportInterface } from '@/types/qr-code/Report';
import { TimeStampToDate } from '@/utils/Date';
import { formatNumber } from '@/utils/Number';

interface ResultGradeTableProps {
  reportData: PrintReportInterface;
  loading: boolean;
}

const getParameterFullName = (param: string) => {
  const p = param.trim().toUpperCase();
  if (p === 'N') return 'ไนโตรเจน (N)';
  if (p === 'P') return 'ฟอสฟอรัส (P)';
  if (p === 'K') return 'โพแทสเซียม (K)';
  if (p === 'OM') return 'อินทรียวัตถุ (OM)';
  if (p === 'PH') return 'กรด-ด่าง (pH)';
  return param;
};

const hbarTrackStyle: React.CSSProperties = {
  height: '6px',
  backgroundColor: '#e2e8f0',
  borderRadius: '3px',
  overflow: 'hidden',
  marginTop: '8px',
};

const hbarFillStyle = (width: string, color: string): React.CSSProperties => ({
  height: '100%',
  width,
  backgroundColor: color,
  borderRadius: '3px',
  transition: 'width 0.5s ease-out',
});

const getLevelColor = (levelName: string) => {
  const lvl = levelName.toLowerCase();
  if (
    lvl.includes('ต่ำ') ||
    lvl.includes('กรดจัด') ||
    lvl.includes('น้อย') ||
    lvl.includes('ยาก')
  ) {
    return '#dc3545';
  } else if (
    lvl.includes('ปานกลาง') ||
    lvl.includes('เหมาะสม') ||
    lvl.includes('พอดี') ||
    lvl.includes('ปกติ')
  ) {
    return '#ffc107';
  } else if (lvl.includes('สูง') || lvl.includes('มาก') || lvl.includes('ดี')) {
    return '#198754';
  }
  return '#6c757d';
};

const ResultGradeTable: React.FC<ResultGradeTableProps> = ({
  reportData,
  loading,
}) => {
  return (
    <div className="private-card mt-4">
      <div className="private-card-header">
        <div className="row">
          <div className="col text-start">
            <h4 className="private-card-title">คะแนนความอุดมสมบูรณ์ของดิน</h4>
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
        ) : reportData.ferMajorLandScores?.length > 0 ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted small">
                แก้ไขล่าสุด:{' '}
                {TimeStampToDate(reportData.ferMajorLandScores[0]?.updatedAt)}
              </span>
              <span className="text-muted small">
                สูตรคำนวณ:{' '}
                {reportData.ferMajorLandScores
                  ?.map(score => {
                    const result = reportData.results?.find(
                      r => r.resultId === score.resultId
                    );
                    if (!result) return null;
                    return `score(${result.laboratorySetting?.laboratory?.shortNameAfter || '-'})`;
                  })
                  .filter(Boolean)
                  .join(' + ')}
              </span>
            </div>

            {/* Visual Progress Cards */}
            <div className="row g-3 mb-2">
              {reportData.ferMajorLandScores?.map(score => {
                const result = reportData.results?.find(
                  r => r.resultId === score.resultId
                );
                const val = result ? formatNumber(result.postValue) : '-';
                const unit =
                  result?.laboratorySetting?.laboratory?.unitAfter || '';
                const levelName = score.soilGradeLevel?.scoreName || 'ไม่ระบุ';
                const color = getLevelColor(levelName);

                let pct = '50%';
                const lvl = levelName.toLowerCase();
                if (
                  lvl.includes('ต่ำ') ||
                  lvl.includes('กรดจัด') ||
                  lvl.includes('น้อย') ||
                  lvl.includes('ยาก')
                ) {
                  pct = '30%';
                } else if (
                  lvl.includes('ปานกลาง') ||
                  lvl.includes('เหมาะสม') ||
                  lvl.includes('พอดี')
                ) {
                  pct = '60%';
                } else if (lvl.includes('สูง') || lvl.includes('มาก')) {
                  pct = '90%';
                }

                return (
                  <div
                    key={score.fertilizerMajorLandScoreId}
                    className="col-md-4 col-sm-6 text-start"
                  >
                    <div className="p-3 border rounded-3 bg-white shadow-sm h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span
                          className="fw-bold text-dark small"
                          style={{ fontSize: '13.5px' }}
                        >
                          {getParameterFullName(
                            score.soilGrade?.parameter || ''
                          )}
                        </span>
                        <span
                          className="badge rounded-pill px-2.5 py-1 text-white border-0"
                          style={{
                            backgroundColor: color,
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                        >
                          {levelName}
                        </span>
                      </div>
                      <div className="d-flex align-items-baseline mt-1">
                        <span className="fs-3 fw-bold text-dark">{val}</span>
                        {unit && (
                          <span
                            className="text-muted small ms-1"
                            style={{ fontSize: '12px' }}
                          >
                            {unit}
                          </span>
                        )}
                      </div>
                      <div style={hbarTrackStyle}>
                        <div style={hbarFillStyle(pct, color)} />
                      </div>
                      <div
                        className="d-flex justify-content-between text-muted mt-2"
                        style={{ fontSize: '10px' }}
                      >
                        <span>ต่ำ</span>
                        <span>ปานกลาง</span>
                        <span>สูง</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Original Table representation collapsed */}
            <div className="accordion mt-3" id="detailsTableAccordion">
              <div className="accordion-item border-0 bg-transparent">
                <h2 className="accordion-header" id="headingTable">
                  <button
                    className="accordion-button collapsed px-0 bg-transparent text-primary fw-semibold border-0 shadow-none"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseTable"
                    aria-expanded="false"
                    aria-controls="collapseTable"
                    style={{ fontSize: '13.5px' }}
                  >
                    <i className="fas fa-table me-2" />
                    แสดงตารางรายละเอียดคะแนนดั้งเดิม
                  </button>
                </h2>
                <div
                  id="collapseTable"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingTable"
                  data-bs-parent="#detailsTableAccordion"
                >
                  <div className="accordion-body px-0 pt-3">
                    <div className="table-responsive">
                      <table className="table table-bordered table-striped table-hover">
                        <tbody>
                          <tr>
                            <th>เกณฑ์วิเคราะห์</th>
                            {reportData.ferMajorLandScores?.map(score => (
                              <th
                                key={score.fertilizerMajorLandScoreId}
                                className="text-center"
                              >
                                {score.soilGrade?.parameter}
                              </th>
                            ))}
                          </tr>
                          <tr>
                            <th>ค่าที่วิเคราะห์ได้</th>
                            {reportData.ferMajorLandScores?.map(score => {
                              const result = reportData.results?.find(
                                r => r.resultId === score.resultId
                              );
                              return (
                                <td
                                  key={score.fertilizerMajorLandScoreId}
                                  className="text-center"
                                >
                                  {result
                                    ? formatNumber(result.postValue)
                                    : '-'}
                                </td>
                              );
                            })}
                          </tr>
                          <tr>
                            <th>คะแนนดิบ</th>
                            {reportData.ferMajorLandScores?.map(score => (
                              <td
                                key={score.fertilizerMajorLandScoreId}
                                className="text-center"
                              >
                                {score.resultValue}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <th>ระดับความอุดมสมบูรณ์</th>
                            {reportData.ferMajorLandScores?.map(score => (
                              <td
                                key={score.fertilizerMajorLandScoreId}
                                className="text-center"
                              >
                                {score.soilGradeLevel?.scoreName}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-danger">
            ไม่พบข้อมูลการให้คะแนนความอุดมสมบูรณ์ของดิน
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultGradeTable;
