import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { CloseOutlined } from "@ant-design/icons"; // Import the close icon from Ant Design
import { getRequest } from "../utils/apicalls";
import "../styles/InternDetail.css";
import mytLogo from "../image/myt logo.d51e67ca4d4eeea6450b.png";

const InternDetail = () => {
  const { id } = useParams();
  const [intern, setIntern] = useState(null);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate(); // Use useNavigate for navigation

  useEffect(() => {
    const fetchInternDetails = async () => {
      try {
        const response = await getRequest(`interns/get?token=${token}`);
        if (Array.isArray(response?.data)) {
          const found = response.data.find((i) => i.id.toString() === id);
          setIntern(found || null);
        }
      } catch (error) {
        console.error("Intern fetch error:", error);
      }
    };

    const fetchTimesheets = async () => {
      try {
        const response = await getRequest(
          `timesheets/get_approved_interns_timesheets?intern_id=${id}&token=${token}`
        );
        setTimesheets(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Timesheet fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInternDetails();
    fetchTimesheets();
  }, [id, token]);

  // Function to navigate back to the /interns page when Close Icon is clicked
  const goBack = () => {
    navigate("/interns");
  };

  return (
    <div className="dtr-container">
      <div className="dtr-paper">
        <div className="close-icon-container">
          <CloseOutlined
            onClick={goBack}
            style={{ fontSize: "20px", cursor: "pointer" }}
          />
        </div>
        <div className="dtr-header">
          <img src={mytLogo} alt="Logo" className="dtr-logo" />
          <div className="dtr-header-text">
            <h2 className="dtr-company-name">MYT SoftDev Solutions, Inc.</h2>
            <p className="dtr-company-address">
              301 The Greenery, Pope John Paul II Ave, Cebu City, 6000 Cebu
            </p>
          </div>
        </div>
        <h3 className="dtr-title">DAILY TIME RECORD</h3>
        <div className="dtr-info-table">
          <div className="dtr-info-cell">
            <strong>Name of Student:</strong>
            <div className="dtr-info-value">
              {intern
                ? `${intern.first_name} ${intern.middle_name?.[0] || ""} ${
                    intern.last_name
                  }${intern.suffix ? ", " + intern.suffix : ""}`
                : ""}
            </div>
          </div>
          <div className="dtr-info-cell">
            <strong>School:</strong>
            <div className="dtr-info-value">{intern?.school || ""}</div>
          </div>
          <div className="dtr-info-cell">
            <strong>Type:</strong>
            <div className="dtr-info-value">{intern?.type || ""}</div>
          </div>
          <div className="dtr-info-cell">
            <strong>Email:</strong>
            <div className="dtr-info-value">{intern?.email || ""}</div>
          </div>
        </div>

        <table className="dtr-record-table">
          <thead>
            <tr>
              <th className="dtr-date-col" rowSpan="2">
                Date
              </th>
              <th rowSpan="2">
                Set Up
                <br />
                (F2F/Remote)
              </th>
              <th colSpan="2">Morning</th>
              <th colSpan="2">Afternoon</th>
              <th rowSpan="2"># of Hours</th>
              <th rowSpan="2">Approved by</th>
            </tr>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : timesheets.length > 0 ? (
              timesheets.map((ts, index) => (
                <tr key={index}>
                  <td>{ts.date || ""}</td>
                  <td>{ts.work_style || ""}</td>
                  <td>{ts.time_in_am || ""}</td>
                  <td>{ts.time_out_am || ""}</td>
                  <td>{ts.time_in_pm || ""}</td>
                  <td>{ts.time_out_pm || ""}</td>
                  <td>{ts.total_hours || ""}</td>
                  <td>{ts.approved_by || ""}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No Approved Records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InternDetail;
