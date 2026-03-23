import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { UserProvider, useUser } from "./context/UserContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import CareersPage from "./pages/CareersPage";
import TenderNoticesPage from "./pages/TenderNoticesPage";
import DownloadSpecificationsPage from "./pages/DownloadSpecificationsPage";
import CorporateProfilePage from "./pages/CorporateProfilePage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import UsersManagementPage from "./pages/admin/UsersManagementPage";
import NewsManagementPage from "./pages/admin/NewsManagementPage";
import HeroManagementPage from "./pages/admin/HeroManagementPage";
import EventsManagementPage from "./pages/admin/EventsManagementPage";
import CorporateManagementPage from "./pages/admin/CorporateManagementPage";
import EventsPage from "./pages/EventsPage";
import { canAccessAdmin } from "./utils/rbac";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useUser();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/corporate-profile" element={<CorporateProfilePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/tenders" element={<TenderNoticesPage />} />
        <Route path="/specifications" element={<DownloadSpecificationsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/calendar" element={<EventsPage />} />
        <Route path="/dispatch" element={<HomePage />} />
      </Route>
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="users" element={<SuperAdminRoute><UsersManagementPage /></SuperAdminRoute>} />
        <Route path="news" element={<NewsManagementPage />} />
        <Route path="hero" element={<HeroManagementPage />} />
        <Route path="events" element={<EventsManagementPage />} />
        <Route path="corporate" element={<CorporateManagementPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
