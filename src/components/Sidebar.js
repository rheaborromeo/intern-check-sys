import React, { useState, useEffect } from "react";
import { Layout, Menu, message } from "antd";
import {
  ClockCircleOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { postRequest } from "../utils/apicalls";
import internCheckLogo from "../image/inchck_logo.png";

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedKey, setSelectedKey] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const email = localStorage.getItem("email");
    const token = localStorage.getItem("authToken");
    const requester = localStorage.getItem("requester");

    if (!requester || !token || !email) {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
      setIsLoggingOut(false);
      return;
    }

    const payload = { requester, token, email };

    try {
      const response = await postRequest("interns/logout", payload);

      if (response?.message === "Intern logged out successfully.") {
        message.success(response.message);
        localStorage.clear();
        navigate("/");
      } else {
        message.error(response?.message);
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
    if (e.key === "2") {
      handleLogout();
    } else if (e.key === "1") {
      navigate("/dashboard");
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
        <Menu.Item key="2" icon={<LogoutOutlined />} disabled={isLoggingOut}>
          Logout
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
