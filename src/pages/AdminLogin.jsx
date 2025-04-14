import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../utils/apicalls";
import "../styles/adminlogin.css"; // Import the TailwindCSS file

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

      message.success(response.message);
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("requester", response.id);

      setTimeout(() => {
        navigate("/admin_dashboard", {
          state: { username: response.username },
        });
      }, 3000);
    } catch (error) {
      message.error("Login failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <img src={logo} alt="Logo" className="login-logo" />
        <ToastContainer />
        <Form name="login-form" onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username!" }]}
          >
            <Input
              className="input-field"
              placeholder="Enter your username"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              className="input-field"
              placeholder="Enter your password"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="login-button"
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>

          <div className="admin-login-link">
            <a href="/">Login as Intern</a>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AdminLogin;
