import { Layout, message } from "antd";
import { Menu } from "antd";
import { ClockCircleOutlined, LogoutOutlined, UserOutlined, FileTextOutlined } from "@ant-design/icons";  // Added FileTextOutlined for Reports
import "../styles/Sidebar.css"; // Sidebar styles
import { useNavigate } from "react-router-dom"; // For redirection
import internCheckLogo from "../image/inchck_logo.png";
import { postRequest } from "../utils/apicalls";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const { Sider } = Layout;

const AdminSidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const history = useNavigate(); // Initialize useHistory
  const [selectedKey, setSelectedKey] = useState("1");
  const location = useLocation();

  const handleLogout = async () => {
    console.log("Logout button clicked!");

    const token = localStorage.getItem("authToken");
    const id = localStorage.getItem("requester");
    const requester = localStorage.getItem("requester");

    console.log("Sending logout request with payload:", requester, token);

    try {
        const response = await postRequest("/logout", requester, token);

        if (response?.message === "Logout successfully.") {
            message.success("Logout successful! Redirecting to login...");
            console.log("Logout successful");

            localStorage.clear();
            sessionStorage.clear();
            console.log("cleared.")

            // Ensure navigation happens after storage is cleared
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } else {
            message.error(response?.message || "Logout failed.");
            console.log("Logout failed.");
        }
    } catch (error) {
        console.error("Logout error:", error);
        message.error("An error occurred while logging out.");
    }
};

 // Sync menu selection with the current route
 useEffect(() => {
  if (location.pathname.includes("attendance")) {
    setSelectedKey("1");
  } else if (location.pathname.includes("interns")) {
    setSelectedKey("2");
  } else if (location.pathname.includes("reports")) {
    setSelectedKey("4"); // New Reports menu item
  } else if (location.pathname.includes("login")) {
    setSelectedKey(""); // Deselect everything on logout
  }
}, [location.pathname]);

const handleMenuClick = (e) => {
  setSelectedKey(e.key);

  switch (e.key) {
    case "1":
      navigate("/admin_dashboard");
      break;
    case "2":
      navigate("/interns");
      break;
    case "4":
      navigate("/reports"); // Redirect to the reports page
      break;
    case "3":
      handleLogout();
      break;
    default:
      break;
  }
};

const handleTitleClick = () => {
  onCollapse(!collapsed);
};

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      className="fixed-sidebar"
      width={220} 
    >
      <div className="logo" onClick={handleTitleClick} style={{ cursor: "pointer" }}>
        <img src={internCheckLogo} alt="Logo" className="web-logo"/>
      </div>
      <Menu theme="dark" mode="vertical" selectedKeys={[location.pathname.includes("interns") ? "2" : location.pathname.includes("reports") ? "4" : "1"]} onClick={handleMenuClick}>
        <Menu.Item key="1" className="attendance-btn" icon={<ClockCircleOutlined />}> Attendance </Menu.Item>
        <Menu.Item key="2" className="interns-btn" icon={<UserOutlined />}> Interns</Menu.Item>
        <Menu.Item key="4" className="reports-btn" icon={<FileTextOutlined />}> Reports </Menu.Item>  {/* New Reports menu item */}
        <Menu.Item key="3" className="logout-btn" icon={<LogoutOutlined />}> Logout </Menu.Item>  {/* Logout is last */}
      </Menu>
    </Sider>
  );
};

export default AdminSidebar;
