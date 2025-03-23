import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/InternLogin'; // login for interns
// import Dashboard from './pages/Dashboard'; // dashboard for interns
import AttendanceTable from './pages/AttendanceTable';
import AdminLogin from "./pages/AdminLogin";  // ✅ Correct Default Import
import AdminDashboard from './pages/AdminDashboard';
import OTPAuthentication from './pages/OTPAuthentication';
import MarkAttendance from './components/MarkAttendance';
import InternsTable from './pages/InternsTable';
import RegisterIntern from './pages/RegisterIntern';
import 'antd/dist/reset.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Login apiUrl={API_BASE_URL} />} />
        <Route path="/dashboard" element={<AttendanceTable />} /> 
        <Route path="/otp_verification" element={<OTPAuthentication />} /> 
        <Route path="/make_attendance" element={<MarkAttendance />} /> 
        
        <Route path="/admin_login" element={<AdminLogin />} /> 
        <Route path="/admin_dashboard" element={<AdminDashboard />} /> 
        <Route path="/interns" element={<InternsTable />} /> 
        <Route path="/register" element={<RegisterIntern />} />
      </Routes>
    </Router>
  );
};

export default App;