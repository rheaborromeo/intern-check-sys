import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, message, Row, Col, Spin, Statistic } from "antd";
import { postRequest } from "../utils/apicalls";
import "../styles/OTPAuthentication.css";

const { Countdown } = Statistic;

const OTPAuthentication = () => {
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

 
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [deadline, setDeadline] = useState(Date.now() + 300000);
  const [loadingVerify, setLoadingVerify] = useState(false);
  // const [loadingResend, setLoadingResend] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  // const otpGeneratedRef = useRef(false);
  const hasGeneratedOTP = useRef(false);
  const [loadingGenerate, setLoadingGenerate] = useState(true); // Initialize to true

  const handleGenerateOTP = useCallback(async () => {
    try {
      setLoadingGenerate(true);
      const data = await postRequest("interns/generate_otp", { email });
      if (data.status === "success") {
        message.success(data.message);
        setDeadline(Date.now() + 300000);
        setOtpExpired(false);
      } else {
        message.error(data.message);
      }
    } catch (error) {
      alert("Failed to generate OTP. Please try again.");
    } finally {
      setLoadingGenerate(false);
    }
  }, [email]);

  useEffect(() => {
    if (email && !hasGeneratedOTP.current) {
      handleGenerateOTP();
      hasGeneratedOTP.current = true;
    }
  }, [email, handleGenerateOTP]);


  const [loadingResend, setLoadingResend] = useState(false);

  const handleResendOTP = async () => {
    if (loadingResend) return; // Prevent multiple clicks
  
    setLoadingResend(true);
    try {
      const response = await postRequest("interns/resend_otp", { email });
    
      if (response.success) {  // Change from response.status === "success"
        message.success(response.message);
        setDeadline(Date.now() + 300000); // Reset countdown timer
        setOtpExpired(false); // Ensure OTP is not marked as expired
      } else {
        message.error(response.message || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      message.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoadingResend(false);
    }
  }
    

  const handleVerifyOTP = async () => {
  if (!email) return;

  const otpString = otp.join(""); // Convert array to string
  if (otp.length < 6 || otp.includes("")) {
    return alert("Please enter a valid 6-digit OTP.");
  }

  if (otpExpired) {
    return alert("This OTP has expired. Please request a new one.");
  }

  try {
    setLoadingVerify(true);

    const payload = { email, otp: otpString };
    const response = await postRequest("interns/verify_otp", payload);

    console.log("Backend Response:", response); // Debugging

    // Handle both possible success messages
    if (
      response.message === "OTP verified successfully." ||
      response.message === "Intern logged in successfully."
    ) {
      message.success(response.message);

      // Store token and ID for authentication
      if (response.token) {
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("tokenExpiry", response.token_expiry);
      }
      if (response.id) {
        localStorage.setItem("internId", response.id);
      }

      navigate("/dashboard");
    } else {
      // Handle any error messages properly
      const errorMessage =
        response.message || "Invalid OTP. Please try again.";
      alert(errorMessage);

      if (errorMessage.includes("OTP has expired")) {
        setOtpExpired(true);
      }
    }
  } catch (error) {
    alert("Failed to verify OTP. Please try again.");
  } finally {
    setLoadingVerify(false);
  }
};


  const handleChange = (element, index) => {
    const value = element.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== "" && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (element, index) => {
    if (element.key === "Backspace" && index > 0 && otp[index] === "") {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  if (!email) {
    return (
      <h3 style={{ textAlign: "center", color: "red" }}>
        Error: Email is required!
      </h3>
    );
  }

  return (
    <div className="otp-container">
      <h2 className="otp-title">Email Verification</h2>
      <p className="otp-subtext">Please enter the OTP sent to your email.</p>

      
        <Countdown
          value={deadline}
          format="mm:ss"
          valueStyle={{
            fontSize: "16px",
            color: "#000",
            marginTop: "-15px",
            marginBottom: "15px",
          }}
          onFinish={() => {
            alert("OTP has expired. Request a new one.");
            setOtpExpired(true);
          }}
        />
    
      <Form name="otp-form" onFinish={handleVerifyOTP} layout="vertical">
        <Input.Group>
          <Row gutter={8} justify="center">
            {otp.map((value, index) => (
              <Col key={index} span={3}>
                <Form.Item>
                  <Input
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength="1"
                    className="otp-input"
                    value={value}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus={index === 0}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Input.Group>

        <Form.Item className="verify-otp-button">
          <Button
            type="primary"
            htmlType="submit"
            block
            disabled={loadingVerify}
          >
            {loadingVerify ? <Spin /> : "Verify OTP"}
          </Button>
        </Form.Item>
      </Form>

      <Button
        className="resend-otp-button"
        onClick={handleResendOTP}
        block
        disabled={loadingGenerate}
      >
        {loadingGenerate ? <Spin /> : "Resend OTP"}
      </Button>
    </div>
  );
};

export default OTPAuthentication;
