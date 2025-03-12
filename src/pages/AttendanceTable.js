import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Empty} from "antd";
import { useNavigate } from "react-router-dom";
import { getRequest } from "../utils/apicalls";
import Sidebar from "../components/Sidebar";
import "../styles/AttendanceTable.css";

const AttendanceTable = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance(currentPage);
  }, [currentPage]);

  const fetchAttendance = async (page) => {
    try {
      const response = await getRequest("timesheets/time_in_am", {
        page: page,
        limit: pageSize,
      });

      if (Array.isArray(response)) {
        setAttendanceData(response);
      } else {
        console.error("Unexpected response format:", response);
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    }
  };

  const convertTo12HourFormat = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const standardHours = hours % 12 || 12;
    return `${standardHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
  };

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Mode (F2F/Remote)",
      dataIndex: "mode",
      key: "mode",
      render: (text) => text && <Tag color={text === "F2F" ? "blue" : "green"}>{text}</Tag>,
    },
    {
      title: "Time In (AM)",
      dataIndex: "morningTimeIn",
      key: "morningTimeIn",
      render: (time) => convertTo12HourFormat(time),
    },
    {
      title: "Time Out (AM)",
      dataIndex: "morningTimeOut",
      key: "morningTimeOut",
      render: (time) => convertTo12HourFormat(time),
    },
    {
      title: "Time In (PM)",
      dataIndex: "afternoonTimeIn",
      key: "afternoonTimeIn",
      render: (time) => convertTo12HourFormat(time),
    },
    {
      title: "Time Out (PM)",
      dataIndex: "afternoonTimeOut",
      key: "afternoonTimeOut",
      render: (time) => convertTo12HourFormat(time),
    },
    {
      title: "Signature",
      dataIndex: "signature",
      key: "signature",
      render: (signature) => (signature ? signature : ""),
    },
  ];

  return (
    <div className={`attendance-container ${collapsed ? "collapsed" : "expanded"}`}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <div className="attendance-content">
        <h2 className="attendance-title">Attendance Record</h2>

        <div className="button-container">
          <Button type="primary" onClick={() => navigate("/make_attendance")} className="attendance-button">
            Mark Attendance
          </Button>
        </div>

        <div className="table-wrapper">
          <Table
            dataSource={attendanceData}
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
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;