import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/InternLogin'; // login for interns
import AttendanceTable from './pages/AttendanceTable';
import AdminLogin from "./pages/AdminLogin";  // ✅ Correct Default Import
import AdminDashboard from './pages/AdminDashboard';
import OTPAuthentication from './pages/OTPAuthentication';
import MarkAttendance from './components/MarkAttendance';
import InternsTable from './pages/InternsTable';
import PrintAttendanceTable from './pages/PrintAttendanceTable';
import ApprovedPrint from './pages/ApprovedPrint';
import InternDetail from './pages/InternDetail'; // Intern detail page
import 'antd/dist/reset.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Login />} />
        <Route path="/dashboard" element={<AttendanceTable />} /> 
        <Route path="/otp_verification" element={<OTPAuthentication />} /> 
        <Route path="/make_attendance" element={<MarkAttendance />} /> 
        <Route path="/print-attendance" element={<PrintAttendanceTable />} />
        <Route path="/print-approve" element={<ApprovedPrint />} />
        
        <Route path="/admin_login" element={<AdminLogin />} /> 
        <Route path="/admin_dashboard" element={<AdminDashboard />} /> 
        <Route path="/interns" element={<InternsTable />} /> 
        <Route path="/interns/:id/attendance" element={<InternDetail />} />

      </Routes>
    </Router>
  );
};

export default App;