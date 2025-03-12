import React, { useState } from "react";
import { Layout, Menu, message } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../utils/apicalls";
import internCheckLogo from "../image/inchck_logo.png";

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    console.log("Logout button clicked!");

    const email = localStorage.getItem("email");
    const id = localStorage.getItem("internId");
    const token = localStorage.getItem("authToken");

    console.log("Retrieved from localStorage:", { email, id, token });

    const payload = { id, token, email };
    console.log("Sending logout request with payload:", payload);

    try {
        const response = await postRequest("interns/logout", payload);
        console.log("Logout Response:", response);

        if (response?.message === "Intern logged out successfully.") {
            message.success("Logout successful! Redirecting to login...");
            alert("Logout successful! Redirecting to login...");

            localStorage.clear();
            sessionStorage.clear();

            navigate("/"); // Redirect immediately after clearing storage
        } else {
            message.error(response?.message || "Logout failed.");
        }
    } catch (error) {
        console.error("Logout error:", error);
        message.error("An error occurred while logging out.");
    }
};


  const handleTitleClick = () => {
    onCollapse(!collapsed);
  };

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse} className="fixed-sidebar">
      <div className="logo" onClick={handleTitleClick} style={{ cursor: "pointer", textAlign: "center" }}>
        <img src={internCheckLogo} alt="Intern Check" className="web-logo" />
      </div>
      <Menu theme="dark" mode="vertical" defaultSelectedKeys={["1"]}>
        <Menu.Item key="1" icon={<UserOutlined />}> Attendance </Menu.Item>
        <Menu.Item key="2" className="logout-btn" icon={<LogoutOutlined />} onClick={handleLogout}> Logout </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
