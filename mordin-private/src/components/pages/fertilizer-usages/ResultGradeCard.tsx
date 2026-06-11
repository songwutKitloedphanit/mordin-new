import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { ResultGradeInfo } from '@/types/result-grade/ResultGrade';
import { ResultGradeLevel } from '@/types/result-grade/ResultGradeLevel';

interface ResultGradeCardProps {
  ResultGrades: ResultGradeInfo;
  loading: boolean;
}

const ResultGradeCard: React.FC<ResultGradeCardProps> = ({
  ResultGrades,
  loading,
}) => {
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
                {ResultGrades?.laboratory?.shortNameAfter}(
                {ResultGrades?.laboratory?.unitAfter})
              </h4>
            </div>
            <div
              className="col-md-4 col-sm-6 col-6 ms-auto"
              style={{ textAlign: 'right' }}
            >
              <GenButtonCircle
                color={B_LIST.edit.color}
                icon={B_LIST.edit.icon}
                link={`/admin/fertilizer-usages/${ResultGrades?.resultGradeId}/edit-result-grade`}
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
            ) : ResultGrades?.resultGradeLevels?.length ? (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>คะแนน</th>
                    <th>ระดับคะแนน</th>
                  </tr>
                </thead>
                <tbody>
                  {ResultGrades.resultGradeLevels.map(
                    (resultLevel: ResultGradeLevel) => (
                      <tr key={resultLevel.resultGradeId}>
                        <td>{resultLevel.cutoffText}</td>
                        <td style={{ backgroundColor: `${resultLevel.color}` }}>
                          {resultLevel.scoreName}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-muted text-danger">
                ยังไม่มีการบันทึกข้อมูล
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultGradeCard;
