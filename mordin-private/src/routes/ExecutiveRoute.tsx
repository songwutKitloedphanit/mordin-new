import { Navigate, Routes, Route } from 'react-router-dom';

import Dashboard from '@/pages/executive/Dashboard';
import Dashboard2 from '@/pages/executive/Dashboard2';
import { DASHBOARD_URL } from '@/utils/RoleToURL';

const ExecutiveRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to={DASHBOARD_URL} replace />} />
      {/* เพิ่ม route อื่น ๆ ของ Executive ที่นี่ */}
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="report" element={<Dashboard2 />} />
      <Route path="*" element={<Navigate to={DASHBOARD_URL} replace />} />
    </Routes>
  );
};

export default ExecutiveRoutes;
