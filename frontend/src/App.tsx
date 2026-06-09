import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, AppDispatch, RootState } from './store/index';
import { fetchMe } from './store/authSlice';
import { connectSocket } from './services/socket';
import { LoginPage, RegisterPage } from './components/Auth';
import Landing from './components/Landing';
import ProjectList from './components/ProjectList';
import WorkspaceLayout from './components/WorkspaceLayout';
import KeyManager from './components/KeyManager';
import Gallery from './components/Gallery';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useSelector((s: RootState) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useSelector((s: RootState) => s.auth.user);
  if (user) return <Navigate to="/projects" replace />;
  return <>{children}</>;
}

function AppInit({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem('foundry_token');
    if (token) {
      dispatch(fetchMe()).then((r: any) => {
        if (!r.error) connectSocket(token);
      });
    }
  }, [dispatch]);

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AppInit>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthGuard><LoginPage /></AuthGuard>} />
          <Route path="/register" element={<AuthGuard><RegisterPage /></AuthGuard>} />
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
