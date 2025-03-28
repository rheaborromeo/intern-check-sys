import React, { useState } from "react";
import { postRequest } from "../utils/apicalls";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import "../styles/InternLogin.css";
import logo from "../image/logo_.png";

const InternLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email } = values;
    setLoading(true);
    
    const payload = { email };

    try {
      const response = await postRequest("interns/login", payload);

      if (response.success) {
        message.success("Login successful!");
        localStorage.setItem("email", email);

        setTimeout(() => {
          navigate("/otp_verification", { state: { email } });
        }, 3000);
      } else {
        message.error(response.message || "Login failed. Please try again.");
      }
    } catch (error) {
      message.error("Login failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="intern-login-container">
      <img src={logo} alt="Logo" className="login-logo" />
      <ToastContainer />
      <Form 
        name="login-form" 
        onFinish={onFinish} 
        layout="vertical"
        initialValues={{ email: "" }} // Ensures controlled input
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { 
              type: "email", 
              message: "Please enter a valid email address!" 
            },
            {
              pattern: /^[a-zA-Z0-9._%+-]+@module-zero\.com$/,
              message: "Email must be from module-zero.com domain!",
            },
          ]}
        >
          <Input placeholder="Enter your email" disabled={loading} />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ marginTop: "10px", height: "36px" }}
          >
            Login
          </Button>
        </Form.Item>
        <div className="admin-login-link">
          <Button type="link" onClick={() => navigate("/admin_login")}>
            Login as admin
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default InternLogin;
