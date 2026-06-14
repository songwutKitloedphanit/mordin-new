import { Routes, Route } from 'react-router-dom';

import BusAdd from '@/pages/admin/bus/BusAdd';
import BusEdit from '@/pages/admin/bus/BusEdit';
import BusManagement from '@/pages/admin/bus/BusManagement';
import FarmerAdd from '@/pages/admin/farmer/FarmerAdd';
import FarmerEdit from '@/pages/admin/farmer/FarmerEdit';
import FarmerInfo from '@/pages/admin/farmer/FarmerInfo';
import FarmerManagement from '@/pages/admin/farmer/FarmerManagement';
import FertilizerMajorAdd from '@/pages/admin/fertilizer-prices/FertilizerMajorAdd';
import FertilizerMajorEdit from '@/pages/admin/fertilizer-prices/FertilizerMajorEdit';
import FertilizerMionorAdd from '@/pages/admin/fertilizer-prices/FertilizerMinorAdd';
import FertilizerMionorEdit from '@/pages/admin/fertilizer-prices/FertilizerMinorEdit';
import FertilizerPricesManagement from '@/pages/admin/fertilizer-prices/FertilizerPriceManagement';
import FertilizerMajorUsageEdit from '@/pages/admin/fertilizer-usages/FertilizerMajorUsageEdit';
import FertilizerMinorUsageEdit from '@/pages/admin/fertilizer-usages/FertilizerMinorUsageEdit';
import FertilizerUsages from '@/pages/admin/fertilizer-usages/FertilizerUsages';
import ResultGradeEdit from '@/pages/admin/fertilizer-usages/ResultGradeEdit';
import SoilGradeEdit from '@/pages/admin/fertilizer-usages/SoilGradeEdit';
import LabInfo from '@/pages/admin/laboratory/LabInfo';
import Laboratory from '@/pages/admin/laboratory/Laboratory';
import LaboratoryAdd from '@/pages/admin/laboratory/LaboratoryAdd';
import LaboratoryEdit from '@/pages/admin/laboratory/LaboratoryEdit';
import LandAdd from '@/pages/admin/land/LandAdd';
import LandEdit from '@/pages/admin/land/LandEdit';
import LandInfo from '@/pages/admin/land/LandInfo';
import LandManagement from '@/pages/admin/land/LandManagement';
import QRCode from '@/pages/admin/qrcode/qrcode';
import ServiceAreaAdd from '@/pages/admin/service-area/ServiceAreaAdd';
import ServiceAreaEdit from '@/pages/admin/service-area/ServiceAreaEdit';
import ServiceAreaManagement from '@/pages/admin/service-area/ServiceAreaManagement';
import CalendarAdd from '@/pages/admin/service-calendar/CalendarAdd';
import CalendarEdit from '@/pages/admin/service-calendar/CalendarEdit';
import CalendarInfo from '@/pages/admin/service-calendar/CalendarInfo';
import ServiceCalendar from '@/pages/admin/service-calendar/ServiceCalendar';
import ServiceType from '@/pages/admin/service-type/ServiceType';
import ServiceTypeAdd from '@/pages/admin/service-type/ServiceTypeAdd';
import ServiceTypeEdit from '@/pages/admin/service-type/ServiceTypeEdit';
import ShopAdd from '@/pages/admin/shop/ShopAdd';
import ShopEdit from '@/pages/admin/shop/ShopEdit';
import ShopManagement from '@/pages/admin/shop/ShopManagement';
import PTSampleAdd from '@/pages/admin/standard/PTSampleAdd';
import PTSampleEdit from '@/pages/admin/standard/PTSampleEdit';
import Standard from '@/pages/admin/standard/StandardManagement';
import UserEdit from '@/pages/admin/user/UserEdit';
import UserManagement from '@/pages/admin/user/UserManagement';

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<h1>Admin Dashboard</h1>} />
      {/* User Management */}
      <Route path="user" element={<UserManagement />} />
      <Route path="user/:id/edit" element={<UserEdit />} /> {/*Edit*/}
      {/* Bus Management  */}
      <Route path="bus" element={<BusManagement />} />
      <Route path="bus/add" element={<BusAdd />} />
      <Route path="bus/:id/edit" element={<BusEdit />} /> {/*Edit*/}
      {/* Service Area Routes */}
      <Route path="service-area" element={<ServiceAreaManagement />} />
      <Route path="service-area/add" element={<ServiceAreaAdd />} />
      <Route path="service-area/:id/edit" element={<ServiceAreaEdit />} />
      {/* Land Management */}
      <Route path="land" element={<LandManagement />} />
      <Route path="land/add" element={<LandAdd />} />
      <Route path="land/:id/" element={<LandInfo />} /> {/*Edit*/}
      <Route path="land/:id/edit" element={<LandEdit />} /> {/*Edit*/}
      {/* Farmer Management */}
      <Route path="farmer" element={<FarmerManagement />} />
      <Route path="farmer/add" element={<FarmerAdd />} />
      <Route path="farmer/:id/" element={<FarmerInfo />} /> {/*Edit*/}
      <Route path="farmer/:id/edit" element={<FarmerEdit />} /> {/*Edit*/}
      {/* Shop Management */}
      <Route path="shop" element={<ShopManagement />} />
      <Route path="shop/add" element={<ShopAdd />} />
      <Route path="shop/:id/edit" element={<ShopEdit />} /> {/*Edit*/}
      {/* Service Calender */}
      <Route path="service-calendar" element={<ServiceCalendar />} />
      <Route path="service-calendar/add" element={<CalendarAdd />} />
      <Route path="service-calendar/:id/edit" element={<CalendarEdit />} />{' '}
      {/*Edit*/}
      <Route path="service-calendar/:id" element={<CalendarInfo />} />{' '}
      {/*Edit*/}
      {/* Service Type */}
      <Route path="service-type" element={<ServiceType />} />
      <Route path="service-type/add" element={<ServiceTypeAdd />} />
      <Route path="service-type/:id/edit" element={<ServiceTypeEdit />} />
      {/* Laboratory */}
      <Route path="laboratory" element={<Laboratory />} />
      <Route path="laboratory/add" element={<LaboratoryAdd />} />
      <Route path="laboratory/:id" element={<LabInfo />} /> {/*Edit*/}
      <Route path="laboratory/:id/edit" element={<LaboratoryEdit />} />{' '}
      {/*Edit*/}
      {/* Fertilizer Price */}
      <Route
        path="fertilizer-prices"
        element={<FertilizerPricesManagement />}
      />
      <Route
        path="fertilizer-prices/add-major"
        element={<FertilizerMajorAdd />}
      />
      <Route
        path="fertilizer-prices/add-minor"
        element={<FertilizerMionorAdd />}
      />
      <Route
        path="fertilizer-prices/:id/edit-major"
        element={<FertilizerMajorEdit />}
      />{' '}
      {/*Edit*/}
      <Route
        path="fertilizer-prices/:id/edit-minor"
        element={<FertilizerMionorEdit />}
      />{' '}
      {/*Edit*/}
      {/* fertilizer usages */}
      <Route path="fertilizer-usages" element={<FertilizerUsages />} />
      <Route
        path="fertilizer-usages/:id/edit-major"
        element={<FertilizerMajorUsageEdit />}
      />
      <Route
        path="fertilizer-usages/:id/edit-minor"
        element={<FertilizerMinorUsageEdit />}
      />
      <Route
        path="fertilizer-usages/:id/edit-score"
        element={<SoilGradeEdit />}
      />
      <Route
        path="fertilizer-usages/:resultGradeId/edit-result-grade"
        element={<ResultGradeEdit />}
      />
      {/* Qrcode */}
      <Route path="qrcode" element={<QRCode />} />
      {/* Standard management */}
      <Route path="standard" element={<Standard />} />
      <Route path="standard/add" element={<PTSampleAdd />} />
      <Route path="standard/:standardId/edit" element={<PTSampleEdit />} />
    </Routes>
  );
}

export default AdminRoutes;
