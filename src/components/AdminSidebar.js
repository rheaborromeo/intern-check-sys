
import { Layout, message } from "antd";
import { Menu } from "antd";
import { ClockCircleOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import "../styles/Sidebar.css"; // Sidebar styles
import { useNavigate } from "react-router-dom"; //For redirection
import internCheckLogo from "../image/inchck_logo.png";
import axios from "axios"; // Import axios
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";


const { Sider } = Layout;

const AdminSidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const history = useNavigate(); // Initialize useHistory
   const [selectedKey, setSelectedKey] = useState("1");
   const location = useLocation();

  const handleLogout = async () => {
    try {
        // Make an API call to logout
        const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}interns/logout`,
            {},
            { withCredentials: true } // Include cookies in the request
        );

        if (response.data.status === 'SUCCESS') {
            // Clear local storage and session storage
            localStorage.clear();
            sessionStorage.clear();

            message.success(response.data.message);
            history.push("/"); // Redirect to login page
        } else {
            message.error(response.data.message || "Failed to log out. Please try again.");
        }
    } catch (error) {
        message.error("An error occurred. Please try again.");
    }
};

 // Sync menu selection with the current route
 useEffect(() => {
  if (location.pathname.includes("attendance")) {
    setSelectedKey("1");
  } else if (location.pathname.includes("interns")) {
    setSelectedKey("2");
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
      <Menu theme="dark" mode="vertical"  selectedKeys={[location.pathname.includes("interns") ? "2" : "1"]}   onClick={handleMenuClick}>
        <Menu.Item key="1" className="attendance-btn" icon={<ClockCircleOutlined />}> Attendance </Menu.Item>
        <Menu.Item key="2" className="interns-btn" icon={<UserOutlined />}> Interns</Menu.Item>
        <Menu.Item key="3" className="logout-btn" icon={<LogoutOutlined />}> Logout </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AdminSidebar;
