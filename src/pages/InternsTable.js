

import React, { useEffect, useState } from "react";
import { Table, Button, Empty, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { getRequest } from "../utils/apicalls";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/InternsTable.css";

const InternsTable = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;
  const navigate = useNavigate();

 

  const fetchAttendance = async () => {
    setLoading(true); // Start loading before API call
    const email = localStorage.getItem("email");
    const id = localStorage.getItem("internId");
    const token = localStorage.getItem("authToken");

    try {
      const response = await getRequest(
        `timesheets/attendance?id=${id}&email=${email}&token=${token}`
      );

      if (response?.status === "failed") {
        console.error("Error:", response.message);
        setAttendanceData([]);
      } else if (Array.isArray(response?.data)) {
        setAttendanceData(response.data);
      } else {
        console.error("Unexpected response format:", response);
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false); // Stop loading after API call
    }
  };
  

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "School",
      dataIndex: "school",
      key: "school",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      align: "center",
    },
  ];


  return (
    <div className={`attendance-container ${collapsed ? "collapsed" : "expanded"}`}>
      <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <div className="attendance-content">
        <h2 className="attendance-title">Interns Record</h2>

        <div className="button-container">
          <Button
            type="primary"
            onClick={() => navigate("/register")}
            className="attendance-button"
          >
            Add Intern
          </Button>
        </div>

        <div className="table-wrapper">
          <Spin spinning={loading} size="large">
            <Table
              // dataSource={attendanceData.map((item, index) => ({ ...item, key: index }))}
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
    </div>
  );
};

export default InternsTable;
