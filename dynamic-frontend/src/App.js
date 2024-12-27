import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard.js';
import UserManagement from './components/UserManagement';
import RoleManagement from './components/RoleManagement';
import Reports from './components/Reports';
import Help from './components/Help';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="role-management" element={<RoleManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;

