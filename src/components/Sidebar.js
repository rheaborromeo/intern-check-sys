import React, { useState, useEffect } from "react";
import { Layout, Menu, message } from "antd";
import { ClockCircleOutlined, LogoutOutlined} from "@ant-design/icons";
import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../utils/apicalls";
import internCheckLogo from "../image/inchck_logo.png";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";


const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("1");
  const location = useLocation();

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
  
      if (response?.message === "Intern logged out successfully.") {
          message.success("Logout successful! Redirecting to login...", { 
              position: "top-center", 
              autoClose: 3000, 
              closeButton: false 
          });
  
          localStorage.clear();
          sessionStorage.clear();
          navigate("/"); // Redirect immediately after clearing storage
      } else {
          message.error(response?.message || "Logout failed.", { 
              position: "top-center", 
              autoClose: 3000 
          });
      }
  } catch (error) {
      console.error("Logout error:", error);
      message.error("An error occurred while logging out.", { 
          position: "top-center", 
          autoClose: 3000 
      });
  }
  }  

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
        navigate("/dashboard");
        break;
      case "2":
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
    <>
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse} className="fixed-sidebar">
      <div className="logo" onClick={handleTitleClick} style={{ cursor: "pointer", textAlign: "center" }}>
        <img src={internCheckLogo} alt="Intern Check" className="web-logo" />
      </div>
      <Menu theme="dark" mode="vertical" selectedKeys={[location.pathname.includes("interns") ? "2" : "1"]} onClick={handleMenuClick}>
        <Menu.Item key="1" icon={<ClockCircleOutlined />}> Attendance </Menu.Item>
        <Menu.Item key="2" className="logout-btn" icon={<LogoutOutlined />} onClick={handleLogout}> Logout </Menu.Item>
      </Menu>
    </Sider>
    </>
  );
};

export default Sidebar;
