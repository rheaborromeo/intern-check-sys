import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, message, Row, Col, Spin, Statistic, Space } from "antd";
import { postRequest } from "../utils/apicalls";
import "../styles/OTPAuthentication.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Countdown } = Statistic;

const OTPAuthentication = () => {
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [deadline, setDeadline] = useState(Date.now() + 300000);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const hasGeneratedOTP = useRef(false);
  const [loadingGenerate, setLoadingGenerate] = useState(true); 
  const [loadingResend, setLoadingResend] = useState(false);

  const handleGenerateOTP = useCallback(async () => {
    try {
      setLoadingGenerate(true);
      const response = await postRequest("interns/generate_otp", { email });
      if (response.success) {
        message.success(response.message);
        setDeadline(Date.now() + 300000);
        setOtpExpired(false);
      } else {
        message.error(response.message);
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

  const handleResendOTP = async () => {
    if (loadingResend) return; 

    setLoadingResend(true);
    try {
      const response = await postRequest("interns/resend_otp", { email });

      if (response.success) { 
        message.success(response.message);
        setDeadline(Date.now() + 300000); 
        setOtpExpired(false); 
      } else {
        message.error(
          response.message || "Failed to resend OTP. Please try again."
        );
      }
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoadingResend(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!email) return;

    const otpString = otp.join(""); 

    if (otpExpired) {
      toast.error("This OTP has expired. Please request a new one.", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }
    try {
      setLoadingVerify(true);

      const payload = { email, otp: otpString };
      const response = await postRequest("interns/verify_otp", payload);

      console.log("Backend Response:", response); 

      if (
        response.message === "OTP verified successfully." ||
        response.message === "Intern logged in successfully."
      ) {
        message.success(response.message);

        if (response.token) {
          localStorage.setItem("authToken", response.token);
          localStorage.setItem("tokenExpiry", response.token_expiry);
        }
        if (response.id) {
          localStorage.setItem("internId", response.id);
        }
        navigate("/dashboard");
      } else {
        const errorMessage = "Invalid OTP. Please try again.";
        message.error(errorMessage);

        if (errorMessage.includes("OTP has expired")) {
          setOtpExpired(true);
        }
      }
    } catch (error) {
      message.error("Failed to verify OTP. Please try again.");
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

  return (
    <div className="otp-container">
      <ToastContainer />
      <h2 className="otp-title">Email Verification</h2>
      <p className="otp-subtext">Please enter the OTP sent to your email.</p>
      <Countdown
        value={deadline}
        format="mm:ss"
        valueStyle={{
          fontSize: "16px",
          color: "#000",
          marginTop: "-13px",
          marginBottom: "21px",
        }}
        onFinish={() => {
          setOtpExpired(true);
        }}
      />

      <Form name="otp-form" onFinish={handleVerifyOTP} layout="vertical">
        <Space.Compact>
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
        </Space.Compact>
      </Form>

      <Form.Item className="verify-otp-button">
        <Button
          type="primary"
          htmlType="submit"
          onClick={handleVerifyOTP}
          disabled={loadingVerify}
          style={{ fontWeight: "500" }}
        >
          {loadingVerify ? <Spin /> : "Verify OTP"}
        </Button>
      </Form.Item>

      <Form.Item className="resend-otp-button">
        <Button 
          onClick={handleResendOTP}
          disabled={loadingGenerate}
        >
          {loadingGenerate ? <Spin /> : "Resend OTP"}
        </Button>
      </Form.Item>
    </div>
  );
};

export default OTPAuthentication;
