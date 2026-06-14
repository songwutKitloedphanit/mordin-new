import { Routes, Route } from 'react-router-dom';

import Dashboard from '@/pages/executive/Dashboard';
import Dashboard2 from '@/pages/executive/Dashboard2';

const ExecutiveRoutes = () => {
  return (
    <Routes>
      <Route index element={<h1>Executive Dashboard</h1>} />
      {/* เพิ่ม route อื่น ๆ ของ Executive ที่นี่ */}
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="report-1" element={<Dashboard2 />} />
    </Routes>
  );
};

export default ExecutiveRoutes;
