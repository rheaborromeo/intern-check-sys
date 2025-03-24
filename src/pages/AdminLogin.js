import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../utils/apicalls";
import "../styles/AdminLogin.css";
import logo from "../image/logo_.png";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { username, password } = values;

    const payload = { 
      username,
      password, 
  };
    setLoading(true);
    try {
      const response = await postRequest("login", payload);
      
      message.success("Login successful!");
      localStorage.setItem("token", response.token);
    
      
      setTimeout(() => {
        navigate("/admin_dashboard", { state: { username: response.username } });
      }, 3000);
    } catch (error) {
      message.error("Login failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="login-logo" />
      <ToastContainer />
      <Form name="login-form" onFinish={onFinish} layout="vertical">
        <Form.Item label="Username" name="username" rules={[{ required: true, message: "Please enter your username!" }]}> 
          <Input placeholder="Enter your username" disabled={loading} />
        </Form.Item>

        <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter your password!" }]}> 
          <Input.Password placeholder="Enter your password" disabled={loading} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block className="btn-login" loading={loading}>
            Login
          </Button>
        </Form.Item>
        
        <div className="admin-login-link">
          <a href="/admin_login">Login as Intern</a>
        </div>
      </Form>
    </div>
  );
};

export default AdminLogin;