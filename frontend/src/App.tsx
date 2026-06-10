import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, AppDispatch, RootState } from './store/index';
import { checkPassphrase } from './store/authSlice';
import { SetupPage, UnlockPage } from './components/Auth';
import Landing from './components/Landing';
import ProjectList from './components/ProjectList';
import WorkspaceLayout from './components/WorkspaceLayout';
import KeyManager from './components/KeyManager';
import Gallery from './components/Gallery';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isUnlocked } = useSelector((s: RootState) => s.auth);
  if (!isUnlocked) return <Navigate to="/unlock" replace />;
  return <>{children}</>;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isUnlocked, hasPassphrase } = useSelector((s: RootState) => s.auth);
  if (!hasPassphrase) return <Navigate to="/setup" replace />;
  if (isUnlocked) return <Navigate to="/projects" replace />;
  return <>{children}</>;
}

function AppInit({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => { dispatch(checkPassphrase()); }, [dispatch]);
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AppInit>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/unlock" element={<AuthGuard><UnlockPage /></AuthGuard>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
          <Route path="/workspace/:id" element={<ProtectedRoute><WorkspaceLayout /></ProtectedRoute>} />
          <Route path="/keys" element={<ProtectedRoute><KeyManager /></ProtectedRoute>} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppInit>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}
