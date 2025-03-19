// import React, { useState, useEffect } from "react";
// import { postRequest } from "../utils/apicalls";
// import { Button, Divider, message } from "antd";
// import { ClockCircleOutlined, CloseOutlined } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "../styles/AttendanceOverlay.css";

// const MarkAttendance = () => {
//   const navigate = useNavigate();
//   const [session, setSession] = useState("morning");
//   const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

//   useEffect(() => {
//     const currentHour = new Date().getHours();
//     setSession(currentHour < 12 ? "morning" : "afternoon");
//   }, []);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date().toLocaleTimeString());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const [isDisabled, setIsDisabled] = useState(false);

//   useEffect(() => {
//   const checkTime = () => {
//     const currentHour = new Date().getHours();
//     setIsDisabled(currentHour >= 15); // Disables the button if the hour is 15 (3 PM) or later
//   };

//   checkTime(); // Run once when the component mounts
//   const timer = setInterval(checkTime, 60000); // Check every minute

//   return () => clearInterval(timer); // Cleanup interval
// }, []);


//   const handleTimeInOut = async () => {
  
//     const id = localStorage.getItem("internId");
//     const email = localStorage.getItem("email");
//     const token = localStorage.getItem("authToken");

//     const payload = { id, token, email };

//     try {
//       const response = await postRequest("timesheets/time_in_out", payload);

//       if (response.status === "failed") {
//         toast.error("You've already logged today.", { position: "top-right", autoClose: 2000, closeButton: false });
//         return;
//       }

//       toast.success("Action successful!", { position: "top-right", autoClose: 3000 });
//     } catch (error) {
//       console.log(error)
//       message.error("An error occurred. Please try again.");
//     }
//   };

//   return (
//     <div className="overlay-container">
//       <ToastContainer />
//       <div className="box-container">
//         <Button type="text" icon={<CloseOutlined />} onClick={() => navigate(-1)} className="close-button" />

//         <div className="clock-display">
//           <ClockCircleOutlined style={{ marginRight: 8, fontSize: "1.6em" }} />
//           <strong className="current-time">{currentTime}</strong>
//         </div>

//         <div className="time-section">
//           <h3 className="session-class">{session.charAt(0).toUpperCase() + session.slice(1)} Session</h3>
//           <div className="time-buttons">
//             <Button type="primary" onClick={handleTimeInOut} disabled={isDisabled} >
//               Time In
//             </Button>
//             <Button type="default" onClick={handleTimeInOut} >
//               Time Out
//             </Button>
//           </div>

//           <Divider />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MarkAttendance;

////recent
// import React, { useState, useEffect } from "react";
// import { postRequest, getRequest } from "../utils/apicalls";
// import { Button, Divider, message } from "antd";
// import { ClockCircleOutlined, CloseOutlined } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "../styles/AttendanceOverlay.css";

// const MarkAttendance = () => {
//   const navigate = useNavigate();
//   const [session, setSession] = useState("morning");
//   const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
//   const [isDisabled, setIsDisabled] = useState(false);
//   const [isTimedInMorning, setIsTimedInMorning] = useState(false);
//   const [isTimedOutMorning, setIsTimedOutMorning] = useState(false);
//   const [isTimedInAfternoon, setIsTimedInAfternoon] = useState(false);
//   const [isTimedOutAfternoon, setIsTimedOutAfternoon] = useState(false);
//   const now = new Date();
// const currentHours = now.getHours();
// const currentMinutes = now.getMinutes(); // Ensure this is defined

//   useEffect(() => {
//     const currentHour = new Date().getHours();
//     setSession(currentHour < 12 ? "morning" : "afternoon");
//   }, []);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date().toLocaleTimeString());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const checkTime = () => {
//       const currentHour = new Date().getHours();
//       setIsDisabled(currentHour > 16 || (currentHour === 16 && currentMinutes >= 30) && !isTimedInAfternoon); 
//       // Disable button after 3 PM AND only disable if no Time In record for the afternoon
//     };
//     checkTime();
//     const timer = setInterval(checkTime, 60000);
//     return () => clearInterval(timer);
//   }, [isTimedInAfternoon]); // Re-run when Time In status for afternoon changes

//   useEffect(() => {
//     fetchAttendanceStatus();
//   }, []);

//   const fetchAttendanceStatus = async () => {
//     const id = localStorage.getItem("internId");
//     const email = localStorage.getItem("email");
//     const token = localStorage.getItem("authToken");

//     try {
//       const response = await getRequest(`timesheets/attendance?id=${id}&email=${email}&token=${token}`);

//       if (response?.status !== "failed" && Array.isArray(response?.data)) {
//         const today = new Date().toISOString().split("T")[0];
//         const todayRecord = response.data.find((record) => record.date?.split("T")[0] === today);

//         if (todayRecord) {
//           setIsTimedInMorning(!!todayRecord.time_in_am);
//           setIsTimedOutMorning(!!todayRecord.time_out_am);
//           setIsTimedInAfternoon(!!todayRecord.time_in_pm);
//           setIsTimedOutAfternoon(!!todayRecord.time_out_pm);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching attendance status:", error);
//     }
//   };

//   const handleTimeInOut = async () => {
//     const id = localStorage.getItem("internId");
//     const email = localStorage.getItem("email");
//     const token = localStorage.getItem("authToken");

//     try {
//       const response = await postRequest("timesheets/punch", { id, token, email });

//       if (response.status === "failed") {
//         toast.error("You've already logged today.", { position: "top-right", autoClose: 2000, closeButton: false });
//         return;
//       }

//       toast.success("Action successful!", { position: "top-right", autoClose: 3000 });

//       if (session === "morning") {
//         if (!isTimedInMorning) {
//           setIsTimedInMorning(true); // Time In (Morning)
//         } else if (!isTimedOutMorning) {
//           setIsTimedOutMorning(true); // Time Out (Morning)
//           const currentHour = new Date().getHours();
//           if (currentHour >= 12) setSession("afternoon"); // Switch to afternoon
//         }
//       } else {
//         if (!isTimedInAfternoon) {
//           setIsTimedInAfternoon(true); // Time In (Afternoon)
//         } else {
//           setIsTimedOutAfternoon(true); // Time Out (Afternoon)
//         }
//       }
//     } catch (error) {
//       console.log(error);
//       message.error("An error occurred. Please try again.");
//     }
//   };

//   return (
//     <div className="overlay-container">
//       <ToastContainer />
//       <div className="box-container">
//         <Button type="text" icon={<CloseOutlined />} onClick={() => navigate(-1)} className="close-button" />

//         <div className="clock-display">
//           <ClockCircleOutlined style={{ marginRight: 8, fontSize: "1.6em" }} />
//           <strong className="current-time">{currentTime}</strong>
//         </div>

//         <div className="time-section">
//           <h3 className="session-class">{session.charAt(0).toUpperCase() + session.slice(1)} Session</h3>
//           <div className="time-buttons">
//             {session === "morning" ? (
//               !isTimedInMorning ? (
//                 <Button type="primary" onClick={handleTimeInOut} disabled={isDisabled}>
//                   Time In
//                 </Button>
//               ) : !isTimedOutMorning ? (
//                 <Button type="default" onClick={handleTimeInOut} disabled={isDisabled}>
//                   Time Out
//                 </Button>
//               ) : null
//             ) : !isTimedInAfternoon ? (
//               <Button type="primary" onClick={handleTimeInOut} disabled={isDisabled}>
//                 Time In
//               </Button>
//             ) : (
//               <Button type="default" onClick={handleTimeInOut} disabled={!isTimedInAfternoon}>
//                 Time Out
//               </Button>
//             )}
//           </div>
//           <Divider />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MarkAttendance;

//optimized
import React, { useState, useEffect } from "react";
import { postRequest, getRequest } from "../utils/apicalls";
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
  const [isDisabled, setIsDisabled] = useState(false);
  const [isTimedInMorning, setIsTimedInMorning] = useState(false);
  const [isTimedOutMorning, setIsTimedOutMorning] = useState(false);
  const [isTimedInAfternoon, setIsTimedInAfternoon] = useState(false);
  const [isTimedOutAfternoon, setIsTimedOutAfternoon] = useState(false);

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

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      
      setIsDisabled((currentHour > 16 || (currentHour === 16 && currentMinutes >= 30)) && !isTimedInAfternoon);
    };

    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, [isTimedInAfternoon]); // React when this value changes

  useEffect(() => {
    fetchAttendanceStatus();
  }, [session]); // Fetch attendance when session changes

  const fetchAttendanceStatus = async () => {
    const id = localStorage.getItem("internId");
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("authToken");

    try {
      const response = await getRequest(`timesheets/attendance?id=${id}&email=${email}&token=${token}`);

      if (response?.status !== "failed" && Array.isArray(response?.data)) {
        const today = new Date().toISOString().split("T")[0];
        const todayRecord = response.data.find((record) => record.date?.split("T")[0] === today);

        if (todayRecord) {
          setIsTimedInMorning(todayRecord.time_in_am ? true : false);
          setIsTimedOutMorning(todayRecord.time_out_am ? true : false);
          setIsTimedInAfternoon(todayRecord.time_in_pm ? true : false);
          setIsTimedOutAfternoon(todayRecord.time_out_pm ? true : false);
        }
      }
    } catch (error) {
      console.error("Error fetching attendance status:", error);
    }
  };

  const handleTimeInOut = async () => {
    const id = localStorage.getItem("internId");
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("authToken");

    try {
      const response = await postRequest("timesheets/punch", { id, token, email });

      if (response.status === "failed") {
        toast.error("You've already logged today.", { position: "top-right", autoClose: 2000, closeButton: false });
        return;
      }

      toast.success("Action successful!", { position: "top-right", autoClose: 3000 });

      if (session === "morning") {
        setIsTimedInMorning((prev) => !prev); // Toggle state correctly
        if (!isTimedInMorning) {
          setIsTimedInMorning(true);
        } else {
          setIsTimedOutMorning(true);
          setSession("afternoon");
        }
      } else {
        setIsTimedInAfternoon((prev) => !prev);
        if (!isTimedInAfternoon) {
          setIsTimedInAfternoon(true);
        } else {
          setIsTimedOutAfternoon(true);
        }
      }
    } catch (error) {
      console.log(error);
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
            {session === "morning" ? (
              !isTimedInMorning ? (
                <Button type="primary" onClick={handleTimeInOut} disabled={isDisabled}>
                  Time In
                </Button>
              ) : !isTimedOutMorning ? (
                <Button type="default" onClick={handleTimeInOut} disabled={isDisabled}>
                  Time Out
                </Button>
              ) : null
            ) : !isTimedInAfternoon ? (
              <Button type="primary" onClick={handleTimeInOut} disabled={isDisabled}>
                Time In
              </Button>
            ) : (
              <Button type="default" onClick={handleTimeInOut} disabled={!isTimedInAfternoon}>
                Time Out
              </Button>
            )}
          </div>
          <Divider />
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;


