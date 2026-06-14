import {
  Chart,
  LinearScale,
  CategoryScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useEffect, useRef, useState } from 'react';
import 'datatables.net-bs5';
import { useParams } from 'react-router-dom';

import { DataTableFilter } from '../../../components/gui/DataTableFilter';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import { getLaboratoryById } from '../../../services/api/laboratory/LaboratoryApi';
import { LaboratoryInfoInterface } from '../../../types/Laboratory';

import LabCard from '@/components/pages/laboratory/LabCard';

// Register the necessary components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const MyChart = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const xValues = [0.098, 0.187, 0.286, 0.392];
    const yValues = [0.005, 0.01, 0.015, 0.02];

    if (chartRef.current) {
      // ถ้ามี chart เดิมให้ destroy ก่อน
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: xValues.map(String),
          datasets: [
            {
              label: 'Working Standard',
              fill: false,
              tension: 0,
              backgroundColor: 'rgba(0,0,255,1.0)',
              borderColor: 'rgba(0,0,255,0.1)',
              data: yValues,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              type: 'category',
            },
            y: {
              min: 0,
              max: 0.03,
            },
          },
        },
      });
    }

    // Cleanup เมื่อ component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef}></canvas>;
};

const LabInfo = () => {
  const { id } = useParams();
  const laboratoryId = Number(id);
  const [laboratoryInfo, setLaboratoryInfo] = useState<LaboratoryInfoInterface>(
    {} as LaboratoryInfoInterface
  );

  useEffect(() => {
    const fetchLaboratoryData = async () => {
      const lab = await getLaboratoryById(laboratoryId);
      console.log(laboratoryId);

      console.log(lab);

      setLaboratoryInfo(lab);
    };
    fetchLaboratoryData();
  }, [laboratoryId]);

  console.log(laboratoryInfo);

  return (
    <>
      <div className="row">
        <LabCard />
      </div>
      {/* Laboratory Info */}
      <div className="row">
        <div className="col-md-6">
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-6 col-sm-8 col-8"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="private-card-title">การทดสอบ (OM)</h4>
                </div>
                <div
                  className="col-md-6 col-sm-4 col-4 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.list.color}
                    icon={B_LIST.list.icon}
                    link="/admin/laboratory"
                    className="mx-1"
                  />
                  <GenButtonCircle
                    color={B_LIST.edit.color}
                    icon={B_LIST.edit.icon}
                    link={`/admin/laboratory/${laboratoryId}/edit`}
                  />
                </div>
              </div>
            </div>
            <div className="private-card-body">
              <div className="col-md-12 ms-auto me-auto">
                <div className="row p-4">
                  <table style={{ minHeight: '245px' }}>
                    <tbody>
                      <tr>
                        <th>รหัส</th>
                        <td>{laboratoryInfo.laboratoryCode}</td>
                      </tr>
                      <tr>
                        <th>ชื่อ</th>
                        <td colSpan={4}>{laboratoryInfo.name}</td>
                      </tr>
                      <tr>
                        <th>ประเภท</th>
                        <td colSpan={4}>{laboratoryInfo.machineType?.name}</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <th>ชื่อย่อ (ก่อนแปลงค่า)</th>
                        <td>{laboratoryInfo.shortNameBefore}</td>
                        <td>&nbsp;&nbsp;&nbsp;</td>
                        <th>หน่วยวัด (ก่อนแปลงค่า)</th>
                        <td>{laboratoryInfo.unitBefore}</td>
                      </tr>
                      <tr>
                        <th>ชื่อย่อ (หลังแปลงค่า)</th>
                        <td>{laboratoryInfo.shortNameAfter}</td>
                        <td>&nbsp;&nbsp;&nbsp;</td>
                        <th>หน่วยวัด (หลังแปลงค่า)</th>
                        <td>{laboratoryInfo.unitAfter}</td>
                      </tr>
                      <tr>
                        <th>ขอบเขต</th>
                        <td>
                          {laboratoryInfo.rangeMin +
                            ' ถึง ' +
                            laboratoryInfo.rangeMax}
                        </td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <th>สมการ</th>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={5}>
                          {' '}
                          OM-post =[ [ ความเข้มข้นสารสกัด (mol)-[ Intercept (a)
                          + Slope (b) * OM-pre ] ] *9000* [ ปริมาณสารสกัด (mL) /
                          น้ำหนักดิน (g) ] ]/10000
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="private-card">
            <div className="private-card-header">
              <div className="private-card-title">
                Working standard (รถหมายเลข B-1 วันที่ 13-04-2025)
              </div>
            </div>
            <div className="private-card-body">
              <div className="row">
                <div className="col-md-6">
                  <MyChart />
                  <p className="mt-4 mb-0">
                    Working_standard = (-0.0003) * Absorbance + (0.0494)
                  </p>
                  <p>Rยฒ = 0.9985</p>
                </div>
                <div className="col-md-6">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Absorbance</th>
                        <th>Working_standard</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-center">0.098</td>
                        <td className="text-center">0.005</td>
                      </tr>
                      <tr>
                        <td className="text-center">0.187</td>
                        <td className="text-center">0.010</td>
                      </tr>
                      <tr>
                        <td className="text-center">0.286</td>
                        <td className="text-center">0.015</td>
                      </tr>
                      <tr>
                        <td className="text-center">0.392</td>
                        <td className="text-center">0.020</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plots Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-8 col-sm-8 col-8"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="private-card-title">การตั้งค่าเครื่อง</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  {/* <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    link="/admin/land/add"
                  /> */}
                </div>
              </div>
            </div>
            <div className="private-card-body">
              <div>
                <table
                  id="multi-filter-select"
                  className="display table table-striped table-hover"
                >
                  <thead>
                    <tr>
                      <th>หมายเลขรถ</th>
                      <th>วันที่ให้บริการ</th>
                      <th>น้ำหนักดิน(KG)</th>
                      <th>ความเข้มข้นสารสกัด(MOL)</th>
                      <th>ปริมาณสารสกัด(L)</th>
                      <th>LINEAR REGRESSION-INTERCEPT (A)</th>
                      <th>LINEAR REGRESSION-SLOPE (B)</th>
                      <th>Management</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tfoot>
                    <tr>
                      <th>หมายเลขรถ</th>
                      <th>วันที่ให้บริการ</th>
                      <th>น้ำหนักดิน(KG)</th>
                      <th>ความเข้มข้นสารสกัด(MOL)</th>
                      <th>ปริมาณสารสกัด(L)</th>
                      <th>LINEAR REGRESSION-INTERCEPT (A)</th>
                      <th>LINEAR REGRESSION-SLOPE (B)</th>
                      <th>Management</th>
                      <th>Update</th>
                    </tr>
                  </tfoot>
                  <tbody>
                    <tr>
                      <td>B-1</td>
                      <td>2005-40-13</td>
                      <td>0.0025</td>
                      <td>0.02</td>
                      <td>0.02</td>
                      <td>-0.0003</td>
                      <td>0.0494</td>
                      <td className="text-center">
                        <GenButtonCircle
                          color={B_LIST.info.color}
                          icon={B_LIST.info.icon}
                          link="#"
                        />
                      </td>
                      <td>2025-01-27</td>
                    </tr>
                  </tbody>
                </table>
                <DataTableFilter
                  tableId={'multi-filter-select'}
                  loading={false}
                ></DataTableFilter>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LabInfo;
