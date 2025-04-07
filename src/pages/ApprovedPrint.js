import React, { useEffect, useState } from "react";
import { Table, Spin } from "antd";
import mytLogo from "../image/myt logo.d51e67ca4d4eeea6450b.png";
import "../styles/AttendanceTable.css";

import { getRequest } from "../utils/apicalls";

const ApprovedPrint = ({ handlePrint }) => {
  const [approvedRecords, setApprovedRecords] = useState([]);
  const [loading, setLoading] = useState(false); // Define setLoading here

  useEffect(() => {
    console.log("Component mounted. Fetching approved records...");
fetchApprovedRecords();
  }, []);

  const fetchApprovedRecords = async () => {
    setLoading(true);
    
    const requester = localStorage.getItem("requester");
    const token = localStorage.getItem("authToken");
  
    if (!requester || !token) {
      console.error("Missing token or requester.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await getRequest(
        'timesheets/get_approved_student_timesheets',
        { requester, token }
      );
  
      if (response?.status === "success" && Array.isArray(response?.data)) {
        setApprovedRecords(response.data);
      } else {
        setApprovedRecords([]);
      }
    } catch (error) {
      console.error("Error fetching approved records:", error);
      setApprovedRecords([]);
    } finally {
      setLoading(false);
    }
  };
   


  const convertTo12HourFormat = (time) => {
    if (!time) return "-";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getTotalApprovedHours = () => {
    const totalHours = approvedRecords.reduce(
      (sum, record) => sum + (parseFloat(record.total_hours) || 0),
      0
    );
    return totalHours.toFixed(2); // Rounded to 2 decimal places
  };

  const approvedColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) =>
        new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      width: 150,
    },
    {
      title: "Setup (FTF/Remote)",
      key: "setup",
      render: (record) => {
        const amModality =
          record.am_modality !== "Absent" ? record.am_modality : "";
        const pmModality =
          record.pm_modality !== "Absent" ? record.pm_modality : "";

        return [amModality, pmModality].filter(Boolean).join(" / ") || "-";
      },
      width: 150,
    },
    {
      title: "Morning",
      children: [
        {
          title: "Start",
          dataIndex: "time_in_am",
          key: "time_in_am",
          render: convertTo12HourFormat,
          width: 100,
        },
        {
          title: "End",
          dataIndex: "time_out_am",
          key: "time_out_am",
          render: convertTo12HourFormat,
          width: 100,
        },
      ],
    },
    {
      title: "Afternoon",
      children: [
        {
          title: "Start",
          dataIndex: "time_in_pm",
          key: "time_in_pm",
          render: convertTo12HourFormat,
          width: 100,
        },
        {
          title: "End",
          dataIndex: "time_out_pm",
          key: "time_out_pm",
          render: convertTo12HourFormat,
          width: 100,
        },
      ],
    },
    {
      title: "# of hours",
      dataIndex: "total_hours",
      key: "total_hours",
      width: 100,
    },
    {
      title: "Approved by",
      key: "approved_by",
      render: (record) => {
        const approvedBy = record.approved_by_name || "";
        const approvedOn = record.approved_on
          ? new Date(record.approved_on).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "";
        return `${approvedBy}  ${approvedOn}`;
      },
      width: 200,
    },
  ];

  return (
    <div className="attendance-content">
    <div className="approved-attendance-content">
      <div className="approved-header-container">
        <img src={mytLogo} alt="MYT Logo" className="myt-logo" />
        <div className="approved-header-text">
          <h2 className="approved-company-name">MYT SoftDev Solutions, Inc.</h2>
          <p className="approved-company-address">
            301 The Greenery, Pope John Paul II Ave, Cebu City, 6000 Cebu
          </p>
        </div>
      </div>

      <h2 className="approved-attendance-title">Daily Time Record</h2>

      <div id="printable-area">
        <Spin spinning={loading} size="large">
          <Table
            dataSource={approvedRecords.map((item, index) => ({
              ...item,
              key: index,
            }))}
            columns={approvedColumns}
            pagination={false}
            className="attendance-table"
            
            tableLayout="fixed"
          />

          <div className="total-hours-container">
            <h3>Total Approved Hours: {getTotalApprovedHours()} hrs.</h3>
          </div>
        </Spin>
      </div>
    </div>
    </div>
  );
};

export default ApprovedPrint;
