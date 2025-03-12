import React, { useState, useEffect } from "react";
import { Button, message } from "antd";
import { ClockCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../styles/AttendanceOverlay.css";
import { postRequest } from "../utils/apicalls";
import { Divider } from "antd";

const AttendanceOverlay = ({ onSubmit }) => {
  const navigate = useNavigate(); // For navigation back

  const [timeInMorning, setTimeInMorning] = useState(null);
  const [timeOutMorning, setTimeOutMorning] = useState(null);
  const [timeInAfternoon, setTimeInAfternoon] = useState(null);
  const [timeOutAfternoon, setTimeOutAfternoon] = useState(null);
  const [session, setSession] = useState("morning");
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

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

  const handleTimeIn = async () => {
    const timeNow = new Date().toLocaleTimeString();
    if (session === "morning") {
      setTimeInMorning(timeNow);
    } else {
      setTimeInAfternoon(timeNow);
    }

    try {
      const response = await postRequest(
        `interns/time_in_${session === "morning" ? "am" : "pm"}`,
        { timeIn: timeNow }
      );

      if (response.success) {
        message.success(
          `Time In for ${session} session recorded successfully!`
        );
      } else {
        message.error(response.message || `Failed to record Time In.`);
      }
    } catch (error) {
      message.error(`Failed to record Time In: ${error.message}`);
    }
  };

  const handleTimeOut = async () => {
    const timeNow = new Date().toLocaleTimeString();
    if (session === "morning") {
      setTimeOutMorning(timeNow);
    } else {
      setTimeOutAfternoon(timeNow);
    }

    try {
      const response = await postRequest(`timesheets/time_out_${session}`, {
        timeOut: timeNow,
      });

      if (response.success) {
        message.success(
          `Time Out for ${session} session recorded successfully!`
        );

        const newRecord = {
          key: Date.now(),
          id: Date.now(),
          name: "John Doe",
          date: new Date().toLocaleDateString(),
          mode: "F2F",
          timeIn1: timeInMorning,
          timeOut1: timeOutMorning,
          timeIn2: timeInAfternoon,
          timeOut2: timeOutAfternoon,
          status: "Pending",
        };

        onSubmit(newRecord);
      } else {
        message.error(response.message || `Failed to record Time Out.`);
      }
    } catch (error) {
      message.error(`Failed to record Time Out: ${error.message}`);
    }
  };

  return (
    <div className="overlay-container">
      <div className="box-container">
        {/* Close Button (X) on Upper Right */}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => navigate(-1)}
          className="close-button"
        />

        <div className="clock-display">
          <ClockCircleOutlined
            style={{
              marginRight: 8,
              fontSize: "1.6em",
              verticalAlign: "middle",
            }}
          />
          <strong
            className="current-time"
            style={{ fontSize: "1.6em", verticalAlign: "middle" }}
          >
            {currentTime}
          </strong>
        </div>

        <div className="time-section">
          <h3 className="session-class">
            {session.charAt(0).toUpperCase() + session.slice(1)} Session
          </h3>
          <div className="time-buttons">
            <Button
              type="primary"
              onClick={handleTimeIn}
              disabled={
                (session === "morning" && !!timeInMorning) ||
                (session === "afternoon" && !!timeInAfternoon)
              }
            >
              Time In
            </Button>
            <Button
              type="default"
              onClick={handleTimeOut}
              disabled={
                (session === "morning" &&
                  (!timeInMorning || !!timeOutMorning)) ||
                (session === "afternoon" &&
                  (!timeInAfternoon || !!timeOutAfternoon))
              }
            >
              Time Out
            </Button>
          </div>

          <Divider />
        </div>
      </div>
    </div>
  );
};

export default AttendanceOverlay;
