/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { GenButtonCircle } from '../../../components/gui/GuiButton';
import {
  GenFormDate2,
  GenFormSelect,
  MarkedDateStatus,
} from '../../../components/gui/GuiForm';
import CsvTemplateDownload from '../../../components/pages/lab-result-csv-input/CsvTemplateDownload';
import QrScanner from '../../../components/scanner/QrScanner';
import { searchServiceCalendars } from '../../../services/api/ServiceCalendarApi';
import {
  CalendarInfoInterface,
  SearchServiceCalendar,
  ServiceCalendarWithStatus,
} from '../../../types/ServiceCalendar';

import LabResultModal from '@/components/pages/lab-result/LabResultModal';
import LabResultTable from '@/components/pages/lab-result/LabResultTable';
import TableWithCheckbox from '@/components/pages/lab-result/LabResultTableWithCheckbox';
import StandardLabResultTable from '@/components/pages/lab-result/StandardLabResultTable';
import { getAllLaboratories } from '@/services/api/laboratory/LaboratoryApi';
import {
  getReceivedBooksByServiceCalendarId,
  getSampleResultsByServCalendarId,
  selectReceivedBooksByByServiceCalendarId,
} from '@/services/api/qr-code/BookApi';
import { inputResult, uploadCsvFile } from '@/services/api/result/ResultApi';
import { getAnalysisStandardsByCalendar, inputAnalysisStandardResults } from '@/services/api/standard-sample/AnalysisStandardsAPI';
import { Laboratory } from '@/types/Laboratory';
import { Book, QrCode, SampleStatusEnum } from '@/types/qr-code/QrCode';
import { ResultInput } from '@/types/result/Result';
import { sampleBlankResultInfo } from '@/types/sample-blank/sampleBlankResult';
import { AnalysisStandardInterface, UpdateAnalysisStandardResultDto } from '@/types/standard-sample/AnalysisStandards';


const LabResult: React.FC = () => {
  const [laboratoryData, setLaboratoryData] = useState<Laboratory[]>();
  const [file, setFile] = useState<File | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [serviceDate, setServiceDate] = useState<string>(today);
  const [serviceCalendars, setServiceCalendars] = useState<
    CalendarInfoInterface[]
  >([]);
  const [selectedCalendar, setSelectedCalendar] = useState<
    CalendarInfoInterface[]
  >([]);
  const [markedDates, setMarkedDates] = useState<MarkedDateStatus[]>([]);
  const [modalServiceCalendars, setModalServiceCalendars] = useState<
    CalendarInfoInterface[]
  >([]);
  const [markedDatesModal, setMarkedDatesModal] = useState<MarkedDateStatus[]>(
    []
  );
  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [busOptions, setBusOptions] = useState<
    { value: number; name: string }[]
  >([]);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [analysisService, setAnalysisService] = useState<
    Array<{
      qrCode: QrCode;
      result: sampleBlankResultInfo[];
    }>
  >([]);
  const [analysisServiceRepeat, setAnalysisServiceRepeat] = useState<
    Array<{
      qrCode: QrCode;
      result: sampleBlankResultInfo[];
    }>
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
  const [busName, setBusName] = useState<string>('');
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
      const payload: SearchServiceCalendar = {
        ...searchParam,
        all: true,
      };
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

      const payload: SearchServiceCalendar = {
        ...modalSearchParam,
        all: true,
      };
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
    const opts = serviceCalendars.filter(
      c => new Date(c.date).toISOString().split('T')[0] === serviceDate
    );
    if (opts) {
      setSelectedCalendar(opts);
      const busOptsopts = opts.map(c => ({
        value: c.busId!,
        name: `${c.bus.busNumber}-${c.bus.busName} (${c.bus.licensePlate})`,
      }));
      setShowScanner(true);
      setBusOptions(busOptsopts);
      if (busOptsopts.length) setSelectedCar(busOptsopts[0].value);
      else setSelectedCar(null);
    } else {
      setShowScanner(false);
      setSelectedCalendar([]);
      setBusOptions([]);
      setSelectedCar(null);
    }
  }, [serviceDate, serviceCalendars]);

  const fetchExperimentService = useCallback(async () => {
    try {
      setLoading(true);
      const bus = selectedCalendar.find(item => item.busId === selectedCar);
      if (bus?.busId) {
        const response: Array<{
          qrCode: QrCode;
          result: sampleBlankResultInfo[];
        }> = await getSampleResultsByServCalendarId(bus?.serviceCalendarId);
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
        setBusName(bus?.bus?.busName);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [selectedCalendar, selectedCar]);

  useEffect(() => {
    fetchExperimentService();
  }, [fetchExperimentService, selectedCalendar, selectedCar]);

  console.log('RepeatAnalysisResultService', analysisServiceRepeat);
  console.log('analysisService', analysisService);

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

  //fecth standard samples
  useEffect(() => {
    const fetchStandardSamples = async () => {
      try {
        const calendarId = selectedCalendar?.[0]?.serviceCalendarId;
        if (calendarId) {
          const data = await getAnalysisStandardsByCalendar(calendarId);
          setStandardAnalysisData(data);
          const blank = data.find(item => item.type === 'blank');
          setStandardAnalysisData_blank(blank);

          const standard = data.filter(item => item.type === 'crm');
          setStandardAnalysisData_standard(standard);
        }
      } catch (error) {
        console.error('Error fetching standard analysis data:', error);
      }
    };

    fetchStandardSamples();
  }, [selectedCalendar]);



  //const [showConfirm, setShowConfirm] = useState(false);

  // const handleDelete = () => {
  //   console.log('ลบข้อมูลเรียบร้อย');
  //   setShowConfirm(false);
  // };

  // const handleCancel = () => {
  //   console.log('ยกเลิกการลบ');
  //   setShowConfirm(false);
  // };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitPreValue = async (resultValue: ResultInput[]) => {
    if (resultValue) {
      console.log(`ส่งค่า :`, resultValue);
      setLoading(true);
      try {
        const response = await inputResult(resultValue);
        if (response) {
          console.log('Pre-value submitted successfully:', response);
        }
      } catch (error) {
        const err = error as AxiosError<{
          message: string;
          statusCode?: number;
        }>;
        Swal.fire({
          icon: 'warning',
          title: 'การตั้งค่าไม่สมบูรณ์',
          text: err.response?.data?.message || 'เกิดข้อผิดพลาดบางอย่าง',
          confirmButtonText: 'ตกลง',
        });
      }
      fetchExperimentService();
      setResultvalue([]);
      setSelectedResult(null);
      setLoading(false);
    } else {
      alert('กรุณากรอกค่า');
    }
  };

  const handleSubmitStandardPreValue = async (resultValue: UpdateAnalysisStandardResultDto[]) => {
    if (resultValue && resultValue.length > 0) {
      console.log(`ส่งค่า Standard/Blank :`, resultValue);
      setLoading(true);
      try {
        const response = await inputAnalysisStandardResults(resultValue);
        if (response) {
          console.log('Standard Result submitted successfully:', response);
          Swal.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            text: 'บันทึกข้อมูล Standard/Blank เรียบร้อยแล้ว',
            timer: 1500,
          });
          // Refresh data
          const calendarId = selectedCalendar?.[0]?.serviceCalendarId;
          if (calendarId) {
            const data = await getAnalysisStandardsByCalendar(calendarId);
            setStandardAnalysisData(data);
            const blank = data.find(item => item.type === 'blank');
            setStandardAnalysisData_blank(blank);

            const standard = data.filter(item => item.type === 'crm');
            setStandardAnalysisData_standard(standard);
          }
        }
      } catch (error) {
        console.error('Error submitting standard result:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกข้อมูลได้',
        });
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

    // --- 1. ปกติ (non-repeat)
    const repeatBaseCodes = new Set(
      analysisServiceRepeat
        .map(item => {
          const code = item.qrCode.book.sampleCode;
          return code.includes('/') ? code.split('/')[0] : null;
        })
        .filter(Boolean)
        .filter(Boolean)
    );

    const nonRepeatSorted = [...analysisService]
      .filter(item => !repeatBaseCodes.has(item.qrCode.book.sampleCode))
      .sort((a, b) =>
        a.qrCode.book.sampleCode.localeCompare(b.qrCode.book.sampleCode)
      );

    nonRepeatSorted.forEach(item => {
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

    // --- 2. repeat
    const repeatSorted = [...analysisServiceRepeat].sort((a, b) =>
      a.qrCode.book.sampleCode.localeCompare(b.qrCode.book.sampleCode)
    );
    repeatSorted.forEach(item => {
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

    // --- ✅ 3. เพิ่ม CRM / Blank จาก standardAnalysisData
    standardAnalysisData.forEach(item => {
      const grouped = new Map<number, typeof item.analysisStandardResults>();
      item.analysisStandardResults.forEach(r => {
        const rep = r.repeatNumber || 1;
        if (!grouped.has(rep)) grouped.set(rep, []);
        grouped.get(rep)!.push(r);
      });

      console.log('standardAnalysisDataaaaaaaaaaaaaaaaa', standardAnalysisData);

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
  const csvFileName = `Labresult_${serviceDate}_${selectedCar ?? 'unknown'}.csv`;

  //การ upload csv
  const handleUploadCSV = async () => {
    if (!file) {
      await Swal.fire({
        title: 'ยังไม่ได้เลือกไฟล์',
        text: 'กรุณาเลือกไฟล์ CSV ก่อนทำการอัปโหลด',
        icon: 'warning',
      });
      return;
    }

    Swal.fire({
      title: 'กำลังอัปโหลด...',
      text: 'ระบบกำลังประมวลผลข้อมูลจากไฟล์ กรุณารอสักครู่',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    setLoading(true);
    try {
      const result = await uploadCsvFile(file);
      // result.summary, result.sample, result.blank, result.crm
      Swal.close();
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
      });
      console.log('Detail:', result);
      fetchExperimentService();
    } catch (err) {
      Swal.close();
      Swal.close();
      console.error('❌ Upload error:', err);
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปโหลดไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์หรือลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setLoading(false);
    }
  };

  // Modal Action
  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleSave = () => {
    const updateStatus = async () => {
      const bus = selectedCalendar.find(item => item.busId === selectedCar);
      if (bus) {
        Swal.fire({
          title: 'บันทึกข้อมูล...',
          text: 'ระบบกำลังบันทึกตัวอย่าง กรุณารอสักครู่',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          const response = await selectReceivedBooksByByServiceCalendarId(
            bus?.serviceCalendarId,
            selectedRows
          );
          console.log('response', response);
          Swal.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            text: 'ข้อมูลได้รับการบันทึกเรียบร้อยแล้ว',
            timer: 1000,
          });
          fetchExperimentService();
        } catch (error) {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
          });
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
    updateStatus();
  };

  const handleSetParameters = () => {
    const selectedBus = selectedCalendar.find(
      item => item.busId === selectedCar
    );
    if (selectedBus) {
      const serviceCalendarId = selectedBus.serviceCalendarId;
      navigate(`/officer/lab-result/${serviceCalendarId}/input-result`, {
        state: {
          serviceCalendarId,
          busId: selectedCar,
          busName: selectedBus.bus.busName,
          analysisService, // Pass analysisService data
        },
      });
    } else {
      alert('No service calendar found for the selected date and bus.');
    }
  };

  const alertedCodeRef = useRef<string | null>(null); // ✅ ใช้แค่ ref เดียว ไม่ทำให้ component re-render

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
          text: `ไม่พบผลวิเคราะห์ที่ repeat = ${Number(
            repeatCount
          )} และ shortNameBefore = ${shortNameBefore}`,
          confirmButtonText: 'ตกลง',
          timer: 1500,
        });
      }

      setSelectedResult(null);
      setResultvalue([]);
      return;
    }

    // ✅ ล้างเมื่อสแกนสำเร็จ
    alertedCodeRef.current = null;

    setSelectedResult({ qrCode: foundSample.qrCode, result: foundResult });
    setResultvalue([]);
  };

  return (
    <div>
      {/* Cards Section */}
      {/* <LabResultSummaryCard /> */}

      <div className="row">
        <div className="col-md-4 col-lg-4">
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
        <div className="col-md-4 col-lg-4">
          <GenFormSelect
            isRequired={false}
            id="carSelect"
            name="carSelect"
            label="รถที่ให้บริการ"
            value={selectedCar}
            onChange={e => setSelectedCar(Number(e.target.value))}
            options={busOptions}
          />
        </div>
      </div>

      {selectedCalendar.length > 0 ? (
        <>
          {/* QR Code Scanner and Form Section */}
          <div className="row">
            <div
              className="col-md-6 d-flex"
              style={{ textAlign: 'center', alignContent: 'center' }}
            >
              <div className="card w-100">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 text-center">
                      <h1>Scan QR Codes</h1>
                      <div className="section">
                        {showScanner && (
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
                              console.log('scan success');

                              handleScanResult(
                                sampleCode,
                                repeatCount,
                                shortNameBefore
                              );
                            }}
                            onScanError={errMsg =>
                              console.warn('QR scan error:', errMsg)
                            }
                          />
                        )}
                      </div>
                    </div>
                    <div
                      className="col-md-6 text-center"
                      style={{ textAlign: 'center', alignContent: 'center' }}
                    >
                      <div className="d-flex align-items-center">
                        <p className="mb-0 fw-bold me-2">รหัสตัวอย่าง:</p>
                        <p className="mb-0">
                          {selectedResult?.qrCode.book.sampleCode ?? ''}
                        </p>
                      </div>

                      <table>
                        <tbody>
                          <tr>
                            <td>
                              {selectedResult?.result.laboratorySetting
                                .laboratory.shortNameBefore ?? ''}
                            </td>
                            <td>
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
                                  setResultvalue(prev => {
                                    if (prev.length === 0) {
                                      return [
                                        {
                                          resultId: Number(
                                            selectedResult?.result?.resultId
                                          ),
                                          preValue: newPreValue,
                                        },
                                      ];
                                    } else {
                                      return [
                                        { ...prev[0], preValue: newPreValue },
                                      ];
                                    }
                                  });
                                }}
                              />
                            </td>
                            <td>
                              {' '}
                              <button
                                type="button"
                                className="btn btn-success"
                                onClick={() =>
                                  handleSubmitPreValue(resultValue)
                                }
                                style={{ width: '120px' }}
                              >
                                ส่งค่า
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-md-3"
              style={{ textAlign: 'center', alignContent: 'center' }}
            >
              <div className="card">
                <div className="card-body">
                  <CsvTemplateDownload
                    headers={csvHeaders}
                    rows={csvRows}
                    fileName={csvFileName}
                  >
                    ดาวน์โหลด input.csv
                  </CsvTemplateDownload>
                  <input
                    type="file"
                    className="form-control mt-2"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="btn btn-success mt-2"
                    onClick={handleUploadCSV}
                  >
                    ส่งค่าไฟล์
                  </button>
                </div>
              </div>
            </div>
            <div
              className="col-md-3"
              style={{ textAlign: 'center', alignContent: 'center' }}
            >
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <h4>&nbsp; &nbsp;</h4>
                    <h4>ป้อนค่าทางออนไลน์ทั้งหมด</h4>
                    <h5>โปรดเลือกปฏิบัติการที่ต้องการดำเนินการ</h5>
                  </div>
                </div>
                <div className="card-action">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: '150px' }}
                    onClick={handleSetParameters}
                  >
                    กำหนดค่า
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal */}
          <div className="row mb-3">
            <div className="col-12 d-flex justify-content-end">
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
                    desc={`ค่าเริ่มต้น คือ วันนี้ (${new Date().toLocaleDateString(
                      'th-TH'
                    )})`}
                    markedDatesWithStatus={markedDatesModal}
                    onMonthYearChange={(year, month) => {
                      setModalSearchParam({
                        year: year,
                        month: month,
                      });
                    }}
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
          </div>

          {/* รายการ LabResult ทีรับมา */}
          <LabResultTable
            data={analysisService}
            tableId="multi-filter-select-analyzing"
            subtitle="รับตัวอย่าง"
            title={`วันบริการที่ ${serviceDate} (รถ ${busName})`}
            loading={loading}
            laboratoryData={laboratoryData || []}
            onAddPreValueClick={payload => {
              setSelectedResult(payload);
              setResultvalue([]);
            }}
            handleSubmitPreValue={handleSubmitPreValue}
          />

          {/* รายการ LabResult ที่รับมาที่มีการซ้ำ 3 */}
          <LabResultTable
            data={analysisServiceRepeat}
            tableId="multi-filter-select-analyzing-repeat"
            subtitle="รับตัวอย่าง"
            title={`ตัวอย่างที่ 15/30/45/...`}
            laboratoryData={laboratoryData || []}
            loading={loading}
          />

          {/* Blank & Standard Table */}
          <div className="row mt-4">
            <div className="col-md-12">
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
            </div>
            <div className="col-md-12 mt-4">
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
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4">ไม่พบข้อมูลการให้บริการในวันนี้</div>
      )}
    </div>
  );
};

export default LabResult;
