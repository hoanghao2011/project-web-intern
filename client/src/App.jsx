import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EquipmentListPage from './pages/EquipmentListPage';
import EquipmentFormPage from './pages/EquipmentFormPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import TransactionsPage from './pages/TransactionsPage';
import MaintenancePage from './pages/MaintenancePage';
import SitesPage from './pages/SitesPage';
import SiteDetailPage from './pages/SiteDetailPage';
import CategoriesPage from './pages/CategoriesPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/equipment" element={<EquipmentListPage />} />
              <Route path="/equipment/new" element={<EquipmentFormPage />} />
              <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
              <Route path="/equipment/:id/edit" element={<EquipmentFormPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/sites" element={<SitesPage />} />
              <Route path="/sites/:id" element={<SiteDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
