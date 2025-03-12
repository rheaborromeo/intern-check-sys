import React from "react";
import { Layout, Menu, message } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import "../styles/Sidebar.css"; // Sidebar styles
import { useNavigate } from "react-router-dom"; //For redirection
import axios from "axios"; // Import axios

const { Sider } = Layout;

const AdminSidebar = ({ collapsed, onCollapse }) => {
  const history = useNavigate(); // Initialize useHistory

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
        Intern Check
      </div>
      <Menu theme="dark" mode="vertical" defaultSelectedKeys={["1"]}>
        <Menu.Item key="1" icon={<UserOutlined />}> Attendance </Menu.Item>
        <Menu.Item key="2" className="logout-btn" icon={<LogoutOutlined />} onClick={handleLogout}> Interns</Menu.Item>
        <Menu.Item key="2" className="logout-btn" icon={<LogoutOutlined />} onClick={handleLogout}> Logout </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AdminSidebar;
