import { Routes, Route } from 'react-router-dom';

import AnalysisReport from '@/pages/officer/analysis-report/AnalysisReport';
import AnalysisReportInfo from '@/pages/officer/analysis-report/AnalysisReportInfo';
import AnalysisReportInfoEdit from '@/pages/officer/analysis-report/AnalysisReportInfoEdit';
import ExamSetting from '@/pages/officer/exam-setting/ExamSetting';
import ExamSettingDetailEdit from '@/pages/officer/exam-setting/ExamSettingDetailEdit';
import ExamSettingEdit from '@/pages/officer/exam-setting/ExamSettingEdit';
import LabResult from '@/pages/officer/laboratory/LabResult';
import LabResultMultiInput from '@/pages/officer/laboratory/LabResultMultiInput';
import QRCodeManagement from '@/pages/officer/qrcode/QRCodeManagement';
import SampleReceivingInfo from '@/pages/officer/sample-receiving/SampleReceivingInfo';
import SampleReceivingManagement from '@/pages/officer/sample-receiving/SampleReceivingManagement';

const OfficerRoutes = () => {
  return (
    <Routes>
      <Route index element={<h1>Officer Dashboard</h1>} />
      {/* QRCode */}
      <Route path="qrcode-officer" element={<QRCodeManagement />} />
      {/* Exam */}
      <Route path="analysis-setting" element={<ExamSetting />} />
      <Route
        path="analysis-setting/:serviceCalendarId/edit"
        element={<ExamSettingEdit />}
      />
      <Route
        path="analysis-setting/:labSettingId/edit-working-standard"
        element={<ExamSettingDetailEdit />}
      />
      <Route path="sample-receiving" element={<SampleReceivingManagement />} />
      <Route
        path="sample-receiving/:qrCode"
        element={<SampleReceivingInfo />}
      />
      <Route path="analysis-report" element={<AnalysisReport />} />
      <Route
        path="analysis-report/:sampleCode"
        element={<AnalysisReportInfo />}
      />
      {/*Edit*/}
      <Route
        path="analysis-report/:id/edit"
        element={<AnalysisReportInfoEdit />}
      />
      {/* Lab */}
      <Route path="lab-result" element={<LabResult />} />
      <Route
        path="lab-result/:id/input-result"
        element={<LabResultMultiInput />}
      />
      <Route path="lab-result/add-ph/:sampleId/*" element={<LabResult />} />
    </Routes>
  );
};
export default OfficerRoutes;
