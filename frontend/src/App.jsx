import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MilkEntryPage from './pages/MilkEntryPage';
import ReportPage from './pages/ReportPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import BuyersPage from './pages/BuyersPage';
import SalesPage from './pages/SalesPage';

function AppShell() {
  const { token } = useAuth();
  const disableAuth = import.meta.env.VITE_DISABLE_AUTH === 'true';
  const isAuthenticated = disableAuth || !!token;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dcfce7,_#eff6ff)] p-4 text-slate-800 md:p-6">
      {isAuthenticated ? (
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row">
          <Sidebar />
          <main className="flex-1 rounded-3xl border border-white/40 bg-white/30 p-4 shadow-xl backdrop-blur-xl md:p-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/milk" element={<MilkEntryPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/buyers" element={<BuyersPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
