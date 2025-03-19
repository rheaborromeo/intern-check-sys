import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../utils/apicalls"; // Importing postRequest
import "../styles/AdminLogin.css";
import logo from "../image/logo_.png";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { username, password } = values;

    if (!username || !password) {
      toast.error("Please input fields", { position: "top-center", autoClose: 2000, closeButton: false });
      return;
    }

    setLoading(true);
    try {
      const response = await postRequest("login", { username, password });
      console.log("Login Response:", response);

      if (response?.token) {
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
          closeButton: false,
        });

        // Store user details in localStorage
        localStorage.setItem("username", username);
       

        // Navigate to Admin Dashboard
        setTimeout(() => {
          navigate("/admin_dashboard");
        }, 3000);
      } else {
        message.error(response.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
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
        <Form.Item label="Username" name="username">
          <Input placeholder="Enter your email" disabled={loading} />
        </Form.Item>

        <Form.Item label="Password" name="password">
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
