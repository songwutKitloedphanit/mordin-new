import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle } from '../../../components/gui/GuiButton';
import { updateLaboratorySetting } from '../../../services/api/laboratory/LaboratorySettingApi';
import { getCalendarById } from '../../../services/api/ServiceCalendarApi';
import { MachineTypeTypes } from '../../../types/Laboratory';
import {
  LaboratorySettingInfo,
  LaboratorySettingInput,
} from '../../../types/laboratory/LaboratorySetting';
import { CalendarInfoInterface } from '../../../types/ServiceCalendar';
import { formatDMYDate } from '../../../utils/Date';

import { updateConvertOmSetting } from '@/services/api/laboratory/ConvertOmSettingApi';
import { ConvertOmSettingInput } from '@/types/laboratory/ConvertOmSetting';

type LabFormState = {
  labSetting: LaboratorySettingInput[];
  convertOmInput: ConvertOmSettingInput;
  convertOmSettingId: number | null;
};

const ExamSettingEdit: React.FC = () => {
  const navigate = useNavigate();
  const { serviceCalendarId } = useParams();
  const [serviceCalendarData, setServiceCalendarData] =
    useState<CalendarInfoInterface>({} as CalendarInfoInterface);
  const [labFormState, setLabFormState] = useState<LabFormState>({
    labSetting: [],
    convertOmInput: {} as ConvertOmSettingInput,
    convertOmSettingId: null,
  });
  const [showConfirm, setShowConfirm] = useState<null | {
    type: 'delete' | 'cancel';
    index?: number;
  }>(null);

  useEffect(() => {
    const fetchServiceCalendar = async () => {
      const data = await getCalendarById(Number(serviceCalendarId));
      setServiceCalendarData(data);

      const initialLabSetting: LaboratorySettingInput[] = [];
      let foundConvertOm: ConvertOmSettingInput | null = null;
      let foundConvertOmSettingId: number | null = null;

      data.laboratorySettings?.forEach((lab: LaboratorySettingInfo) => {
        initialLabSetting.push({
          laboratorySettingId: lab.laboratorySettingId,
          dirtWeight: lab.dirtWeight ?? null,
          extractConcentration: lab.extractConcentration ?? null,
          extractAmount: lab.extractAmount ?? null,
        });

        if (lab.convertOmSettings?.length > 0) {
          const om = lab.convertOmSettings[0];
          foundConvertOm = {
            intercept: om.intercept ?? null,
            slope: om.slope ?? null,
          };
          foundConvertOmSettingId = om.convertOmSettingId ?? null;
        }
      });

      setLabFormState(prev => ({
        ...prev,
        labSetting: initialLabSetting,
        convertOmInput: foundConvertOm ?? prev.convertOmInput,
        convertOmSettingId: foundConvertOmSettingId,
      }));
    };

    fetchServiceCalendar();
  }, [serviceCalendarId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const { name, value } = e.target;

    setLabFormState(prev => ({
      ...prev,
      labSetting: prev.labSetting.map(item =>
        item.laboratorySettingId === id
          ? {
              ...item,
              [name]: value === '' ? null : parseFloat(value),
            }
          : item
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log('submitted laboratorySetting :', labFormState.labSetting);
      console.log('submitted convert Om :', labFormState.convertOmInput);

      // อัปเดต laboratorySetting
      const response = await updateLaboratorySetting(labFormState.labSetting);
      console.log('✅ Laboratory settings updated:', response);

      // อัปเดต Convert OM ถ้ามี id
      if (labFormState.convertOmSettingId) {
        const updateConvertOm = await updateConvertOmSetting(
          labFormState.convertOmSettingId,
          labFormState.convertOmInput
        );
        console.log('Convert OM updated:', updateConvertOm);
      }

      // แจ้งเตือนเมื่อสำเร็จ
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'บันทึกข้อมูลสำเร็จ',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate(-1);
      });
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดขณะบันทึก:', error);

      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'การบันทึกค่าล้มเหลว กรุณาตรวจสอบ',
        icon: 'error',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      });
    }
  };

  const isOM = (machineType: string) => {
    if (machineType === MachineTypeTypes.REVERSE_LINEAR) {
      return true;
    } else {
      return false;
    }
  };

  console.log(serviceCalendarData);

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
                    ตั้งค่า (รถ {serviceCalendarData?.bus?.busName ?? '-'}{' '}
                    {formatDMYDate(serviceCalendarData?.date)})
                  </h4>
                </div>
                <div
                  className="col-md-3 col-sm-3 col-3 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  {/* ปุ่มเชื่อมไปหน้าต่างๆ */}
                  <GenButtonCircle
                    color="btn-primary"
                    icon="fas fa-clipboard-list"
                    onClick={() => navigate('/officer/analysis-setting')}
                  />
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="col-md-8 ms-auto me-auto">
                {/* ตารางข้อมูล Standard */}
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>ความเข้มข้นสารสกัด (mol)</th>
                      <th>ปริมาณสารสกัด (L)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labFormState.labSetting?.map(lab => {
                      const parameter =
                        serviceCalendarData?.laboratorySettings?.find(
                          (item: { laboratorySettingId: number }) =>
                            item.laboratorySettingId === lab.laboratorySettingId
                        );
                      return (
                        <tr key={lab.laboratorySettingId}>
                          <td align="center">
                            {parameter?.laboratory?.shortNameBefore ?? '-'}
                          </td>
                          <td align="center">
                            {isOM(
                              parameter?.laboratory?.machineType?.type ?? ''
                            ) ? (
                              <input
                                className="form-control"
                                type="number"
                                name="extractConcentration"
                                value={lab.extractConcentration ?? ''}
                                onChange={e =>
                                  handleChange(e, lab.laboratorySettingId)
                                }
                              />
                            ) : (
                              <input
                                className="form-control text-center"
                                type="text"
                                name="extractConcentration"
                                value="-"
                                readOnly
                              />
                            )}
                          </td>
                          <td align="center">
                            <input
                              className="form-control"
                              type="number"
                              name="extractAmount"
                              value={lab.extractAmount ?? ''}
                              onChange={e =>
                                handleChange(e, lab.laboratorySettingId)
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}

                    {/* แถว Convert OM ด้านล่างที่หัวต่างจากด้านบน */}
                    <tr>
                      <th></th>
                      <th>Intercept</th>
                      <th>Slope</th>
                    </tr>

                    {serviceCalendarData?.laboratorySettings
                      ?.filter(lab => lab.convertOmSettings.length > 0)
                      .map(labSetting => (
                        <tr key={`convert-${labSetting.laboratorySettingId}`}>
                          <td align="center">Convert OM</td>
                          <td align="center">
                            <input
                              className="form-control"
                              type="number"
                              name="intercept"
                              value={
                                labFormState.convertOmInput.intercept ?? ''
                              }
                              onChange={e =>
                                setLabFormState(prev => ({
                                  ...prev,
                                  convertOmInput: {
                                    ...prev.convertOmInput,
                                    intercept: Number(e.target.value),
                                  },
                                }))
                              }
                            />
                          </td>
                          <td align="center">
                            <input
                              className="form-control"
                              type="number"
                              name="slope"
                              value={labFormState.convertOmInput.slope ?? ''}
                              onChange={e =>
                                setLabFormState(prev => ({
                                  ...prev,
                                  convertOmInput: {
                                    ...prev.convertOmInput,
                                    slope: Number(e.target.value),
                                  },
                                }))
                              }
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Action Buttons */}
                <div className="card-action">
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
      </div>

      {showConfirm && (
        <ConfirmAlert
          title={
            showConfirm.type === 'delete' ? 'ยืนยันการลบ' : 'ยืนยันการยกเลิก'
          }
          text={
            showConfirm.type === 'delete'
              ? 'คุณต้องการลบประเภทการประเมินนี้หรือไม่?'
              : 'คุณต้องการยกเลิกการแก้ไขหรือไม่?'
          }
          action={showConfirm.type}
          onConfirm={() => {
            if (showConfirm.type === 'cancel') {
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

export default ExamSettingEdit;
