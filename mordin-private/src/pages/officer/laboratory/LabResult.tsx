import { AxiosError } from 'axios';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import { GenButtonCircle } from '@/components/gui/GuiButton';
import {
  GenFormDate2,
  GenFormSelect,
  MarkedDateStatus,
} from '@/components/gui/GuiForm';
import LabResultModal from '@/components/pages/lab-result/LabResultModal';
import LabResultSummaryCard from '@/components/pages/lab-result/LabResultSummaryCard';
import LabResultTable from '@/components/pages/lab-result/LabResultTable';
import TableWithCheckbox from '@/components/pages/lab-result/LabResultTableWithCheckbox';
import StandardLabResultTable from '@/components/pages/lab-result/StandardLabResultTable';
import CsvTemplateDownload from '@/components/pages/lab-result-csv-input/CsvTemplateDownload';
import QrScanner from '@/components/scanner/QrScanner';
import { getAllLaboratories } from '@/services/api/laboratory/LaboratoryApi';
import {
  getReceivedBooksByServiceCalendarId,
  getSampleResultsByServCalendarId,
  selectReceivedBooksByByServiceCalendarId,
} from '@/services/api/qr-code/BookApi';
import { inputResult, uploadCsvFile } from '@/services/api/result/ResultApi';
import { searchServiceCalendars } from '@/services/api/ServiceCalendarApi';
import {
  getAnalysisStandardsByCalendar,
  inputAnalysisStandardResults,
} from '@/services/api/standard-sample/AnalysisStandardsAPI';
import { Bus } from '@/types/Bus';
import { Laboratory } from '@/types/Laboratory';
import { Book, QrCode, SampleStatusEnum } from '@/types/qr-code/QrCode';
import { ResultInput } from '@/types/result/Result';
import { sampleBlankResultInfo } from '@/types/sample-blank/sampleBlankResult';
import {
  CalendarInfoInterface,
  SearchServiceCalendar,
  ServiceCalendarWithStatus,
} from '@/types/ServiceCalendar';
import {
  AnalysisStandardInterface,
  UpdateAnalysisStandardResultDto,
} from '@/types/standard-sample/AnalysisStandards';
import {
  swalSuccessTimer,
  swalError,
  swalWarning,
  swalInfo,
  swalLoading,
  swalClose,
} from '@/utils/swal';

const LabResult: React.FC = () => {
  const [laboratoryData, setLaboratoryData] = useState<Laboratory[]>();
  const [file, setFile] = useState<File | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [serviceDate, setServiceDate] = useState<string>(today);
  const [serviceCalendars, setServiceCalendars] = useState<
    CalendarInfoInterface[]
  >([]);
  const [matchCalendar, setMatchCalendar] = useState<CalendarInfoInterface[]>(
    []
  );
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [selectedServiceCalendar, setSelectedServiceCalendar] =
    useState<CalendarInfoInterface | null>(null);
  const [markedDates, setMarkedDates] = useState<MarkedDateStatus[]>([]);
  const [modalServiceCalendars, setModalServiceCalendars] = useState<
    CalendarInfoInterface[]
  >([]);
  const [markedDatesModal, setMarkedDatesModal] = useState<MarkedDateStatus[]>(
    []
  );

  const [showModal, setShowModal] = useState<boolean>(false);
  const [analysisService, setAnalysisService] = useState<
    Array<{ qrCode: QrCode; result: sampleBlankResultInfo[] }>
  >([]);
  const [analysisServiceRepeat, setAnalysisServiceRepeat] = useState<
    Array<{ qrCode: QrCode; result: sampleBlankResultInfo[] }>
  >([]);
  const [receivedCalendar, setReceivedCalendar] = useState<
    CalendarInfoInterface[]
  >([]);
  const [receivedService, setReceivedService] = useState<Book[]>([]);
  const [receivedDate, setReceivedDate] = useState<string>(today);
  const [receivedCar, setReceivedCar] = useState<number | null>(null);
  const [receivedBusOption, setReceivedBusOption] = useState<
    { value: number; name: string }[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [resultValue, setResultvalue] = useState<ResultInput[]>([]);
  const [selectedResult, setSelectedResult] = useState<{
    qrCode: QrCode;
    result: sampleBlankResultInfo;
  } | null>(null);

  const navigate = useNavigate();

  const [searchParam, setSearchParam] = useState<SearchServiceCalendar>(
    {} as SearchServiceCalendar
  );
  const [modalSearchParam, setModalSearchParam] =
    useState<SearchServiceCalendar>({} as SearchServiceCalendar);

  const [standardAnalysisData, setStandardAnalysisData] = useState<
    AnalysisStandardInterface[]
  >([]);
  const [standardAnalysisData_blank, setStandardAnalysisData_blank] = useState<
    AnalysisStandardInterface | undefined
  >(undefined);
  const [standardAnalysisData_standard, setStandardAnalysisData_standard] =
    useState<AnalysisStandardInterface[]>([]);

  useEffect(() => {
    const fetchCalendar = async () => {
      const payload: SearchServiceCalendar = { ...searchParam, all: true };
      const calData = await searchServiceCalendars(payload);
      setServiceCalendars(calData.data);
      setMarkedDates(
        calData.data.map((c: ServiceCalendarWithStatus) => ({
          date: new Date(c.date).toISOString().split('T')[0],
          status: c.analysisResultStatus,
        }))
      );
    };
    fetchCalendar();
  }, [searchParam]);

  useEffect(() => {
    const fetchCalendar = async () => {
      if (!showModal) return;
      const payload: SearchServiceCalendar = { ...modalSearchParam, all: true };
      const calData = await searchServiceCalendars(payload);
      setModalServiceCalendars(calData.data);
      setMarkedDatesModal(
        calData.data.map((c: ServiceCalendarWithStatus) => ({
          date: new Date(c.date).toISOString().split('T')[0],
          status: c.sampleLeftStatus,
        }))
      );
    };
    fetchCalendar();
  }, [modalSearchParam, showModal]);

  const fetchLaboratory = async () => {
    const labData = await getAllLaboratories();
    setLaboratoryData(labData);
  };
  useEffect(() => {
    fetchLaboratory();
  }, []);

  useEffect(() => {
    const matched = serviceCalendars.filter(
      c => new Date(c.date).toISOString().split('T')[0] === serviceDate
    );
    if (matched.length > 0) {
      setMatchCalendar(matched);
      setBuses(matched.map(item => item.bus));
      if (!selectedBusId) setSelectedBusId(matched[0].bus.busId);
    } else {
      setMatchCalendar([]);
      setBuses([]);
      setSelectedBusId(null);
      setSelectedServiceCalendar(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceCalendars, serviceDate]);

  useEffect(() => {
    if (!selectedBusId) return;
    const found = matchCalendar.find(m => m.bus.busId === selectedBusId);
    setSelectedServiceCalendar(found || null);
  }, [matchCalendar, selectedBusId]);

  const fetchExperimentService = useCallback(async () => {
    try {
      setLoading(true);
      if (selectedServiceCalendar?.serviceCalendarId) {
        const response: Array<{
          qrCode: QrCode;
          result: sampleBlankResultInfo[];
        }> = await getSampleResultsByServCalendarId(
          selectedServiceCalendar.serviceCalendarId
        );
        if (response) {
          const onlyExperiment = response.filter(
            object =>
              object.qrCode.status === SampleStatusEnum.ANALYZING ||
              object.qrCode.status === SampleStatusEnum.ANALYZED ||
              object.qrCode.status === SampleStatusEnum.APPROVED
          );
          if (onlyExperiment) {
            const noRepeatExperiment = onlyExperiment.filter(
              obj => obj?.qrCode?.book?.sampleAnalysisNumber % 15 !== 0
            );
            setAnalysisService(noRepeatExperiment);

            if (onlyExperiment.length >= 15) {
              const onlyRepeatExperiment = onlyExperiment.filter(
                obj => obj?.qrCode?.book?.sampleAnalysisNumber % 15 === 0
              );
              const groupedResults: {
                qrCode: QrCode;
                result: sampleBlankResultInfo[];
              }[] = [];

              onlyRepeatExperiment.forEach(obj => {
                let repeatNumber = obj?.result?.[0]?.repeatNumber ?? 1;
                let repeatGroup: sampleBlankResultInfo[] = [];
                let resultLength = 0;
                const averageGroup: sampleBlankResultInfo[] = [];

                obj?.result?.forEach((item, index) => {
                  const repeatNo = item.repeatNumber;
                  if (repeatNo === repeatNumber) {
                    repeatGroup.push({ ...item });
                  } else {
                    groupedResults.push({
                      qrCode: {
                        ...obj.qrCode,
                        book: {
                          ...obj.qrCode.book,
                          sampleCode: `${obj.qrCode.book.sampleCode}/${repeatNumber}`,
                        },
                      },
                      result: [...repeatGroup],
                    });

                    repeatGroup = [{ ...item }];
                    repeatNumber = repeatNo;
                  }

                  if (repeatNo === 1) {
                    averageGroup.push({ ...item });
                    resultLength++;
                  } else {
                    const idx = index % resultLength;
                    if (averageGroup[idx].preValue) {
                      averageGroup[idx].preValue += item?.preValue ?? 0;
                    } else {
                      averageGroup[idx].preValue = null;
                    }
                    if (averageGroup[idx].postValue) {
                      averageGroup[idx].postValue += item?.postValue ?? 0;
                    } else {
                      averageGroup[idx].postValue = null;
                    }
                  }
                });

                averageGroup?.map((result, index) => {
                  averageGroup[index] = {
                    ...result,
                    preValue: result.preValue
                      ? result?.preValue / repeatNumber
                      : null,
                    postValue: result.postValue
                      ? result?.postValue / repeatNumber
                      : null,
                  };
                });

                if (repeatGroup.length > 0) {
                  groupedResults.push({
                    qrCode: {
                      ...obj.qrCode,
                      book: {
                        ...obj.qrCode.book,
                        sampleCode: `${obj.qrCode.book.sampleCode}/${repeatNumber}`,
                      },
                    },
                    result: [...repeatGroup],
                  });
                }

                setAnalysisService(prev => [
                  ...prev,
                  {
                    qrCode: { ...obj?.qrCode },
                    result: [...averageGroup],
                  },
                ]);
              });

              setAnalysisServiceRepeat(groupedResults);
            } else {
              setAnalysisServiceRepeat([]);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedServiceCalendar]);

  useEffect(() => {
    fetchExperimentService();
  }, [fetchExperimentService]);

  useEffect(() => {
    const opts = modalServiceCalendars.filter(
      c => new Date(c.date).toISOString().split('T')[0] === receivedDate
    );
    if (opts) {
      setReceivedCalendar(opts);
      const busOptsopts = opts.map(c => ({
        value: c.busId!,
        name: `${c.bus.busNumber}-${c.bus.busName} (${c.bus.licensePlate})`,
      }));
      setReceivedBusOption(busOptsopts);
      if (busOptsopts.length) setReceivedCar(busOptsopts[0].value);
      else setReceivedCar(null);
    } else {
      setReceivedCalendar([]);
      setReceivedBusOption([]);
      setReceivedCar(null);
    }
  }, [receivedDate, modalServiceCalendars]);

  useEffect(() => {
    const fetchReceivedService = async () => {
      setLoading(true);
      const bus = receivedCalendar.find(item => item.busId === receivedCar);
      if (bus?.busId) {
        const response: Book[] = await getReceivedBooksByServiceCalendarId(
          bus?.serviceCalendarId
        );
        if (response) {
          const onlyReceived = response.filter(
            object => object.qrCode.status === SampleStatusEnum.RECEIVED
          );
          if (onlyReceived) {
            setReceivedService(onlyReceived);
          }
        }
      }
      setLoading(false);
    };
    fetchReceivedService();
  }, [receivedCalendar, receivedCar, showModal]);

  useEffect(() => {
    const fetchStandardSamples = async () => {
      try {
        const calendarId = selectedServiceCalendar?.serviceCalendarId;
        if (calendarId) {
          const data = await getAnalysisStandardsByCalendar(calendarId);
          setStandardAnalysisData(data);
          setStandardAnalysisData_blank(
            data.find(item => item.type === 'blank')
          );
          setStandardAnalysisData_standard(
            data.filter(item => item.type === 'crm')
          );
        }
      } catch (error) {
        console.error('Error fetching standard analysis data:', error);
      }
    };
    fetchStandardSamples();
  }, [selectedServiceCalendar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitPreValue = async (resultValue: ResultInput[]) => {
    if (!resultValue || resultValue.length === 0) {
      await swalWarning(
        'ยังไม่มีค่าที่จะบันทึก',
        'กรุณากรอกค่าผลวิเคราะห์ก่อนกดบันทึก'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await inputResult(resultValue);
      const pendingCalculation = Array.isArray(response)
        ? response.some(
            (result: { preValue: number | null; postValue: number | null }) =>
              result.preValue !== null &&
              result.preValue !== undefined &&
              (result.postValue === null || result.postValue === undefined)
          )
        : false;

      if (pendingCalculation) {
        await swalInfo(
          'บันทึกค่าดิบแล้ว',
          'ระบบยังไม่คำนวณค่าหลังแปลงสำหรับ OM/P เพราะยังไม่มีค่า Working Standard ครบถ้วน'
        );
      } else {
        await swalSuccessTimer(
          'บันทึกผลวิเคราะห์สำเร็จ',
          'ระบบบันทึกและคำนวณผลเรียบร้อยแล้ว',
          1500
        );
      }

      fetchExperimentService();
      setResultvalue([]);
      setSelectedResult(null);
    } catch (error) {
      const err = error as AxiosError<{ message: string; statusCode?: number }>;
      const errorMessage = err.response?.data?.message || '';
      const isAnalysisSettingError =
        errorMessage.includes('Step3-Analysis Setting') ||
        errorMessage.includes('ตั้งค่าใน Step3');

      if (isAnalysisSettingError) {
        await swalWarning(
          'ยังบันทึกค่าจากตารางไม่ได้',
          'ค่านี้ต้องใช้การตั้งค่า Working Standard ใน Analysis Setting ให้ครบก่อน ระบบจึงจะบันทึกและคำนวณผลได้'
        );
      } else {
        await swalError(
          'บันทึกค่าจากตารางไม่สำเร็จ',
          errorMessage || 'กรุณาตรวจสอบค่าที่กรอกแล้วลองใหม่อีกครั้ง'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStandardPreValue = async (
    resultValue: UpdateAnalysisStandardResultDto[]
  ) => {
    if (resultValue && resultValue.length > 0) {
      setLoading(true);
      try {
        await inputAnalysisStandardResults(resultValue);
        swalSuccessTimer(
          'บันทึกสำเร็จ',
          'บันทึกข้อมูล Standard/Blank เรียบร้อยแล้ว',
          1500
        );
        const calendarId = selectedServiceCalendar?.serviceCalendarId;
        if (calendarId) {
          const data = await getAnalysisStandardsByCalendar(calendarId);
          setStandardAnalysisData(data);
          setStandardAnalysisData_blank(
            data.find(item => item.type === 'blank')
          );
          setStandardAnalysisData_standard(
            data.filter(item => item.type === 'crm')
          );
        }
      } catch (error) {
        console.error('Error submitting standard result:', error);
        swalError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
      }
      setLoading(false);
    }
  };

  const allLabLabels = useMemo(() => {
    const labelsFromAnalysis = analysisService.flatMap(item =>
      item.result.map(
        r =>
          `${r.laboratorySetting.laboratory.shortNameBefore} (${r.laboratorySetting.laboratory.unitBefore})`
      )
    );
    const labelsFromStandard = standardAnalysisData.flatMap(item =>
      item.analysisStandardResults.map(
        r =>
          `${r.laboratorySetting?.laboratory?.shortNameBefore} (${r.laboratorySetting?.laboratory?.unitBefore})`
      )
    );
    return Array.from(new Set([...labelsFromAnalysis, ...labelsFromStandard]));
  }, [analysisService, standardAnalysisData]);

  const csvHeaders = useMemo(
    () => ['sampleCode', 'type', ...allLabLabels],
    [allLabLabels]
  );

  const csvRows = useMemo(() => {
    const rows: (string | number)[][] = [];

    const repeatBaseCodes = new Set(
      analysisServiceRepeat
        .map(item => {
          const code = item.qrCode.book.sampleCode;
          return code.includes('/') ? code.split('/')[0] : null;
        })
        .filter(Boolean)
    );

    [...analysisService]
      .filter(item => !repeatBaseCodes.has(item.qrCode.book.sampleCode))
      .sort((a, b) =>
        a.qrCode.book.sampleCode.localeCompare(b.qrCode.book.sampleCode)
      )
      .forEach(item => {
        const sampleCode = item.qrCode.book.sampleCode;
        const values = allLabLabels.map(label => {
          const match = item.result.find(r => {
            const labLabel = `${r.laboratorySetting.laboratory.shortNameBefore} (${r.laboratorySetting.laboratory.unitBefore})`;
            return labLabel === label;
          });
          return !match || match.preValue == null || match.preValue === 0
            ? ''
            : match.preValue;
        });
        rows.push([sampleCode, 'sample', ...values]);
      });

    [...analysisServiceRepeat]
      .sort((a, b) =>
        a.qrCode.book.sampleCode.localeCompare(b.qrCode.book.sampleCode)
      )
      .forEach(item => {
        const sampleCode = item.qrCode.book.sampleCode;
        const values = allLabLabels.map(label => {
          const match = item.result.find(r => {
            const labLabel = `${r.laboratorySetting.laboratory.shortNameBefore} (${r.laboratorySetting.laboratory.unitBefore})`;
            return labLabel === label;
          });
          return !match || match.preValue == null || match.preValue === 0
            ? ''
            : match.preValue;
        });
        rows.push([sampleCode, 'sample', ...values]);
      });

    standardAnalysisData.forEach(item => {
      const grouped = new Map<number, typeof item.analysisStandardResults>();
      item.analysisStandardResults.forEach(r => {
        const rep = r.repeatNumber || 1;
        if (!grouped.has(rep)) grouped.set(rep, []);
        grouped.get(rep)!.push(r);
      });
      grouped.forEach((results, rep) => {
        const values = allLabLabels.map(label => {
          const match = results.find(r => {
            const labLabel = `${r.laboratorySetting?.laboratory?.shortNameBefore ?? ''} (${r.laboratorySetting?.laboratory?.unitBefore ?? ''})`;
            return labLabel === label;
          });
          return !match || match.preValue == null || match.preValue === 0
            ? ''
            : match.preValue;
        });
        rows.push([`${item.name}/${rep}`, item.type, ...values]);
      });
    });

    return rows;
  }, [
    analysisService,
    analysisServiceRepeat,
    standardAnalysisData,
    allLabLabels,
  ]);

  const csvFileName = `Labresult_${serviceDate}_${selectedBusId ?? 'unknown'}.csv`;

  const handleUploadCSV = async () => {
    if (!file) {
      await swalWarning(
        'ยังไม่ได้เลือกไฟล์',
        'กรุณาเลือกไฟล์ CSV ก่อนทำการอัปโหลด'
      );
      return;
    }
    swalLoading('กำลังอัปโหลด…');
    setLoading(true);
    try {
      const result = await uploadCsvFile(file);
      swalClose();
      const s = result.sample.summary;
      await Swal.fire({
        title: 'อัปโหลดสำเร็จ',
        html: `
          Total rows: ${s.totalRowsInCsv}<br/>
          Processed (Sample): ${s.processedRows}<br/>
          Updated (Sample): ${s.updatedCount}<br/>
          Updated (Blank/CRM): ${result.blank.updatedCount + result.crm.updatedCount}<br/>
          Failures (Sample): ${s.failedRows}
        `,
        icon: 'success',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#005092',
        customClass: {
          popup: 'swal-mordin-popup',
          confirmButton: 'swal-mordin-confirm',
          title: 'swal-mordin-title',
          htmlContainer: 'swal-mordin-text',
          icon: 'swal-mordin-icon',
        },
      });
      fetchExperimentService();
    } catch (err) {
      swalClose();
      console.error('Upload error:', err);
      await swalError(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถอัปโหลดไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์หรือลองใหม่อีกครั้ง'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleSave = async () => {
    if (selectedServiceCalendar) {
      swalLoading('บันทึกข้อมูล…');
      try {
        await selectReceivedBooksByByServiceCalendarId(
          selectedServiceCalendar.serviceCalendarId,
          selectedRows
        );
        swalSuccessTimer(
          'บันทึกสำเร็จ',
          'ข้อมูลได้รับการบันทึกเรียบร้อยแล้ว',
          1000
        );
        fetchExperimentService();
      } catch (error) {
        console.error('Error:', error);
        swalError(
          'เกิดข้อผิดพลาด',
          'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
        );
      } finally {
        setSelectedRows([]);
        setShowModal(false);
        fetchLaboratory();
      }
    } else {
      setSelectedRows([]);
      setShowModal(false);
    }
  };

  const handleSetParameters = () => {
    if (selectedServiceCalendar) {
      navigate(
        `/officer/lab-result/${selectedServiceCalendar.serviceCalendarId}/input-result`,
        {
          state: {
            serviceCalendarId: selectedServiceCalendar.serviceCalendarId,
            busId: selectedBusId,
            busName: selectedServiceCalendar.bus.busName,
            analysisService,
          },
        }
      );
    } else {
      alert('No service calendar found for the selected date and bus.');
    }
  };

  const alertedCodeRef = useRef<string | null>(null);

  const handleScanResult = (
    sampleCode: string,
    repeatCount: string,
    shortNameBefore: string
  ) => {
    const foundSample = analysisService.find(
      item => item.qrCode.book.sampleCode === sampleCode
    );

    if (!foundSample) {
      if (alertedCodeRef.current !== sampleCode) {
        alertedCodeRef.current = sampleCode;
        Swal.fire({
          icon: 'error',
          title: 'ไม่พบตัวอย่าง',
          text: `ไม่พบตัวอย่าง ${sampleCode} ในการทดลองวันนี้`,
          confirmButtonText: 'ตกลง',
          timer: 2000,
          timerProgressBar: true,
          confirmButtonColor: '#dc3545',
          customClass: {
            popup: 'swal-mordin-popup',
            confirmButton: 'swal-mordin-confirm',
            title: 'swal-mordin-title',
            htmlContainer: 'swal-mordin-text',
            icon: 'swal-mordin-icon',
          },
        }).then(() => {
          alertedCodeRef.current = null;
        });
      }
      setSelectedResult(null);
      setResultvalue([]);
      return;
    }

    const foundResult = foundSample.result.find(
      r =>
        Number(r.repeatNumber) === Number(repeatCount) &&
        r.laboratorySetting?.laboratory?.shortNameBefore === shortNameBefore
    );

    const resultKey = `${sampleCode}-${repeatCount}-${shortNameBefore}`;

    if (!foundResult) {
      if (alertedCodeRef.current !== resultKey) {
        alertedCodeRef.current = resultKey;
        Swal.fire({
          icon: 'error',
          title: 'ไม่พบผลวิเคราะห์',
          text: `ไม่พบผลวิเคราะห์ที่ repeat = ${Number(repeatCount)} และ shortNameBefore = ${shortNameBefore}`,
          confirmButtonText: 'ตกลง',
          timer: 1500,
          confirmButtonColor: '#dc3545',
          customClass: {
            popup: 'swal-mordin-popup',
            confirmButton: 'swal-mordin-confirm',
            title: 'swal-mordin-title',
            htmlContainer: 'swal-mordin-text',
            icon: 'swal-mordin-icon',
          },
        });
      }
      setSelectedResult(null);
      setResultvalue([]);
      return;
    }

    alertedCodeRef.current = null;
    setSelectedResult({ qrCode: foundSample.qrCode, result: foundResult });
    setResultvalue([]);
  };

  return (
    <div className="private-page-transition">
      {/* Page Header */}
      <div className="page-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">
            <i className="fas fa-vial me-2 text-primary" />
            บันทึกผลการวิเคราะห์ดิน
          </h1>
          <p className="text-muted mb-0">
            ระบุข้อมูลผลการวิเคราะห์ทางห้องปฏิบัติการ นำเข้าข้อมูลผ่านไฟล์
            หรือสแกน QR Code เพื่อประมวลผล
          </p>
        </div>
      </div>

      {/* Filter and Date Panel */}
      <div className="private-card mb-4">
        <div className="private-card-body p-4">
          <div className="row g-3">
            <div className="col-md-6 col-lg-4 text-start">
              <GenFormDate2
                isRequired={false}
                id="serviceDate"
                name="serviceDate"
                label="วันที่ให้บริการ"
                value={serviceDate}
                onChange={setServiceDate}
                desc={`ค่าเริ่มต้น คือ วันนี้ (${new Date().toLocaleDateString('th-TH')})`}
                markedDatesWithStatus={markedDates}
                onMonthYearChange={(year, month) =>
                  setSearchParam({ year, month })
                }
              />
            </div>
            <div className="col-md-6 col-lg-4 text-start">
              <GenFormSelect
                isRequired={false}
                id="carSelect"
                name="carSelect"
                label="รถที่ให้บริการ"
                value={selectedBusId ?? undefined}
                onChange={e => setSelectedBusId(Number(e.target.value))}
                options={buses.map(bus => ({
                  value: bus.busId,
                  name: `${bus.busNumber}-${bus.busName} (${bus.licensePlate})`,
                }))}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedServiceCalendar ? (
        <>
          {/* Summary cards — ข้อมูลจริงของวันบริการที่เลือก */}
          <LabResultSummaryCard
            numberOfSamples={selectedServiceCalendar.numberOfSamples}
            numberOfBookings={selectedServiceCalendar.numberOfBookings}
            numberOfExaminations={selectedServiceCalendar.numberOfExaminations}
          />

          {/* Tools row: Scanner | CSV | Online input */}
          <div className="row g-4 mt-2">
            <div className="col-md-6">
              <div className="private-card h-100 shadow-sm border-0">
                <div className="private-card-header d-flex align-items-center justify-content-between bg-light py-3">
                  <h5 className="mb-0 fw-bold text-dark">
                    <i className="fas fa-qrcode me-2 text-primary" />
                    สแกน QR Code ผลวิเคราะห์
                  </h5>
                </div>
                <div className="private-card-body p-4">
                  <div className="row g-3 align-items-center">
                    <div className="col-md-6 d-flex justify-content-center">
                      <QrScanner
                        readerId="qr-reader"
                        fps={15}
                        qrbox={250}
                        onScanSuccess={decodedText => {
                          let sampleCode = '';
                          let repeatCount = '';
                          let shortNameBefore = '';
                          if (decodedText) {
                            const parts = decodedText.split('-');
                            if (parts.length >= 5) {
                              sampleCode = parts.slice(0, 3).join('-');
                              repeatCount = parts[3];
                              shortNameBefore = parts[4] || '';
                            }
                          }
                          handleScanResult(
                            sampleCode,
                            repeatCount,
                            shortNameBefore
                          );
                        }}
                        onScanError={() => {}}
                      />
                    </div>
                    <div className="col-md-6 d-flex flex-column justify-content-center gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-nowrap">
                          รหัสตัวอย่าง:
                        </span>
                        <span className="private-chip private-chip-gray">
                          {selectedResult?.qrCode.book.sampleCode ?? '-'}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold text-nowrap">
                          {selectedResult?.result.laboratorySetting.laboratory
                            .shortNameBefore ?? 'ยังไม่เลือก'}{' '}
                          (
                          {selectedResult?.result.laboratorySetting.laboratory
                            .unitBefore ?? ''}
                          ):
                        </span>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            placeholder={
                              selectedResult?.result.laboratorySetting
                                .laboratory.shortNameBefore ?? ''
                            }
                            value={resultValue[0]?.preValue ?? ''}
                            onChange={e => {
                              const newPreValue = Number(e.target.value);
                              setResultvalue(prev =>
                                prev.length === 0
                                  ? [
                                      {
                                        resultId: Number(
                                          selectedResult?.result?.resultId
                                        ),
                                        preValue: newPreValue,
                                      },
                                    ]
                                  : [{ ...prev[0], preValue: newPreValue }]
                              );
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => handleSubmitPreValue(resultValue)}
                          >
                            ส่งค่า
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="private-card h-100 shadow-sm border-0">
                <div className="private-card-header d-flex align-items-center justify-content-between bg-light py-3">
                  <h5 className="mb-0 fw-bold text-dark">
                    <i className="fas fa-file-csv me-2 text-success" />
                    นำเข้าไฟล์ CSV
                  </h5>
                </div>
                <div className="private-card-body p-4 d-flex flex-column gap-3">
                  <CsvTemplateDownload
                    headers={csvHeaders}
                    rows={csvRows}
                    fileName={csvFileName}
                  >
                    ดาวน์โหลด input.csv
                  </CsvTemplateDownload>
                  <input
                    type="file"
                    className="form-control"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="btn btn-success w-100"
                    onClick={handleUploadCSV}
                  >
                    <i className="fas fa-upload me-2" />
                    ส่งค่าไฟล์
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="private-card h-100 shadow-sm border-0">
                <div className="private-card-header d-flex align-items-center justify-content-between bg-light py-3">
                  <h5 className="mb-0 fw-bold text-dark">
                    <i className="fas fa-keyboard me-2 text-info" />
                    ป้อนค่าออนไลน์
                  </h5>
                </div>
                <div className="private-card-body p-4 d-flex flex-column justify-content-between">
                  <p className="text-muted mb-3">
                    ระบุค่าผลการทดลองทางแล็บหลายแถวพร้อมกันในหน้ารวมตารางแบบโต้ตอบ
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    onClick={handleSetParameters}
                  >
                    <i className="fas fa-cogs me-2" />
                    ไปหน้าบันทึกรวม
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Received samples modal trigger */}
          <div className="d-flex justify-content-end mt-4 mb-2">
            <GenButtonCircle
              color="btn-warning text-white"
              icon="fa fa-plus"
              onClick={handleOpen}
            />
          </div>

          <LabResultModal
            show={showModal}
            onClose={handleClose}
            onSave={handleSave}
            title="บันทึกตัวอย่าง"
          >
            <div className="row">
              <div className="col-md-4 col-lg-4">
                <GenFormDate2
                  isRequired={false}
                  id="serviceDate"
                  name="serviceDate"
                  label="วันที่ให้บริการ"
                  value={receivedDate}
                  onChange={setReceivedDate}
                  desc={`ค่าเริ่มต้น คือ วันนี้ (${new Date().toLocaleDateString('th-TH')})`}
                  markedDatesWithStatus={markedDatesModal}
                  onMonthYearChange={(year, month) =>
                    setModalSearchParam({ year, month })
                  }
                />
              </div>
              <div className="col-md-4 col-lg-4">
                <GenFormSelect
                  isRequired={false}
                  id="receivedCar"
                  name="receivedCar"
                  label="รถที่ให้บริการ"
                  value={receivedCar}
                  onChange={e => setReceivedCar(Number(e.target.value))}
                  options={receivedBusOption}
                />
              </div>
            </div>
            {receivedCalendar.length > 0 ? (
              <TableWithCheckbox
                receivedService={receivedService}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
              />
            ) : (
              <div className="mt-4">ไม่พบข้อมูลการให้บริการในวันนี้</div>
            )}
          </LabResultModal>

          <LabResultTable
            data={analysisService}
            tableId="multi-filter-select-analyzing"
            subtitle="รับตัวอย่าง"
            title={`วันบริการที่ ${serviceDate} (รถ ${selectedServiceCalendar.bus?.busName ?? ''})`}
            loading={loading}
            laboratoryData={laboratoryData || []}
            onAddPreValueClick={payload => {
              setSelectedResult(payload);
              setResultvalue([]);
            }}
            handleSubmitPreValue={handleSubmitPreValue}
          />

          <LabResultTable
            data={analysisServiceRepeat}
            tableId="multi-filter-select-analyzing-repeat"
            subtitle="รับตัวอย่าง"
            title="ตัวอย่างที่ 15/30/45/..."
            laboratoryData={laboratoryData || []}
            loading={loading}
          />

          {standardAnalysisData_blank && (
            <StandardLabResultTable
              data={[standardAnalysisData_blank]}
              tableId="blank-table"
              title="Blank"
              subtitle="ผลการวิเคราะห์ Blank"
              loading={loading}
              laboratoryData={laboratoryData || []}
              handleSubmitPreValue={handleSubmitStandardPreValue}
            />
          )}

          {standardAnalysisData_standard.length > 0 && (
            <StandardLabResultTable
              data={standardAnalysisData_standard}
              tableId="standard-table"
              title="Standard (CRM)"
              subtitle="ผลการวิเคราะห์ Standard"
              loading={loading}
              laboratoryData={laboratoryData || []}
              handleSubmitPreValue={handleSubmitStandardPreValue}
            />
          )}
        </>
      ) : (
        <div className="mt-4 alert alert-light text-center shadow-sm">
          <i className="fas fa-calendar-day me-2" />
          เลือกวันที่และรถที่ให้บริการด้านบน เพื่อดูสรุปและกรอกผลการวิเคราะห์
        </div>
      )}
    </div>
  );
};

export default LabResult;
