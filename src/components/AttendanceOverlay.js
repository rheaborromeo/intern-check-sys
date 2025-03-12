import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { ClockCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../styles/AttendanceOverlay.css";
import { postRequest } from "../utils/apicalls";
import { Divider } from "antd";

const AttendanceOverlay = ({ onSubmit }) => {
  const navigate = useNavigate(); // For navigation back

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

  const handleTimeInOut = async () => {
    const id = localStorage.getItem('internId');
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('authToken');

    if (!id || !email || !token) {
        console.error('Missing authentication details');
        return;
    }
    const payload = { id, token, email };
    console.log("Sending request with payload:", payload); //for debugging........
    try {
        const response = await postRequest('timesheets/time_in_out', payload);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
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
              onClick={handleTimeInOut}
             
            >
              Time In
            </Button>
            <Button
              type="default"
              onClick={handleTimeInOut}

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
