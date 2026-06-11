import React, { useEffect, useState } from 'react';
import { BlockMath } from 'react-katex';
import { Link } from 'react-router-dom';
import '../../../../public/assets/css/katex.css';
import 'katex/dist/katex.min.css';
import Swal from 'sweetalert2';

import ScatterWithLine from '../../../components/chart/ScatterWithLine';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import {
  GenFormDate2,
  GenFormSelect,
  MarkedDateStatus,
} from '../../../components/gui/GuiForm';
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
  deleteAnalysisStandard,
  getAnalysisStandardsByCalendar,
} from '@/services/api/standard-sample/AnalysisStandardsAPI';
import { LaboratoryInfoInterface } from '@/types/Laboratory';
import {
  StandardType,
  AnalysisStandardInterface,
} from '@/types/standard-sample/AnalysisStandards';
import { StandardInfo } from '@/types/standard-sample/standard';

const getDivided = (x: number | null, y: number | null): number => {
  if (x == null || y == null) return 0;
  return x / y;
};

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-center py-4 text-muted">
    <i className="fas fa-inbox fa-2x mb-2 d-block opacity-50"></i>
    <span>{text}</span>
  </div>
);

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
  const [selectedStandards, setSelectedStandards] = useState<StandardInfo[]>(
    []
  );
  const [repeatCounts, setRepeatCounts] = useState<Record<number, number>>({});
  const [showStandardModal, setShowStandardModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBlankModal, setShowBlankModal] = useState(false);
  const [searchParam, setSearchParam] = useState<SearchServiceCalendar>(
    {} as SearchServiceCalendar
  );

  const fetchAnalysisStandards = async (calendarId: number) => {
    const data = await getAnalysisStandardsByCalendar(calendarId);
    const cleaned = data
      .filter(d => d.standard != null)
      .map(d => ({ ...d.standard!, type: d.type as StandardType }));
    setAnalysisStandards(data);
    setSelectedStandards(cleaned);
  };

  const handleRepeatChange = (standardId: number, count: number) => {
    setRepeatCounts(prev => ({ ...prev, [standardId]: count }));
  };
  const getExistingSelected = () =>
    analysisStandards
      .filter(d => d.standard != null)
      .map(d => ({ ...d.standard!, type: d.type as StandardType }));

  const handleModalOpen = async () => {
    if (selectedServiceCalendarId) {
      await fetchAnalysisStandards(selectedServiceCalendarId);
    }
    setShowStandardModal(true);
  };
  const handleModalClose = () => {
    setSelectedStandards(getExistingSelected());
    setShowStandardModal(false);
  };
  const handleAdd = (standard: StandardInfo) => {
    setSelectedStandards(prev => [
      ...prev,
      { ...standard, type: StandardType.CRM },
    ]);
  };
  const handleRemove = (standardId: number) => {
    setSelectedStandards(prev =>
      prev.filter(s => s && s.standardId !== standardId)
    );
  };

  const handleModalSave = async () => {
    if (!selectedServiceCalendarId) return;
    const savedStandardIds = new Set(
      analysisStandards
        .filter(a => a.standardId != null)
        .map(a => a.standardId!)
    );
    const visibleCRM = selectedStandards.filter(
      (s): s is StandardInfo => s != null && s.type === StandardType.CRM
    );
    const toAdd = visibleCRM.filter(s => !savedStandardIds.has(s.standardId));
    if (toAdd.length === 0) {
      return Swal.fire({
        icon: 'info',
        title: 'ไม่มีมาตรฐานใหม่ให้เพิ่ม',
        text: 'คุณยังไม่ได้เลือกมาตรฐานใหม่ใด ๆ',
      });
    }
    const payload = {
      serviceCalendarId: selectedServiceCalendarId,
      standard: toAdd.map(s => ({
        standardId: s.standardId,
        name: s.standardName,
        repeatCount: repeatCounts[s.standardId] ?? 1,
        type: StandardType.CRM,
      })),
    };
    setIsSaving(true);
    try {
      await createAnalysisStandard(payload);
      setShowStandardModal(false);
      await fetchAnalysisStandards(selectedServiceCalendarId);
      await Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ' });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'บันทึกไม่สำเร็จ';
      Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStandard = async (analysisStandardId: number) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ลบมาตรฐานนี้?',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteAnalysisStandard(analysisStandardId);
      await fetchAnalysisStandards(selectedServiceCalendarId!);
    } catch {
      Swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ' });
    }
  };

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
          .filter(d => d.standard != null)
          .map(d => ({ ...d.standard!, type: d.type as StandardType }));
        setSelectedStandards(selected);
      })();
    }
  }, [selectedServiceCalendarId]);

  useEffect(() => {
    const fetchCalendar = async () => {
      const payload: SearchServiceCalendar = { ...searchParam, all: true };
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

  return (
    <>
      {/* Date & Car selector */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-calendar-alt me-2" />
                เลือกวันที่และรถให้บริการ
              </h4>
            </div>
            <div className="private-card-body">
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
                      setSearchParam({ year, month });
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
            </div>
          </div>
        </div>
      </div>

      {selectedServiceCalendar ? (
        <>
          {/* CRM Standards Table */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="private-card">
                <div className="private-card-header d-flex align-items-center justify-content-between">
                  <h4 className="private-card-title mb-0">
                    <i className="fas fa-vial me-2" />
                    CRM Standards
                  </h4>
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    onClick={handleModalOpen}
                  />
                </div>
                <div className="private-card-body">
                  {analysisStandards.filter(as => as.standard).length > 0 ? (
                    <div className="table-responsive">
                      {analysisStandards.map(as => {
                        const standard = as.standard;
                        if (!standard) return null;
                        const resultsByLab =
                          standard.standardCertificates.reduce(
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
                                  {standard.standardName}
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
                                <th className="text-center">Certificate</th>
                                {labIds.map(labId => (
                                  <td key={labId} className="text-center">
                                    {resultsByLab[labId]?.certificateValue ??
                                      '-'}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState text="ยังไม่มี CRM Standards สำหรับวันให้บริการนี้" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Blank Standards Table */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="private-card">
                <div className="private-card-header d-flex align-items-center justify-content-between">
                  <h4 className="private-card-title mb-0">
                    <i className="fas fa-flask me-2" />
                    Blank Standards
                  </h4>
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    onClick={() => setShowBlankModal(true)}
                  />
                </div>
                <div className="private-card-body">
                  {analysisStandards.filter(
                    as => as.type === StandardType.BLANK
                  ).length > 0 ? (
                    <div className="table-responsive">
                      {analysisStandards
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
                                    {as.name || '(ไม่มีชื่อ)'}
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
                                          : (lab?.labShortName ?? '-')}
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {[...Array(as.repeatCount)].map((_, idx) => (
                                  <tr key={`repeat-${idx + 1}`}>
                                    <th className="text-center">
                                      Repeat {idx + 1}
                                    </th>
                                    {labIds.map(labId => {
                                      const entry = groupedResults[labId]?.find(
                                        r => r.repeatNumber === idx + 1
                                      );
                                      return (
                                        <td
                                          // eslint-disable-next-line react-x/no-array-index-key
                                          key={`${labId}-${idx}`}
                                          className="text-center"
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
                        })}
                    </div>
                  ) : (
                    <EmptyState text="ยังไม่มี Blank Standards สำหรับวันให้บริการนี้" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Experiment Configuration */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="private-card">
                <div className="private-card-header d-flex align-items-center justify-content-between">
                  <h4 className="private-card-title mb-0">
                    <i className="fas fa-sliders-h me-2" />
                    การตั้งค่า — รถ {selectedServiceCalendar.bus.busName}{' '}
                    <small className="text-muted fw-normal">
                      วันที่ {formatDMYDate(serviceDate)}
                    </small>
                  </h4>
                  <div className="d-flex align-items-center gap-2">
                    <Link
                      to={`/officer/analysis-setting/${selectedServiceCalendarId}/edit`}
                    >
                      <GenButtonCircle
                        color={B_LIST.edit.color}
                        icon={B_LIST.edit.icon}
                      />
                    </Link>
                  </div>
                </div>
                <div className="private-card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>ความเข้มข้นสารสกัด (mol)</th>
                          <th>ปริมาณสารสกัด (L)</th>
                          <th>Intercept (a)</th>
                          <th>Slope (b)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedServiceCalendar.laboratorySettings?.map(
                          (labSetting: LaboratorySettingInfo) => (
                            <tr key={`lab-${labSetting.laboratorySettingId}`}>
                              <td className="text-center">
                                {labSetting.laboratory.shortNameAfter}
                              </td>
                              <td className="text-center">
                                {isOM(labSetting.laboratory.machineType.type)
                                  ? labSetting.extractConcentration
                                  : '-'}
                              </td>
                              <td className="text-center">
                                {labSetting.extractAmount}
                              </td>
                              <td className="text-center">
                                {labSetting.intercept?.toFixed(3) ?? '-'}
                              </td>
                              <td className="text-center">
                                {labSetting.slope?.toFixed(3) ?? '-'}
                              </td>
                            </tr>
                          )
                        )}
                        {selectedServiceCalendar.laboratorySettings
                          ?.filter(lab => lab.convertOmSettings.length > 0)
                          .map(labSetting => (
                            <tr
                              key={`convert-${labSetting.laboratorySettingId}`}
                            >
                              <td className="text-center">Convert OM</td>
                              <td className="text-center">-</td>
                              <td className="text-center">-</td>
                              <td className="text-center">
                                {labSetting.convertOmSettings[0].intercept ??
                                  '-'}
                              </td>
                              <td className="text-center">
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

          {/* Laboratory Settings — Working Standard / Formula */}
          <div className="row g-3">
            {selectedServiceCalendar.laboratorySettings?.map(
              (labSetting: LaboratorySettingInfo) => (
                <div className="col-md-6" key={labSetting.laboratorySettingId}>
                  <div className="private-metric-card h-100">
                    <div className="private-card-header d-flex align-items-center justify-content-between">
                      {isOM(labSetting.laboratory.machineType.type) ||
                      isP(labSetting.laboratory.machineType.type) ? (
                        <>
                          <h4 className="private-card-title mb-0">
                            <i className="fas fa-chart-line me-2" />
                            Working Standard (
                            {labSetting.laboratory.shortNameBefore})
                          </h4>
                          <GenButtonCircle
                            color={B_LIST.edit.color}
                            icon={B_LIST.edit.icon}
                            link={`/officer/analysis-setting/${labSetting.laboratorySettingId}/edit-working-standard`}
                          />
                        </>
                      ) : (
                        <h4 className="private-card-title mb-0">
                          <i className="fas fa-exchange-alt me-2" />
                          การแปลงค่า ({labSetting.laboratory.shortNameBefore})
                        </h4>
                      )}
                    </div>

                    <div className="private-card-body">
                      {isOM(labSetting.laboratory.machineType.type) ||
                      isP(labSetting.laboratory.machineType.type) ? (
                        labSetting.laboratorySettingDetails?.length ? (
                          <>
                            <div className="mb-3">
                              <BlockMath
                                math={`
                                  ${labSetting.laboratory?.shortNameBefore}_{\\text{post}} =
                                  \\frac{\\left[ \\left( \\text{ความเข้มข้นสารสกัด (mol)} \\right) -
                                  \\left( \\text{Intercept (a)} + \\text{Slope (b)} \\times
                                  \\text{${labSetting.laboratory?.shortNameBefore}}_{\\text{pre}} \\right) \\right]
                                  \\times 9000 \\times \\left( \\frac{\\text{ปริมาณสารสกัด (mL)}}{\\text{น้ำหนักดิน (g)}} \\right)}{10000}
                                `}
                              />
                              <div className="mt-2">
                                {isP(
                                  labSetting.laboratory?.machineType?.type
                                ) ? (
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

                            <div className="row g-2">
                              <div className="col-7">
                                <div className="py-2 pe-2">
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
                              <div className="col-5">
                                <div className="table-responsive mt-2">
                                  <table className="table table-bordered table-sm text-center">
                                    <thead>
                                      <tr>
                                        <th>
                                          {isP(
                                            labSetting.laboratory?.machineType
                                              ?.type
                                          )
                                            ? 'Working std'
                                            : 'Absorbance'}
                                        </th>
                                        <th>
                                          {isP(
                                            labSetting.laboratory?.machineType
                                              ?.type
                                          )
                                            ? 'Absorbance'
                                            : 'Working std'}
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {labSetting.laboratorySettingDetails.map(
                                        row => (
                                          <tr
                                            key={`${row.laboratorySettingId}-${row.absorbance}`}
                                          >
                                            <td>
                                              {isP(
                                                labSetting.laboratory
                                                  ?.machineType?.type
                                              )
                                                ? row.workingStandard
                                                : row.absorbance}
                                            </td>
                                            <td>
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

                            <div className="mt-2 small text-muted">
                              <div>
                                Working_standard ={' '}
                                {labSetting.slope != null &&
                                labSetting.intercept != null
                                  ? `${labSetting.slope.toFixed(3)} ร— Absorbance ${labSetting.intercept < 0 ? `โ’ ${Math.abs(labSetting.intercept).toFixed(3)}` : `+ ${labSetting.intercept.toFixed(3)}`}`
                                  : '-'}
                              </div>
                              <div>
                                Rยฒ ={' '}
                                {labSetting.rSquared != null
                                  ? labSetting.rSquared.toFixed(3)
                                  : '-'}
                              </div>
                            </div>
                          </>
                        ) : (
                          <EmptyState text="ไม่พบข้อมูล Working Standard" />
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
                              ${
                                labSetting.dirtWeight &&
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
        <div className="row mt-2">
          <div className="col-12">
            <div className="private-card">
              <div className="private-card-body">
                <EmptyState text="ไม่พบข้อมูลการให้บริการในวันที่เลือก" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SelectStandardModal
        show={showStandardModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        isSaving={isSaving}
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
            existingAnalysisStandards={analysisStandards.filter(
              a => a.type === 'crm'
            )}
            onRemove={handleRemove}
            onDelete={handleDeleteStandard}
            onRepeatChange={handleRepeatChange}
          />
        </>
      </SelectStandardModal>
      <StandardBlankModal
        show={showBlankModal}
        onClose={() => setShowBlankModal(false)}
        onSave={handleSaveBlank}
      />
    </>
  );
};

export default ExamSetting;
