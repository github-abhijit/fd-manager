import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Landing />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Inventory />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
