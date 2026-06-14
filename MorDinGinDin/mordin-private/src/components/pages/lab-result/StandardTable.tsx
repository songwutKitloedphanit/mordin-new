import React from 'react';

import { AnalysisStandardInterface } from '@/types/standard-sample/AnalysisStandards';

interface BlankTableProps {
   data: AnalysisStandardInterface[] | undefined;
}

const StandardTable:  React.FC<BlankTableProps> = ({ data }) => {

  console.log('data1' , data);
  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">Standard</h4>
      </div>
      <div className="card-body">
        <div className="table-responsive">

          {/* {data?.map((item , index) =>( */}
            <table className="table table-bordered">
            <thead>
              <tr>
                {/* <th key={index}>aaa</th> */}
                                <th>pH</th>

                <th>pH</th>
                <th>EC</th>
                <th>OM</th>
                <th>P</th>
                <th>K</th>
                <th>Ca</th>
                <th>Mg</th>
                </tr>
            </thead>
            <tbody>
              <tr>
                <th className="text-center">Certificate</th>
                <td className="text-center">7.42</td>
                <td className="text-center">1.14</td>
                <td className="text-center">2.82</td>
                <td className="text-center">71.32</td>
                <td className="text-center">423.3</td>
                <td className="text-center">423.3</td>
                <td className="text-center">423.3</td>
              </tr>
              <tr>
                <th className="text-center">Actual</th>
                {[...Array(7)].map((_, idx) => (
                  <td key={idx} className="text-center"></td>
                ))}
              </tr>
              <tr>
                <th className="text-center">%Error</th>
                {[...Array(7)].map((_, idx) => (
                  <td key={idx} className="text-center"></td>
                ))}
              </tr>
            </tbody>
          </table>
           {/* ))} */}
          
        </div>
      </div>
    </div>
  );
};

export default StandardTable;
