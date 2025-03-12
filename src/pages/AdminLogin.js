import React, { useState, useEffect } from "react";
import { Form, Input, Button,  Modal } from "antd";
import { postRequest } from "../utils/apicalls"; // Import the postRequest function from your first code
import OTPVerification from "./OTPAuthentication";
import "../styles/InternLogin.css";


const AdminLogin = () => {
  const [emailError, setEmailError] = useState(null);
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email");
    const storedOtpVisible = sessionStorage.getItem("isOtpVisible") === "true";
    if (storedEmail && storedOtpVisible) {
      setEmail(storedEmail);
      setIsOtpVisible(storedOtpVisible);
    }
  }, []);

  const onFinish = async (values) => {
    const { email } = values;

    // Validate email format
    if (!email) {
      alert("Please input your email!");
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      alert("Please enter a valid email address (e.g., user@gmail.com).");
      return;
    }
    setEmailError(null); // Clear email error
    setEmail(email);

    const payload = { email };

    try {
      const response = await postRequest("admin/login", payload); // Use the postRequest from the first code
      if (response.success) {
        setIsOtpVisible(true);
        localStorage.setItem("email", email);
        localStorage.setItem("isOtpVisible", "true");
      } else {
        alert(response.message || "Login failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Login failed!");
    }
  };

  return (
    <div className="login-container">
      <h2 >Admin Login</h2>

      <Form name="login-form" onFinish={onFinish} layout="vertical">
        <Form.Item label="Email" name="email">
          <Input placeholder="Enter your email" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block className="btn-login">
            Login
          </Button>
        </Form.Item>

        <div className="error-notification">{emailError}</div>

        <div className="intern-login-link">
          <a href="/">Login as Intern</a>
        </div>
      </Form>

      <Modal
        className="modal-otp-centered"
        visible={isOtpVisible}
        onCancel={() => setIsOtpVisible(false)}
        footer={null}
      >
        <OTPVerification email={email} />
      </Modal>
    </div>
  );
};

export default AdminLogin;
