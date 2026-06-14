import React from 'react';

import { AnalysisStandardInterface } from '@/types/standard-sample/AnalysisStandards';

interface BlankTableProps {
   data: AnalysisStandardInterface | undefined;
}

  const BlankTable: React.FC<BlankTableProps> = ({ data }) => {

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">Blank</h4>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    
                <th>{data?.type}</th>

                    {data?.analysisStandardResults.filter((_, index) => index % 2 === 0).map((item  , index) =>(
                <th key={index}>{item.laboratorySetting?.laboratory.shortNameBefore}</th>

                    ))}
               
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="text-center">Blank results</th>
                {[...Array(7)].map((_, idx) => (
                  <td key={idx} className="text-center"></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlankTable;
