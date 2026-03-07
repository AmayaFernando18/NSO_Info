import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Layout from "./components/Layout";
// import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CareersPage from "./pages/CareersPage";
import TenderNoticesPage from "./pages/TenderNoticesPage";
import DownloadSpecificationsPage from "./pages/DownloadSpecificationsPage";
import CorporateProfilePage from "./pages/CorporateProfilePage";
import { canAccessAdmin } from './utils/rbac'

// function ProtectedRoute({ children }: { children: ReactNode }) {
//   const { user, loading } = useUser();
//
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }
//
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
//
//   return <>{children}</>;
// }

function AppRoutes() {
  // const { user } = useUser();

  return (
    <Routes>
      {/* <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} /> */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/corporate-profile" element={<CorporateProfilePage />} />
        <Route path="/news" element={<HomePage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/tenders" element={<TenderNoticesPage />} />
        <Route path="/specifications" element={<DownloadSpecificationsPage />} />
        <Route path="/calendar" element={<HomePage />} />
        <Route path="/dispatch" element={<HomePage />} />
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
