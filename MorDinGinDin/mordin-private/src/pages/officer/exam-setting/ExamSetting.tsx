import React, { useEffect, useState } from 'react';
import { BlockMath } from 'react-katex';
import { Link } from 'react-router-dom';
import '../../../../public/assets/css/katex.css';
import 'katex/dist/katex.min.css';
import Swal from 'sweetalert2';

// components
import ScatterWithLine from '../../../components/chart/ScatterWithLine';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import {
  GenFormDate2,
  GenFormSelect,
  MarkedDateStatus,
} from '../../../components/gui/GuiForm';
// utils
import {
  getCalendarById,
  searchServiceCalendars,
} from '../../../services/api/ServiceCalendarApi';
import { MachineTypeTypes } from '../../../types/Laboratory';
import { LaboratorySettingInfo } from '../../../types/laboratory/LaboratorySetting';
import {
  CalendarInfoInterface,
  SearchServiceCalendar,
  ServiceCalendarWithStatus,
} from '../../../types/ServiceCalendar';
import { formatDMYDate } from '../../../utils/Date';

import SelectStandardModal from '@/components/pages/exam-setting/SelectStandardModal';
import StandardBlankModal from '@/components/pages/exam-setting/StandardBlankModal';
import StandardTable from '@/components/pages/exam-setting/StandardTable';
import StandardTableInfo from '@/components/pages/exam-setting/StandardTableInfo';
import { getAllLaboratories } from '@/services/api/laboratory/LaboratoryApi';
import { getAllStandard } from '@/services/api/standard/StandardApi';
import {
  createAnalysisStandard,
  getAnalysisStandardsByCalendar,
} from '@/services/api/standard-sample/AnalysisStandardsAPI';
import { LaboratoryInfoInterface } from '@/types/Laboratory';
import {
  StandardType,
  AnalysisStandardInterface,
} from '@/types/standard-sample/AnalysisStandards';
import { StandardInfo } from '@/types/standard-sample/Standard';
const getDivided = (x: number | null, y: number | null): number => {
  if (x == null || y == null) {
    return 0; // หรือจะ throw error, หรือ return '-' ก็ได้ตามต้องการ
  }
  return x / y;
};

const ExamSetting: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];

  const [serviceDate, setServiceDate] = useState<string>(today);
  const [serviceCalendars, setServiceCalendars] = useState<
    CalendarInfoInterface[]
  >([]);
  const [markedDates, setMarkedDates] = useState<MarkedDateStatus[]>([]);
  const [selectedServiceCalendarId, setSelectedCalendarId] = useState<
    number | undefined
  >(undefined);
  const [selectedServiceCalendar, setSelectedCalendar] =
    useState<CalendarInfoInterface | null>(null);

  const [selectedCar, setSelectedCar] = useState<string>('');
  const [busOptions, setBusOptions] = useState<
    { value: number; name: string }[]
  >([]);

  const [analysisStandards, setAnalysisStandards] = useState<
    AnalysisStandardInterface[]
  >([]);
  const [standardData, setStandardData] = useState<StandardInfo[]>([]);
  const [labList, setLabList] = useState<LaboratoryInfoInterface[]>([]);
  //const createAnalysisStandard (CRM)
  const [selectedStandards, setSelectedStandards] = useState<StandardInfo[]>(
    []
  );
  const [repeatCounts, setRepeatCounts] = useState<Record<number, number>>({});
  const [showStandardModal, setShowStandardModal] = useState(false);
  const [existingStandardIds, setExistingStandardIds] = useState<number[]>([]);

  //const createAnalysisStandard (Blank)
  const [showBlankModal, setShowBlankModal] = useState(false);

  const [searchParam, setSearchParam] = useState<SearchServiceCalendar>(
    {} as SearchServiceCalendar
  );

  const fetchAnalysisStandards = async (calendarId: number) => {
    const data = await getAnalysisStandardsByCalendar(calendarId);
    const cleaned = data
      .map(d => d.standard)
      .filter((s): s is StandardInfo => s != null);

    setAnalysisStandards(data);
    setExistingStandardIds(cleaned.map(s => s.standardId));
    setSelectedStandards(cleaned);
  };
  //handle createAnalysisStandard (CRM)
  const handleRepeatChange = (standardId: number, count: number) => {
    setRepeatCounts(prev => ({ ...prev, [standardId]: count }));
  };
  const handleModalClose = () => setShowStandardModal(false);
  const handleAdd = (standard: StandardInfo) => {
    const newStandard: StandardInfo = {
      ...standard,
      type: StandardType.CRM, // ✅ เพิ่มตรงนี้
    };
    setSelectedStandards(prev => [...prev, newStandard]);
  };

  const handleRemove = (standardId: number) => {
    setSelectedStandards(prev =>
      prev.filter(s => s && s.standardId !== standardId)
    );
  };

  const handleModalSave = async () => {
    if (!selectedServiceCalendarId) return;

    // 1. เอาเฉพาะรายการ CRM ที่กำลังโชว์ใน StandardTableInfo
    const visibleCRM = selectedStandards.filter(
      (s): s is StandardInfo => s != null && s.type === StandardType.CRM
    );

    // 2. เอาเฉพาะอันที่ยังไม่อยู่ในฐานข้อมูล (existingStandardIds)
    const toAdd = visibleCRM.filter(
      s => !existingStandardIds.includes(s.standardId)
    );

    if (toAdd.length === 0) {
      return Swal.fire({
        icon: 'info',
        title: 'ไม่มีมาตรฐานใหม่ให้เพิ่ม',
        text: 'คุณยังไม่ได้เลือกมาตรฐานใหม่ใด ๆ',
      });
    }

    // 3. สร้าง payload จาก toAdd
    const payload = {
      serviceCalendarId: selectedServiceCalendarId,
      standard: toAdd.map(s => ({
        standardId: s.standardId,
        name: s.standardName,
        repeatCount: repeatCounts[s.standardId] ?? 1,
        type: StandardType.CRM,
      })),
    };

    console.log('Payload to send:', payload);
    try {
      await createAnalysisStandard(payload);
      await Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ' });
      // รีเซ็ต/รีเฟรช
      setShowStandardModal(false);
      await fetchAnalysisStandards(selectedServiceCalendarId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ' });
    }
  };
  //Handle for createAnalysisStandard (blank)
  const handleSaveBlank = (name: string, repeatCount: number) => {
    const payload = {
      serviceCalendarId: selectedServiceCalendarId!,
      standard: [
        {
          standardId: undefined,
          name: name.trim(),
          repeatCount,
          type: StandardType.BLANK,
        },
      ],
    };

    console.log('[handleSaveBlank] payload:', payload); // ✅ เพิ่มตรงนี้

    void createAnalysisStandard(payload)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'คุณได้เพิ่ม Blank Standards สำหรับการให้บริการนี้แล้ว',
        });
        fetchAnalysisStandards(selectedServiceCalendarId!);
        setShowBlankModal(false);
      })
      .catch(err => {
        console.error('ส่งไม่สำเร็จ', err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        });
      });
  };

  useEffect(() => {
    if (selectedServiceCalendarId) {
      (async () => {
        const data = await getAnalysisStandardsByCalendar(
          selectedServiceCalendarId
        );
        setAnalysisStandards(data);
        const selected = data
          .map(d => d.standard)
          .filter((s): s is StandardInfo => s !== undefined);
        setSelectedStandards(selected);
      })();
    }
  }, [selectedServiceCalendarId]);

  // fetch service calendars

  useEffect(() => {
    const fetchCalendar = async () => {
      const payload: SearchServiceCalendar = {
        ...searchParam,
        all: true,
      };
      const calData = await searchServiceCalendars(payload);

      setServiceCalendars(calData.data);
      setMarkedDates(
        calData.data.map((c: ServiceCalendarWithStatus) => ({
          date: new Date(c.date).toISOString().split('T')[0],
          status: c.settingStatus,
        }))
      );
    };
    fetchCalendar();
  }, [searchParam]);

  // derive busOptions from serviceCalendars
  useEffect(() => {
    const opts = serviceCalendars
      .filter(
        (c: CalendarInfoInterface) =>
          new Date(c.date).toISOString().split('T')[0] === serviceDate &&
          c.busId !== null
      )
      .map((c: CalendarInfoInterface) => ({
        value: c.busId!,
        name: `${c.bus.busNumber}-${c.bus.busName} (${c.bus.licensePlate})`,
      }));
    setBusOptions(opts);
    if (opts.length) setSelectedCar(opts[0].value.toString());
  }, [serviceDate, serviceCalendars]);

  // set selectedServiceCalendarId from selectedCar + date
  useEffect(() => {
    if (!selectedCar) {
      setSelectedCalendarId(undefined);
      return;
    }
    const cal = serviceCalendars.find(
      (c: CalendarInfoInterface) =>
        new Date(c.date).toISOString().split('T')[0] === serviceDate &&
        c.busId === Number(selectedCar)
    );
    setSelectedCalendarId(cal?.serviceCalendarId);
  }, [selectedCar, serviceDate, serviceCalendars]);

  // fetch one calendar detail
  useEffect(() => {
    if (selectedServiceCalendarId === undefined) {
      setSelectedCalendar(null);
      return;
    }
    (async () => {
      const data = await getCalendarById(selectedServiceCalendarId);
      setSelectedCalendar(data);
    })();
  }, [selectedServiceCalendarId]);
  //fect standard
  useEffect(() => {
    (async () => {
      const standards = await getAllStandard();
      setStandardData(standards);
      const labs = await getAllLaboratories();
      setLabList(labs);
    })();
  }, []);
  const isOM = (machineType: string) =>
    machineType === MachineTypeTypes.REVERSE_LINEAR;
  const isP = (machineType: string) =>
    machineType === MachineTypeTypes.P_COMPLEX;

  console.log(selectedServiceCalendar);
  console.log('StandardType.BLANK =', StandardType.BLANK);
  console.log('AnalysisStandards =', analysisStandards);
  return (
    <>
      {/* Date & Car selectors */}
      <div className="row">
        <div className="col-md-4">
          <GenFormDate2
            isRequired={false}
            id="serviceDate"
            name="serviceDate"
            label="วันที่ให้บริการ"
            value={serviceDate}
            onChange={setServiceDate}
            desc={`ค่าเริ่มต้น คือ วันนี้ (${new Date().toLocaleDateString('th-TH')})`}
            markedDatesWithStatus={markedDates}
            onMonthYearChange={(year, month) => {
              setSearchParam({
                year: year,
                month: month,
              });
            }}
          />
        </div>
        <div className="col-md-4">
          <GenFormSelect
            isRequired={false}
            id="carSelect"
            name="carSelect"
            label="รถที่ให้บริการ"
            value={selectedCar}
            onChange={e => setSelectedCar(e.target.value)}
            options={busOptions}
          />
        </div>
      </div>

      {selectedServiceCalendar ? (
        <>
          {/* AnalysisStandards  Table (StandardType.CRM) */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <h4 className="card-title">Standard</h4>
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    onClick={() => setShowStandardModal(true)}
                  />
                </div>

                <div className="card-body table-responsive">
                  {analysisStandards.length > 0 ? (
                    analysisStandards.map(as => {
                      const standard = as.standard;
                      if (!standard) return null;

                      const resultsByLab = standard.standardCertificates.reduce(
                        (acc, cert) => {
                          acc[cert.laboratoryId] = cert;
                          return acc;
                        },
                        {} as Record<
                          number,
                          (typeof standard.standardCertificates)[0]
                        >
                      );

                      const labIds = Object.keys(resultsByLab).map(Number);

                      return (
                        <table
                          key={as.analysisStandardId}
                          className="table table-bordered mb-4"
                        >
                          <thead>
                            <tr>
                              <th>
                                {standard.standardName}{' '}
                                <small className="text-muted ms-2">
                                  (repeat: {as.repeatCount})
                                </small>
                              </th>
                              {labIds.map(labId => {
                                const lab = resultsByLab[labId]?.laboratory;
                                return (
                                  <th key={labId}>
                                    {lab?.unitAfter
                                      ? `${lab.shortNameAfter} (${lab.unitAfter})`
                                      : (lab?.shortNameAfter ?? '-')}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th align="center">Certificate</th>
                              {labIds.map(labId => (
                                <td key={labId} align="center">
                                  {resultsByLab[labId]?.certificateValue ?? '-'}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      );
                    })
                  ) : (
                    <div className="text-muted">
                      ยังไม่มี Analysis Standards สำหรับวันให้บริการนี้
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Blank Standards Table (StandardType.Blank) */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <h4 className="card-title">Blank Standards</h4>
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    onClick={() => setShowBlankModal(true)}
                  />
                </div>
                <div className="card-body table-responsive">
                  {analysisStandards.filter(
                    as => as.type === StandardType.BLANK
                  ).length > 0 ? (
                    analysisStandards
                      .filter(as => as.type === StandardType.BLANK)
                      .map(as => {
                        const groupedResults =
                          as.analysisStandardResults.reduce(
                            (acc, r) => {
                              const lab = r.laboratorySetting?.laboratory;
                              if (lab) {
                                const key = lab.laboratoryId;
                                if (!acc[key]) acc[key] = [];
                                acc[key].push({
                                  preValue: r.preValue,
                                  repeatNumber: r.repeatNumber,
                                  labShortName: lab.shortNameBefore,
                                  unit: lab.unitBefore,
                                  id: r.analysisStandardResultId,
                                });
                              }
                              return acc;
                            },
                            {} as Record<
                              number,
                              {
                                preValue: number | null;
                                repeatNumber: number;
                                labShortName: string;
                                unit: string;
                                id: number;
                              }[]
                            >
                          );

                        const labIds = Object.keys(groupedResults)
                          .map(Number)
                          .sort((a, b) => a - b);

                        return (
                          <table
                            key={as.analysisStandardId}
                            className="table table-bordered mb-4"
                          >
                            <thead>
                              <tr>
                                <th>
                                  {as.name || '(ไม่มีชื่อ)'}{' '}
                                  <small className="text-muted ms-2">
                                    (repeat: {as.repeatCount})
                                  </small>
                                </th>
                                {labIds.map(labId => {
                                  const lab = groupedResults[labId]?.[0];
                                  return (
                                    <th key={labId}>
                                      {lab?.unit
                                        ? `${lab.labShortName} (${lab.unit})`
                                        : lab?.labShortName || '-'}
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {[...Array(as.repeatCount)].map((_, idx) => (
                                <tr key={`repeat-${idx + 1}`}>
                                  <th align="center">Repeat {idx + 1}</th>
                                  {labIds.map(labId => {
                                    const entry = groupedResults[labId]?.find(
                                      r => r.repeatNumber === idx + 1
                                    );
                                    return (
                                      <td
                                        // eslint-disable-next-line react-x/no-array-index-key
                                        key={`${labId}-${idx}`}
                                        align="center"
                                      >
                                        {entry?.preValue ?? '-'}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        );
                      })
                  ) : (
                    <div className="text-muted">
                      ยังไม่มี Blank Standards สำหรับวันให้บริการนี้
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Experiment Configuration Card */}
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <h4 className="card-title">
                    การตั้งค่า (รถ {selectedServiceCalendar.bus.busName} วันที่{' '}
                    {formatDMYDate(serviceDate)})
                  </h4>
                  <Link
                    to={`/officer/analysis-setting/${selectedServiceCalendarId}/edit`}
                  >
                    <GenButtonCircle
                      color={B_LIST.edit.color}
                      icon={B_LIST.edit.icon}
                    />
                  </Link>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          {/* <th>น้ำหนักดิน(kg)</th> */}
                          <th>ความเข้มข้นสารสกัด(mol)</th>
                          <th>ปริมาณสารสกัด(L)</th>
                          <th>Intercept (a)</th>
                          <th>Slope (b)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* ส่วนที่ 1: แสดงแถวปกติของ laboratory */}
                        {selectedServiceCalendar.laboratorySettings?.map(
                          (labSetting: LaboratorySettingInfo) => (
                            <tr key={`lab-${labSetting.laboratorySettingId}`}>
                              <td align="center">
                                {labSetting.laboratory.shortNameAfter}
                              </td>
                              <td align="center">
                                {isOM(labSetting.laboratory.machineType.type)
                                  ? labSetting.extractConcentration
                                  : '-'}
                              </td>
                              <td align="center">{labSetting.extractAmount}</td>
                              <td align="center">
                                {labSetting.intercept?.toFixed(3) ?? '-'}
                              </td>
                              <td align="center">
                                {labSetting.slope?.toFixed(3) ?? '-'}
                              </td>
                            </tr>
                          )
                        )}

                        {/* ส่วนที่ 2: แสดง Convert OM แยกไว้ล่างสุด */}
                        {selectedServiceCalendar.laboratorySettings
                          ?.filter(lab => lab.convertOmSettings.length > 0)
                          .map(labSetting => (
                            <tr
                              key={`convert-${labSetting.laboratorySettingId}`}
                            >
                              <td align="center">Convert OM</td>
                              <td align="center">-</td>
                              <td align="center">-</td>
                              <td align="center">
                                {labSetting.convertOmSettings[0].intercept ??
                                  '-'}
                              </td>
                              <td align="center">
                                {labSetting.convertOmSettings[0].slope ?? '-'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Laboratory Settings renderFormula */}
          <div className="row">
            {selectedServiceCalendar.laboratorySettings?.map(
              (labSetting: LaboratorySettingInfo) => (
                <div className="col-md-6" key={labSetting.laboratorySettingId}>
                  <div className="card">
                    <div className="card-header">
                      {isOM(labSetting.laboratory.machineType.type) ||
                        isP(labSetting.laboratory.machineType.type) ? (
                        <div className="d-flex justify-content-between align-items-center">
                          <h4 className="card-title">
                            Working standard (
                            {labSetting.laboratory.shortNameBefore})
                          </h4>
                          <GenButtonCircle
                            color={B_LIST.edit.color}
                            icon={B_LIST.edit.icon}
                            link={`/officer/analysis-setting/${labSetting.laboratorySettingId}/edit-working-standard`}
                          />
                        </div>
                      ) : (
                        <h4 className="card-title">
                          การแปลงค่า ({labSetting.laboratory.shortNameBefore})
                        </h4>
                      )}
                    </div>

                    <div className="card-body">
                      {isOM(labSetting.laboratory.machineType.type) ||
                        isP(labSetting.laboratory.machineType.type) ? (
                        labSetting.laboratorySettingDetails?.length ? (
                          <>
                            {/* 1. Formula Description */}
                            <div className="mb-4">
                              <div>
                                <BlockMath
                                  math={`
                                    ${labSetting.laboratory?.shortNameBefore}_{\\text{post}} = 
                                    \\frac{\\left[ \\left( \\text{ความเข้มข้นสารสกัด (mol)} \\right) - 
                                    \\left( \\text{Intercept (a)} + \\text{Slope (b)} \\times 
                                    \\text{${labSetting.laboratory?.shortNameBefore}}_{\\text{pre}} \\right) \\right] 
                                    \\times 9000 \\times \\left( \\frac{\\text{ปริมาณสารสกัด (mL)}}{\\text{น้ำหนักดิน (g)}} \\right)}{10000}
                                  `}
                                />
                              </div>

                              <div className="mt-3">
                                {isP(labSetting.laboratory?.machineType?.type) ? (
                                  <BlockMath
                                    math={`
                                    ${labSetting.laboratory?.shortNameBefore} (\\%) = 
                                    \\frac{\\left[ (${labSetting?.extractConcentration || '\\text{ความเข้มข้นสารสกัด (mol)}'} - 
                                    (${labSetting?.slope?.toFixed(3) || '\\text{Slope (b)}'} + 
                                    ${labSetting?.intercept?.toFixed(3) || '\\text{Intercept (a)}'} \\times 
                                    ${labSetting?.laboratory?.shortNameBefore} (\\text{${labSetting?.laboratory?.unitBefore}})) \\right] 
                                    \\times 9000 \\times \\left( \\frac{${labSetting?.extractAmount || '\\text{ปริมาณสารสกัด (mL)}'}}{${labSetting?.dirtWeight || '\\text{น้ำหนักดิน (g)}'}} \\right)}{10000}
                                  `}
                                  />
                                ) : (
                                  <BlockMath
                                    math={`
                                    ${labSetting.laboratory?.shortNameBefore} (\\%) = 
                                    \\frac{\\left[ (${labSetting?.extractConcentration || '\\text{ความเข้มข้นสารสกัด (mol)}'} - 
                                    (${labSetting?.intercept?.toFixed(3) || '\\text{Intercept (a)}'} + 
                                    ${labSetting?.slope?.toFixed(3) || '\\text{Slope (b)}'} \\times 
                                    ${labSetting?.laboratory?.shortNameBefore} (\\text{${labSetting?.laboratory?.unitBefore}})) \\right] 
                                    \\times 9000 \\times \\left( \\frac{${labSetting?.extractAmount || '\\text{ปริมาณสารสกัด (mL)}'}}{${labSetting?.dirtWeight || '\\text{น้ำหนักดิน (g)}'}} \\right)}{10000}
                                  `}
                                  />
                                )}
                              </div>
                            </div>

                            {/* 2. ScatterWithLine Graph */}
                            <div className="row">
                              {/* กราฟ - ให้ใหญ่ขึ้นในหน้าจอขนาดปกติ และเต็มในมือถือ */}
                              <div className="col-7 md:col-6">
                                <div className="py-3 pr-2">
                                  <ScatterWithLine
                                    slope={labSetting.slope ?? 0}
                                    intercept={labSetting.intercept ?? 0}
                                    scatterPoints={labSetting.laboratorySettingDetails.map(
                                      (lab: {
                                        absorbance: number;
                                        workingStandard: number;
                                      }) => ({
                                        x: isP(
                                          labSetting.laboratory?.machineType
                                            ?.type
                                        )
                                          ? lab.workingStandard
                                          : lab.absorbance,
                                        y: isP(
                                          labSetting.laboratory?.machineType
                                            ?.type
                                        )
                                          ? lab.absorbance
                                          : lab.workingStandard,
                                      })
                                    )}
                                  />
                                </div>
                              </div>

                              {/* ตาราง - ให้แคบลงในหน้าจอปกติ และเต็มในมือถือ */}
                              <div className="col-5 md:col-6">
                                <div className="overflow-auto mt-4 md:mt-0">
                                  <table className="table-fixed w-full table-bordered text-xs">
                                    <thead>
                                      <tr>
                                        <th className="border border-gray-300 px-2 py-2 truncate text-center">
                                          {isP(
                                            labSetting.laboratory?.machineType
                                              ?.type
                                          )
                                            ? 'Working_standard'
                                            : 'Absorbance'}
                                        </th>
                                        <th className="border border-gray-300 px-1 py-2 truncate text-center">
                                          {isP(
                                            labSetting.laboratory?.machineType
                                              ?.type
                                          )
                                            ? 'Absorbance'
                                            : 'Working_standard'}
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {labSetting.laboratorySettingDetails.map(
                                        row => (
                                          <tr
                                            key={`${row.laboratorySettingId}-${row.absorbance}`}
                                          >
                                            <td className="text-center border border-gray-300 px-2 py-2 truncate">
                                              {isP(
                                                labSetting.laboratory
                                                  ?.machineType?.type
                                              )
                                                ? row.workingStandard
                                                : row.absorbance}
                                            </td>
                                            <td className="text-center border border-gray-300 px-1 py-2 truncate">
                                              {isP(
                                                labSetting.laboratory
                                                  ?.machineType?.type
                                              )
                                                ? row.absorbance
                                                : row.workingStandard}
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>

                            {/* 3. Summary of regression */}
                            <div>
                              <p className="mt-4 mb-0 text-sm">
                                Working_standard ={' '}
                                {labSetting.slope != null &&
                                  labSetting.intercept != null
                                  ? `${labSetting.slope.toFixed(3)} * Absorbance + ${labSetting.intercept < 0
                                    ? `(${labSetting.intercept.toFixed(3)})`
                                    : `${labSetting.intercept.toFixed(3)}`
                                  }`
                                  : '-'}
                              </p>
                              <p className="text-sm">
                                R² ={' '}
                                {labSetting.rSquared != null
                                  ? labSetting.rSquared.toFixed(3)
                                  : '-'}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="text-danger">ไม่พบข้อมูล</div>
                        )
                      ) : (
                        <div>
                          <BlockMath
                            math={`
                              ${labSetting.laboratory.shortNameBefore}_{\\text{post}} = 
                              ${labSetting.laboratory.shortNameBefore}_{\\text{pre}} \\times 
                              \\frac{\\text{ปริมาณสารสกัด (mL)}}{\\text{น้ำหนักดิน (g)}}
                            `}
                          />

                          <BlockMath
                            math={`
                              ${labSetting.laboratory.shortNameBefore} (\\text{${labSetting.laboratory.unitAfter}}) = 
                              ${labSetting.laboratory.shortNameBefore} (\\text{${labSetting.laboratory.unitBefore}}) \\times 
                              \\frac{${labSetting.extractAmount || '\\text{ปริมาณสารสกัด (mL)}'}}{${labSetting.dirtWeight || '\\text{น้ำหนักดิน (g)}'}} 
                              ${labSetting.dirtWeight &&
                                labSetting.extractAmount
                                ? `= ${labSetting.laboratory.shortNameBefore} (\\text{${labSetting.laboratory.unitBefore}}) \\times ${getDivided(labSetting.extractAmount, labSetting.dirtWeight)}`
                                : ''
                              }
                            `}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </>
      ) : (
        <div className="mt-4">ไม่พบข้อมูลการให้บริการในวันนี้</div>
      )}
      {/* standard modals */}
      <SelectStandardModal
        show={showStandardModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        description={
          selectedServiceCalendar
            ? `รถ ${selectedServiceCalendar.bus.busName} วันที่ ${formatDMYDate(serviceDate)}`
            : undefined
        }
      >
        <>
          <StandardTable
            standards={standardData}
            laboratories={labList}
            selectedStandards={selectedStandards}
            onAdd={handleAdd}
          />
          <StandardTableInfo
            selectedStandards={selectedStandards}
            onRemove={handleRemove}
            onRepeatChange={handleRepeatChange}
          />
        </>
      </SelectStandardModal>
      {/* standard blank */}
      <StandardBlankModal
        show={showBlankModal}
        onClose={() => setShowBlankModal(false)}
        onSave={handleSaveBlank}
      />
    </>
  );
};

export default ExamSetting;
