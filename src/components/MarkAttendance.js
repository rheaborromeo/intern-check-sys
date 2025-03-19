import React, { useState, useEffect } from "react";
import { postRequest } from "../utils/apicalls";
import { Button, Divider, message } from "antd";
import { ClockCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AttendanceOverlay.css";

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState("morning");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const currentHour = new Date().getHours();
    setSession(currentHour < 12 ? "morning" : "afternoon");
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
  const checkTime = () => {
    const currentHour = new Date().getHours();
    setIsDisabled(currentHour >= 15); // Disables the button if the hour is 15 (3 PM) or later
  };

  checkTime(); // Run once when the component mounts
  const timer = setInterval(checkTime, 60000); // Check every minute

  return () => clearInterval(timer); // Cleanup interval
}, []);


  const handleTimeInOut = async () => {
  
    const id = localStorage.getItem("internId");
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("authToken");

    const payload = { id, token, email };

    try {
      const response = await postRequest("timesheets/time_in_out", payload);

      if (response.status === "failed") {
        toast.error("You've already logged today.", { position: "top-right", autoClose: 2000, closeButton: false });
        return;
      }

      toast.success("Action successful!", { position: "top-right", autoClose: 3000 });
    } catch (error) {
      console.log(error)
      message.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="overlay-container">
      <ToastContainer />
      <div className="box-container">
        <Button type="text" icon={<CloseOutlined />} onClick={() => navigate(-1)} className="close-button" />

        <div className="clock-display">
          <ClockCircleOutlined style={{ marginRight: 8, fontSize: "1.6em" }} />
          <strong className="current-time">{currentTime}</strong>
        </div>

        <div className="time-section">
          <h3 className="session-class">{session.charAt(0).toUpperCase() + session.slice(1)} Session</h3>
          <div className="time-buttons">
            <Button type="primary" onClick={handleTimeInOut} disabled={isDisabled} >
              Time In
            </Button>
            <Button type="default" onClick={handleTimeInOut} >
              Time Out
            </Button>
          </div>

          <Divider />
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;

