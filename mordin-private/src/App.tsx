import { Navigate, Routes, Route } from 'react-router-dom';

import AdminLayout from './layouts/AdminLayout';
import Login from './pages/auth/login';
import Logout from './pages/auth/logout';
import Profile from './pages/profile/Profile';
import CollectSample from './pages/public/CollectSample';
import AdminRoutes from './routes/AdminRoute';
import ExecutiveRoutes from './routes/ExecutiveRoute';
import RouteGuard from './routes/guards/RouteGuard';
import OfficerRoutes from './routes/OfficerRoute';
import { UserRole } from './types/User';
import { DASHBOARD_URL } from './utils/RoleToURL';

const routes = [
  {
    path: 'admin',
    element: AdminRoutes,
    allowedRoles: [UserRole.Admin],
  },
  {
    path: 'officer',
    element: OfficerRoutes,
    allowedRoles: [UserRole.Admin, UserRole.Staff],
  },
  {
    path: 'executive',
    element: ExecutiveRoutes,
    allowedRoles: [UserRole.Admin, UserRole.Staff, UserRole.Executive],
  },
];

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RouteGuard>
            <Navigate to={DASHBOARD_URL} replace />
          </RouteGuard>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/collect-sample/:code" element={<CollectSample />} />
      <Route
        element={
          <RouteGuard>
            <AdminLayout />
          </RouteGuard>
        }
      >
        <Route path="profile" element={<Profile />} />
        {routes.map(route => (
          <Route
            key={route.path}
            path={`${route.path}/*`}
            element={
              <RouteGuard allowedRoles={route.allowedRoles} showLoading={false}>
                {<route.element />}
              </RouteGuard>
            }
          />
        ))}
      </Route>
      <Route
        path="*"
        element={
          <RouteGuard>
            <Navigate to={DASHBOARD_URL} replace />
          </RouteGuard>
        }
      />
    </Routes>
  );
}

export default App;
