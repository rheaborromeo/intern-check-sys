
import { Layout, message } from "antd";
import { Menu } from "antd";
import { ClockCircleOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import "../styles/Sidebar.css"; // Sidebar styles
import { useNavigate } from "react-router-dom"; //For redirection
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

    const token = localStorage.getItem("token");
    const id = localStorage.getItem("requester");
    
    // Set requester in local storage as required
    localStorage.setItem("requester", "1");

    const payload = { requester: id, token };
    console.log("Sending logout request with payload:", payload);

    try {
        const response = await postRequest("/logout", payload);

        if (response?.message === "Logout successfully.") {
            message.success("Logout successful! Redirecting to login...");
            console.log("Logout successful");

            // Clear localStorage and sessionStorage after successful logout
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
