import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Empty, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { getRequest } from "../utils/apicalls";
import Sidebar from "../components/Sidebar";
import "../styles/AttendanceTable.css";

const AttendanceTable = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasTimedOutToday, setHasTimedOutToday] = useState(false);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance(currentPage);
  }, [currentPage]);

  const fetchAttendance = async (page) => {
    setLoading(true);
    const email = localStorage.getItem("email");
    const id = localStorage.getItem("internId");
    const token = localStorage.getItem("authToken");

    try {
      const response = await getRequest(
        `timesheets/attendance?id=${id}&email=${email}&token=${token}&page=${page}`
      );

      if (response?.status === "failed") {
        setAttendanceData([]);
      } else if (Array.isArray(response?.data)) {
        setAttendanceData(response.data);
        checkIfTimedOut(response.data);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const checkIfTimedOut = (data) => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = data.find((record) => record.date?.split("T")[0] === today);

    if (todayRecord?.time_out_am && todayRecord?.time_out_pm) {
      setHasTimedOutToday(true);
    } else {
      setHasTimedOutToday(false);
    }
  };

  const convertTo12HourFormat = (time) => {
    if (!time) return "--";
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const standardHours = hours % 12 || 12;
    return `${standardHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { title: "Date", dataIndex: "date", key: "date",
      render: (date) =>
        new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), },
    { title: "AM Modality", dataIndex: "am_modality", key: "am_modality" },
    { title: "Time In (AM)", dataIndex: "time_in_am", key: "time_in_am", render: convertTo12HourFormat },
    { title: "Time Out (AM)", dataIndex: "time_out_am", key: "time_out_am", render: convertTo12HourFormat },
    { title: "PM Modality", dataIndex: "pm_modality", key: "pm_modality" },
    { title: "Time In (PM)", dataIndex: "time_in_pm", key: "time_in_pm", render: convertTo12HourFormat },
    { title: "Time Out (PM)", dataIndex: "time_out_pm", key: "time_out_pm", render: convertTo12HourFormat },
    { title: "Total Hours", dataIndex: "total_hours", key: "total_hours" },
    { title: "Status", dataIndex: "status", key: "status", render: (text) => <Tag color={text === "approved" ? "green" : "default"}>{text}</Tag> },
  ];

  return (
    <div className={`attendance-container ${collapsed ? "collapsed" : "expanded"}`}>
      {/* Sidebar (Hidden in print mode) */}
      <div className="sidebar-wrapper">
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      </div>

      {/* Main Content */}
      <div className="attendance-content">
        <h2 className="attendance-title">Daily Time Record</h2>
        <p className="sub-text-class">MYT SoftDev Solutions, Inc.</p>

        <div className="button-container">
          <Button
            type="primary"
            onClick={() => navigate("/make_attendance")}
            className="attendance-button"
            disabled={hasTimedOutToday}
          >
            Time in/out
          </Button>

          <Button
            type="default"
            onClick={handlePrint}
            className="print-button"
            style={{ marginLeft: 10 }}
          >
            Print
          </Button>
        </div>

        {/* Print area */}
        <div id="printable-area">
          <Spin spinning={loading} size="large">
            <Table
              dataSource={attendanceData.map((item, index) => ({ ...item, key: index }))}
              columns={columns}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                onChange: (page) => setCurrentPage(page),
              }}
              locale={{ emptyText: <Empty description="No Attendance Records Yet" /> }}
              className="attendance-table"
              scroll={{ x: "max-content" }}
            />
          </Spin>
        </div>
      </div>

      {/* Print-only styles */}
      <style>
        {`
          @media print {
            /* Hide Sidebar in print mode */
            .sidebar-wrapper {
              display: none !important;
            }

            /* Expand attendance content to full width */
            .attendance-content {
              width: 100%;
            }

            /* Hide buttons in print mode */
            .button-container {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AttendanceTable;
