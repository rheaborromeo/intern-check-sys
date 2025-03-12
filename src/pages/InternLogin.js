import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../utils/apicalls";
import "../styles/InternLogin.css";
import logo from "../image/logo_.png";

const InternLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email } = values;

    if (!email) {
      message.error("Please input your email!");
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@module-zero\.com$/.test(email)) {
      message.error("Please enter a valid email (e.g., user@module-zero.com).");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending login request:", { email });
      const response = await postRequest("interns/login", { email });

      console.log("Login Response:", response); // Debugging

      if (response.success) {
        message.success("Login successful! Redirecting to OTP verification...");

        // Store email, id, and token in localStorage
        localStorage.setItem("email", email);
        if (response.data?.id) {
          localStorage.setItem("internId", response.data.id);
        } else {
          console.error("ID is missing from API response:", response.data);
        }
        localStorage.setItem("authToken", response.data?.token || "");

        navigate("/otp_verification", { state: { email } });
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
      <Form name="login-form" onFinish={onFinish} layout="vertical">
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please enter your email" }]}
        >
          <Input placeholder="Enter your email" disabled={loading} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block className="btn-login" loading={loading}>
            Login
          </Button>
        </Form.Item>
        <div className="admin-login-link">
          <a href="/admin_login">Login as admin</a>
        </div>
      </Form>
    </div>
  );
};

export default InternLogin;
