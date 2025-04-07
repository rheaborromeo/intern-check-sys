import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const DashboardLayout = ({ children }) => {
  const [navigationItems, setNavigationItems] = useState([]);

  useEffect(() => {
    const userType = parseInt(localStorage.getItem("user_type"), 10);

    if (userType === 1) {
      // Admin navigation
      setNavigationItems([
        { label: "Dashboard", path: "/admin-dashboard", icon: <DashboardOutlined /> },
        { label: "Attendance", path: "/admin-dashboard", icon: <CalendarOutlined /> },
        { label: "Interns Record", path: "/admin/interns", icon: <UserOutlined /> },
      ]);
    } else if (userType === 2) {
      // Intern navigation
      setNavigationItems([
        { label: "Attendance", path: "/intern/attendance", icon: <CalendarOutlined /> },
        { label: "Logout", path: "/logout", icon: <LogoutOutlined /> },
      ]);
    }
  }, []);

  return (
    <Sidebar navigationItems={navigationItems}>
      <div className="content-area">{children}</div>
    </Sidebar>
  );
};

export default DashboardLayout;
