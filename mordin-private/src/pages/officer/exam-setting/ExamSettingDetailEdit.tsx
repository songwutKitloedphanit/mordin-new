import { useState, useEffect, useCallback } from 'react';
import { BlockMath } from 'react-katex';
import { useNavigate, useParams } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Swal from 'sweetalert2';

import 'katex/dist/katex.min.css';
import '../../../../public/assets/css/katex.css';

import ScatterWithLine from '../../../components/chart/ScatterWithLine';
import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle } from '../../../components/gui/GuiButton';
import { getBusById } from '../../../services/api/BusApi';
import {
  getLabSettingById,
  updateWorkingStandard,
} from '../../../services/api/laboratory/LaboratorySettingApi';
import { MachineTypeTypes } from '../../../types/Laboratory';
import {
  LaboratorySettingDetail,
  LaboratorySettingDetailInput,
  LaboratorySettingInfo,
} from '../../../types/laboratory/LaboratorySetting';

import { Bus } from '@/types/Bus';
import { formatDMYDate } from '@/utils/Date';

const ExamSettingDetailEdit = () => {
  const navigate = useNavigate();
  const { labSettingId } = useParams();

  // const labSettingId  = Number(id);
  const [labSettingData, setLabSettingData] = useState<LaboratorySettingInfo>(
    {} as LaboratorySettingInfo
  );
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [scatterPoints, setScatterPoints] = useState([]);
  const [isTypeP, setIsTypeP] = useState<boolean>(false);
  const [bus, setBus] = useState<Bus>({} as Bus);
  const [showConfirm, setShowConfirm] = useState<null | {
    type: 'delete' | 'cancel';
    index?: number;
  }>(null);

  const [formData, setFormData] = useState<LaboratorySettingDetailInput[]>([]);

  const isP = (machineType: string) => {
    if (machineType === MachineTypeTypes.P_COMPLEX) {
      return true;
    } else {
      return false;
    }
  };

  const fetchLabSetting = useCallback(async () => {
    setLoading(true);
    const data = await getLabSettingById(Number(labSettingId));
    const busData = await getBusById(data.serviceCalendar.busId);

    const isTypeP = isP(data.laboratory?.machineType?.type);
    setIsTypeP(isTypeP);

    const newFormData =
      data.laboratorySettingDetails.length > 0
        ? data.laboratorySettingDetails.map((lab: LaboratorySettingDetail) => ({
            numberOfValues: lab.numberOfValues,
            absorbance: lab.absorbance,
            workingStandard: lab.workingStandard,
          }))
        : [
            { numberOfValues: 1, absorbance: null, workingStandard: null },
            { numberOfValues: 2, absorbance: null, workingStandard: null },
            { numberOfValues: 3, absorbance: null, workingStandard: null },
          ];

    setFormData(newFormData);

    const newScatterPoints = data.laboratorySettingDetails.map(
      (lab: LaboratorySettingDetail) => ({
        x: isTypeP ? lab.workingStandard : lab.absorbance,
        y: isTypeP ? lab.absorbance : lab.workingStandard,
      })
    );
    setScatterPoints(newScatterPoints);

    setLabSettingData(data);
    setBus(busData);
    setLoading(false);
  }, [labSettingId]);

  useEffect(() => {
    fetchLabSetting();
  }, [fetchLabSetting]);

  const handleAddRow = () => {
    setFormData([
      ...formData,
      {
        numberOfValues: formData.length + 1,
        absorbance: 0,
        workingStandard: 0,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: keyof LaboratorySettingDetailInput,
    value: string
  ) => {
    const newDetails = [...formData];
    if (value === '') {
      newDetails[index][field] = null;
    } else {
      newDetails[index][field] =
        field === 'numberOfValues' ? parseInt(value) : parseFloat(value);
    }
    setFormData(newDetails);
  };

  async function handleSubmit() {
    setError('');
    const filledRows = formData.filter(
      item => item.absorbance !== 0 || item.workingStandard !== 0
    );

    if (filledRows.length < 3) {
      setError('กรุณากรอกอย่างน้อย 3 ค่า');
      return;
    }

    try {
      const response = await updateWorkingStandard(
        Number(labSettingId),
        formData
      );
      console.log(response);
      fetchLabSetting();
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'การบันทึกการตั้งค่าล้มเหลว กรุณาตรวจสอบ',
        icon: 'error',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
    }
  }

  console.log(formData);

  return (
    <>
      <div className="row">
        {/* ข้อมูลการตั้งค่า OM */}
        <div className="col-md-6 order-2 order-lg-1">
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-9 col-sm-9 col-9"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="private-card-title">
                    ตั้งค่า {labSettingData.laboratory?.shortNameBefore} (รถ{' '}
                    {bus.busName}{' '}
                    {formatDMYDate(labSettingData.serviceCalendar?.date)})
                  </h4>
                </div>
                <div
                  className="col-md-3 col-sm-3 col-3 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color="btn-warning text-white"
                    icon="fa-solid fa-rotate-right"
                    className="mx-1"
                    onClick={() => fetchLabSetting()}
                  />
                  <GenButtonCircle
                    color="btn-primary"
                    icon="fas fa-clipboard-list"
                    onClick={() => navigate('/officer/analysis-setting')}
                  />
                </div>
              </div>
            </div>
            <div className="private-card-body overflow-auto">
              <div className="col-md-8 ms-auto me-auto">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>{isTypeP ? 'Working_standard' : 'Absorbance'}</th>
                        <th>{isTypeP ? 'Absorbance' : 'Working_standard'}</th>
                        <th>
                          {/* ปุ่มเพิ่มข้อมูล โดยจะเพิ่มจำนวนแถวใหม่ในตาราง */}
                          <GenButtonCircle
                            color="btn-success"
                            icon="fa fa-plus"
                            onClick={handleAddRow}
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* แสดงข้อมูลสำหรับ Absorbance และ Working_standard */}
                      {formData.map((val, index) => (
                        // eslint-disable-next-line react-x/no-array-index-key
                        <tr key={index}>
                          <td align="center">
                            <input
                              className="form-control"
                              type="number"
                              name={isTypeP ? 'workingStandard' : 'absorbance'}
                              value={
                                isTypeP
                                  ? (val.workingStandard ?? '')
                                  : (val.absorbance ?? '')
                              }
                              onChange={e =>
                                handleChange(
                                  index,
                                  isTypeP ? 'workingStandard' : 'absorbance',
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td align="center">
                            <input
                              className="form-control"
                              type="number"
                              name={isTypeP ? 'absorbance' : 'workingStandard'}
                              value={
                                isTypeP
                                  ? (val.absorbance ?? '')
                                  : (val.workingStandard ?? '')
                              }
                              onChange={e =>
                                handleChange(
                                  index,
                                  isTypeP ? 'absorbance' : 'workingStandard',
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td align="center">
                            {/* ปุ่มลบข้อมูล โดยจะลบแถวที่เลือกในตาราง */}
                            <GenButtonCircle
                              color="btn-danger"
                              icon="fa fa-trash"
                              onClick={() =>
                                setShowConfirm({ type: 'delete', index })
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {error && <div className="text-danger mt-2">{error}</div>}
                  </table>
                )}
                <div className="private-action-footer">
                  <div className="row row-demo-grid">
                    <button
                      type="submit"
                      className="btn btn-success"
                      style={{ width: '120px' }}
                      onClick={handleSubmit}
                    >
                      ตั้งค่า
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger ms-auto"
                      style={{ width: '120px' }}
                      onClick={() => setShowConfirm({ type: 'cancel' })}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* การแปลงค่า OM */}
        <div className="col-md-6 order-1 order-lg-2">
          <div className="private-card">
            <div className="private-card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-10 col-sm-10 col-10"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="private-card-title">
                    การแปลงค่า {labSettingData.laboratory?.shortNameBefore}
                  </h4>
                </div>
                <div
                  className="col-md-2 col-sm-2 col-2 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color="btn-primary"
                    icon="fas fa-cog"
                    onClick={() => console.log('Settings clicked')}
                  />
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
              ) : (
                <>
                  <div className="mb-4">
                    {labSettingData.laboratory?.shortNameBefore && (
                      <BlockMath
                        key={`${labSettingData.laboratorySettingId}-1`}
                        math={` 
        ${labSettingData.laboratory.shortNameBefore}_{\\text{post}} = 
        \\frac{\\left[ \\left( \\text{ความเข้มข้นสารสกัด (mol)} \\right) - 
        \\left( \\text{Intercept (a)} + \\text{Slope (b)} \\times 
        ${labSettingData.laboratory.shortNameBefore}_{\\text{pre}} \\right) \\right] 
        \\times 9000 \\times \\left( \\frac{\\text{ปริมาณสารสกัด (mL)}}{\\text{น้ำหนักดิน (g)}} \\right)}{10000}
      `}
                      />
                    )}
                  </div>

                  <div className="mt-3">
                    <BlockMath
                      math={`
                        ${labSettingData.laboratory?.shortNameBefore}\\ (\\%) =
                        \\frac{\\left[ (${labSettingData?.extractConcentration || '\\text{ความเข้มข้นสารสกัด (mol)}'}) -
                        \\left( ${Number(labSettingData?.intercept?.toFixed(3)) || '\\text{Intercept (a)}'} +
                        ${Number(labSettingData?.slope?.toFixed(3)) || '\\text{Slope (b)}'} \\times
                        \\text{${labSettingData?.laboratory?.shortNameBefore}} \\ (\\text{${labSettingData?.laboratory?.unitBefore}}) \\right) \\right]
                        \\times 9000 \\times \\left( \\frac{${labSettingData?.extractAmount || '\\text{ปริมาณสารสกัด (mL)}'}}{${labSettingData?.dirtWeight || '\\text{น้ำหนักดิน (g)}'}} \\right)}{10000}
                      `}
                    />
                  </div>
                  {labSettingData.slope && (
                    <div className="row">
                      <div className="col-md-7 mt-3">
                        <ScatterWithLine
                          slope={labSettingData.slope}
                          intercept={labSettingData.intercept}
                          scatterPoints={scatterPoints}
                        />
                      </div>
                      <div className="col-md-5">
                        <div className="overflow-auto mt-4 mt-md-0">
                          <table className="table table-bordered table-sm w-100 small">
                            <thead>
                              <tr>
                                <th className="px-2 py-2 text-truncate">
                                  {isTypeP ? 'Working_standard' : 'Absorbance'}
                                </th>
                                <th className="px-1 py-2 text-truncate">
                                  {isTypeP ? 'Absorbance' : 'Working_standard'}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {labSettingData.laboratorySettingDetails?.map(
                                val => (
                                  <tr
                                    key={`${val.laboratorySettingId}-${val.absorbance}`}
                                  >
                                    <td className="px-2 py-2 text-truncate text-center">
                                      {isTypeP
                                        ? val.workingStandard
                                        : val.absorbance}
                                    </td>
                                    <td className="px-1 py-2 text-truncate text-center">
                                      {isTypeP
                                        ? val.absorbance
                                        : val.workingStandard}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <p className="mt-4 mb-0">
                          Working_standard ={' '}
                          {labSettingData?.slope !== undefined &&
                          labSettingData?.intercept !== undefined
                            ? `${Number(labSettingData.slope?.toFixed(3))} * Absorbance + ${Number(labSettingData.intercept?.toFixed(3))}`
                            : '-'}
                        </p>
                        <p>
                          Rยฒ ={' '}
                          {labSettingData?.rSquared !== undefined
                            ? Number(labSettingData.rSquared?.toFixed(3))
                            : '-'}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title={
            showConfirm.type === 'delete' ? 'ยืนยันการลบ' : 'ยืนยันการยกเลิก'
          }
          text={
            showConfirm.type === 'delete'
              ? 'คุณต้องการลบค่านี้หรือไม่?'
              : 'คุณต้องการยกเลิกการตั้งค่าหรือไม่?'
          }
          action={showConfirm.type}
          onConfirm={() => {
            if (
              showConfirm.type === 'delete' &&
              typeof showConfirm.index === 'number'
            ) {
              handleRemoveRow(showConfirm.index);
            } else if (showConfirm.type === 'cancel') {
              navigate(-1);
            }
            setShowConfirm(null);
          }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};

export default ExamSettingDetailEdit;
