interface InfoTableProps {
  title: string;
  data: { [key: string]: string | number | null };
  loading: boolean;
}

const InfoTable: React.FC<InfoTableProps> = ({ title, data, loading }) => {
  return (
    <div className="col-md-4">
      <div className="private-card">
        <div className="private-card-header">
          <div className="row row-demo-grid">
            <div className="col-md-8 col-sm-8 col-8 text-start">
              <h4 className="private-card-title">{title}</h4>
            </div>
          </div>
        </div>
        <div className="private-card-body">
          <div className="col-md-12 ms-auto me-auto">
            <div className="row p-4">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <table style={{ minHeight: '120px' }}>
                  <tbody>
                    {Object.entries(data).map(([key, value]) => (
                      <tr key={key}>
                        <th>{key}</th>
                        <td>{value}</td>
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

export default InfoTable;
