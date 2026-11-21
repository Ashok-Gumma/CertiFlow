import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PublicVerifyPage } from './pages/PublicVerifyPage';
import { DashboardPage } from './pages/DashboardPage';
import { BatchesPage } from './pages/BatchesPage';
import { CreateBatchPage } from './pages/CreateBatchPage';
import { BatchDetailPage } from './pages/BatchDetailPage';
import { ApprovalCenterPage } from './pages/ApprovalCenterPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify" element={<PublicVerifyPage />} />
              <Route path="/verify/:certificateId" element={<PublicVerifyPage />} />

              {/* Protected Internal Dashboard Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/batches" element={<BatchesPage />} />
                <Route path="/batches/create" element={<CreateBatchPage />} />
                <Route path="/batches/:id" element={<BatchDetailPage />} />
                <Route path="/approvals" element={<ApprovalCenterPage />} />
                <Route path="/candidates" element={<CandidatesPage />} />
                <Route path="/certificates" element={<CertificatesPage />} />
                <Route path="/deliveries" element={<DeliveriesPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
