import React, { useState, useEffect } from "react";
import { Layout, Menu, message } from "antd";
import { ClockCircleOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../utils/apicalls";
import internCheckLogo from "../image/inchck_logo.png";
import { useLocation } from "react-router-dom";
import "../styles/Sidebar.css";
import "react-toastify/dist/ReactToastify.css";

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("1");
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Prevent multiple logout requests

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout requests
    setIsLoggingOut(true);

    console.log("Logout button clicked!");

    const email = localStorage.getItem("email");
    const id = localStorage.getItem("internId");
    const token = localStorage.getItem("authToken");

    if (!id || !token || !email) {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
      setIsLoggingOut(false);
      return;
    }

    console.log("Retrieved from localStorage:", { email, requester:id, token });

    const payload = { requester: id, token, email};

    console.log("Sending logout request with payload:", payload);

    try {
      const response = await postRequest("interns/logout", payload);

      if (response?.message === "Intern logged out successfully.") {
        message.success("Logout successful! Redirecting to login...", 3);
        localStorage.clear();
        sessionStorage.clear();
        navigate("/");
      } else {
        message.error(response?.message || "Logout failed.", 3);
      }
    } catch (error) {
      console.error("Logout error:", error);
      message.error("An error occurred while logging out.", 3);
    } finally {
      setIsLoggingOut(false); // Reset logout state
    }
  };

  useEffect(() => {
    if (location.pathname.includes("attendance")) {
      setSelectedKey("1");
    } else if (location.pathname.includes("interns")) {
      setSelectedKey("2");
    } else if (location.pathname.includes("login")) {
      setSelectedKey("");
    }
  }, [location.pathname]);

  const handleMenuClick = (e) => {
    if (e.key === "2") {
      handleLogout(); // Logout only triggered from here
    } else {
      setSelectedKey(e.key);
      navigate("/dashboard");
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
      <Menu theme="dark" mode="vertical" selectedKeys={[selectedKey]} onClick={handleMenuClick}>
        <Menu.Item key="1" icon={<ClockCircleOutlined />}> Attendance </Menu.Item>
        <Menu.Item key="2" className="logout-btn" icon={<LogoutOutlined />} disabled={isLoggingOut}>
          Logout
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
