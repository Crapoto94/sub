import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import SynthesePage from './pages/SynthesePage';
import DossiersPage from './pages/dossiers/DossiersPage';
import AssociationsPage from './pages/associations/AssociationsPage';
import DossierAssociation from './pages/DossierAssociation';
import UsersPage from './pages/administration/UsersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SynthesePage />} />
            <Route path="/dossiers" element={<DossiersPage />} />
            <Route path="/dossiers/:id" element={<DossierAssociation />} />
            <Route path="/associations" element={<AssociationsPage />} />
            <Route
              path="/administration/utilisateurs"
              element={
                <ProtectedRoute adminOnly>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
