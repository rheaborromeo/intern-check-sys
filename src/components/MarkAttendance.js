//optimized
import React, { useState, useEffect } from "react";
import { postRequest } from "../utils/apicalls";
import { Button, message } from "antd";
import { ClockCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/MarkAttendance.css";

const MarkAttendance = () => {
  const navigate = useNavigate();
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const session = currentHour < 12 ? "morning" : "afternoon";

  const [isTimedIn, setIsTimedIn] = useState(
    localStorage.getItem(`isTimedIn_${session}`) === "true"
  );
  const [isTimedOut, setIsTimedOut] = useState(
    localStorage.getItem(`isTimedOut_${session}`) === "true"
  );
  const isTimedInAfternoon =
    localStorage.getItem("isTimedIn_afternoon") === "true";

  const [currentFormattedTime, setCurrentFormattedTime] = useState(
    new Date().toLocaleTimeString()
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFormattedTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDate = new Date().toISOString().split("T")[0];
  if (localStorage.getItem("attendanceDate") !== todayDate) {
    localStorage.setItem("attendanceDate", todayDate);
    localStorage.removeItem("isTimedIn_morning");
    localStorage.removeItem("isTimedOut_morning");
    localStorage.removeItem("isTimedIn_afternoon");
    localStorage.removeItem("isTimedOut_afternoon");
  }

  const handleTimeInOut = async () => {
    if (isTimedOut) return;
    const id = localStorage.getItem("internId");
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("authToken");

    try {
      const response = await postRequest("timesheets/punch", {
        id,
        token,
        email,
      });
      if (response.status === "failed") {
        toast.error("You've already logged today.", {
          position: "top-right",
          autoClose: 2000,
        });
        return;
      }

      toast.success("Action successful!", {
        position: "top-right",
        autoClose: 3000,
      });
      if (!isTimedIn) {
        setIsTimedIn(true);
        localStorage.setItem(`isTimedIn_${session}`, "true");
      } else {
        setIsTimedOut(true);
        localStorage.setItem(`isTimedOut_${session}`, "true");
      }
    } catch (error) {
      console.log(error);
      message.error("An error occurred. Please try again.");
    }
  };

  const after430PM =
    currentHour > 16 || (currentHour === 16 && currentMinutes >= 30);
  const disableButton =
    (session === "afternoon" && after430PM && !isTimedInAfternoon) ||
    (session === "morning" && isTimedOut) ||
    (session === "afternoon" && isTimedOut);

  const hideButtons = session === "morning" && isTimedIn && isTimedOut;

  return (
    <div className="overlay-container">
      <ToastContainer />
      <div className="box-container">
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => navigate(-1)}
          className="close-button"
        />

        <div className="clock-display">
          <ClockCircleOutlined style={{ marginRight: 8, fontSize: "1.6em" }} />
          <strong className="current-time">{currentFormattedTime}</strong>
        </div>

        <div className="time-section">
          <h3 className="session-class">
            {session.charAt(0).toUpperCase() + session.slice(1)} Session
          </h3>
          <div className="time-buttons">
            <Button
              type={isTimedIn ? "default" : "primary"}
              onClick={handleTimeInOut}
              disabled={disableButton}
            >
              {isTimedOut
                ? "Session Completed"
                : isTimedIn
                ? "Time Out"
                : "Time In"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
