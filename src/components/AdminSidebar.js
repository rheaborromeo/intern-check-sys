import React, { useState, useEffect } from "react";
import { Layout, Menu, message } from "antd";
import {
  ClockCircleOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import internCheckLogo from "../image/inchck_logo.png";
import { postRequest } from "../utils/apicalls";
import "../styles/Sidebar.css"; // Reuse Sidebar styles

const { Sider } = Layout;

const AdminSidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const requester = localStorage.getItem("requester");
    const token = localStorage.getItem("authToken");

    try {
      const response = await postRequest("/logout", requester, token);

      if (response?.message === "Logout successfully.") {
        message.success(response.message);
        localStorage.clear();
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("An error occurred while logging out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (location.pathname.includes("attendance")) {
      setSelectedKey("1");
    } else if (location.pathname.includes("interns")) {
      setSelectedKey("2");
    } else {
      setSelectedKey("");
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      width={200}
      breakpoint="lg"
      collapsedWidth={isMobile ? 0 : 80}
    >
      <div className="logo" onClick={handleTitleClick}>
        {!isMobile && collapsed ? (
          <MenuOutlined className="text-white text-2xl" />
        ) : (
          <img
            src={internCheckLogo}
            alt="Intern Check"
            className="web-logo transition-all duration-300 w-[90px] h-[90px]"
          />
        )}
      </div>

      <Menu
        theme="dark"
        mode="vertical"
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
        className="custom-menu"
      >
        <Menu.Item key="1" icon={<ClockCircleOutlined />}>
          Attendance
        </Menu.Item>
        <Menu.Item key="2" icon={<UserOutlined />}>
          Interns
        </Menu.Item>
        <Menu.Item
          key="3"
          icon={<LogoutOutlined />}
          className="logout-btn"
          disabled={isLoggingOut}
        >
          Logout
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AdminSidebar;
