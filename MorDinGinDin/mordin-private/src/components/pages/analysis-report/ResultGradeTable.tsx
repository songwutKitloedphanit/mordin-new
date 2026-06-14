import { PrintReportInterface } from '@/types/qr-code/Report';
import { TimeStampToDate } from '@/utils/Date';
import { formatNumber } from '@/utils/Number';

interface ResultGradeTableProps {
  reportData: PrintReportInterface;
  loading: boolean;
}

const ResultGradeTable: React.FC<ResultGradeTableProps> = ({
  reportData,
  loading,
}) => {
  return (
    <div className="card mt-4">
      <div className="card-header">
        <div className="row">
          <div className="col text-start">
            <h4 className="card-title">คะแนนความอุดมสมบูรณ์ของดิน</h4>
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
        ) : reportData.ferMajorLandScores?.length > 0 ? (
          <>
            <p className="text-muted">
              แก้ไขข้อมูลการให้คะแนน:{' '}
              {TimeStampToDate(reportData.ferMajorLandScores[0]?.updatedAt)}
            </p>
            <p className="text-muted">
              Total score ={' '}
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
            </p>
            <div className="table-responsive">
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th></th>
                    {reportData.ferMajorLandScores?.map(score => (
                      <th key={score.fertilizerMajorLandScoreId}>
                        {score.soilGrade?.parameter}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th>ค่า</th>
                    {reportData.ferMajorLandScores?.map(score => {
                      const result = reportData.results?.find(
                        r => r.resultId === score.resultId
                      );
                      return (
                        <td
                          key={score.fertilizerMajorLandScoreId}
                          className="text-center"
                        >
                          {result ? formatNumber(result.postValue) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <th>คะแนน</th>
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
