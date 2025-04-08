// Same imports remain
import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Spin, Select, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { getRequest } from "../utils/apicalls";
import Sidebar from "../components/Sidebar";
import "../styles/AttendanceTable.css";
import mytLogo from "../image/myt logo.d51e67ca4d4eeea6450b.png";

const AttendanceTable = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasTimedOutToday, setHasTimedOutToday] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance(pagination.page, pagination.pageSize);
  }, [pagination.page, pagination.pageSize]);

  const fetchAttendance = async (page, pageSize) => {
    setLoading(true);
    const email = localStorage.getItem("email");
    const id = localStorage.getItem("requester");
    const token = localStorage.getItem("authToken");

    try {
      const response = await getRequest(
        `timesheets/attendance?id=${id}&email=${email}&token=${token}&page=${page}&pageSize=${pageSize}`
      );
      if (response?.status === "success" && Array.isArray(response.data)) {
        setAttendanceData(response.data);
        setPagination({
          page: response.pagination.page,
          pageSize: response.pagination.pageSize,
        });
        setHasNextPage(response.pagination.hasNextPage);
        checkIfTimedOut(response.data);
      } else {
        setAttendanceData([]);
        setPagination({ page: 1, pageSize: 10 });
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
      setPagination({ page: 1, pageSize: 10 });
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  };

  const checkIfTimedOut = (data) => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const currentHour = now.getHours();

    const todayRecord = data.find(
      (record) => record.date?.split("T")[0] === today
    );

    if (!todayRecord) {
      localStorage.setItem("hasTimeInAM", "false");
      localStorage.setItem("hasTimeOutAM", "false");
      localStorage.setItem("hasTimeInPM", "false");
      localStorage.setItem("hasTimeOutPM", "false");
      setHasTimedOutToday(false);
      return;
    }

    const hasTimeInAM = !!todayRecord.time_in_am;
    const hasTimeOutAM = !!todayRecord.time_out_am;
    const hasTimeInPM = !!todayRecord.time_in_pm;
    const hasTimeOutPM = !!todayRecord.time_out_pm;

    localStorage.setItem("hasTimeInAM", hasTimeInAM.toString());
    localStorage.setItem("hasTimeOutAM", hasTimeOutAM.toString());
    localStorage.setItem("hasTimeInPM", hasTimeInPM.toString());
    localStorage.setItem("hasTimeOutPM", hasTimeOutPM.toString());

    setHasTimedOutToday(
      (currentHour < 12 && hasTimeInAM && hasTimeOutAM) ||
      (currentHour >= 12 && hasTimeInPM && hasTimeOutPM)
    );
  };

  const convertTo12HourFormat = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const standardHours = hours % 12 || 12;
    return `${standardHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
  };

  const getTotalApprovedHours = () =>
    attendanceData
      .filter((record) => record.status === "approved")
      .reduce((sum, record) => sum + (parseFloat(record.total_hours) || 0), 0)
      .toFixed(2);

  const columns = [
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
    },
    {
      title: "Setup (FTF/Remote)",
      key: "setup",
      render: (record) => {
        const am = record.am_modality !== "Absent" ? record.am_modality : "";
        const pm = record.pm_modality !== "Absent" ? record.pm_modality : "";
        return [am, pm].filter(Boolean).join(" / ") || "-";
      },
    },
    {
      title: "Morning",
      children: [
        { title: "Start", dataIndex: "time_in_am", render: convertTo12HourFormat },
        { title: "End", dataIndex: "time_out_am", render: convertTo12HourFormat },
      ],
    },
    {
      title: "Afternoon",
      children: [
        { title: "Start", dataIndex: "time_in_pm", render: convertTo12HourFormat },
        { title: "End", dataIndex: "time_out_pm", render: convertTo12HourFormat },
      ],
    },
    {
      title: "# of hours",
      dataIndex: "total_hours",
      key: "total_hours",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) =>
        text === "absent" ? "" : (
          <Tag color={text === "approved" ? "green" : "default"}>{text}</Tag>
        ),
    },
    {
      title: "Approved by",
      key: "approved_by",
      render: (record) => {
        const name = record.approved_by_name || "";
        const date = record.approved_on
          ? new Date(record.approved_on).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "";
        return `${name} ${date}`;
      },
    },
  ];

  return (
    <>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div className="dtr-container">
        <div className="dtr-paper">
          <div className="dtr-header">
            <img src={mytLogo} alt="MYT Logo" className="dtr-logo" />
            <div className="dtr-header-text">
              <h2 className="dtr-company-name">MYT SoftDev Solutions, Inc.</h2>
              <p className="dtr-company-address">
                301 The Greenery, Pope John Paul II Ave, Cebu City, 6000 Cebu
              </p>
            </div>
          </div>

          <h3 className="dtr-title">DAILY TIME RECORD</h3>

          <div className="button-container">
            <Button
              type="primary"
              onClick={() => navigate("/make_attendance")}
              disabled={hasTimedOutToday}
              className="attendance-button"
            >
              Time in/out
            </Button>
            <Button onClick={() => navigate("/print-approve")} className="print-button">
              Print
            </Button>
          </div>

          <Spin spinning={loading} size="large">
            <div className="table-wrapper">
              <Table
                dataSource={attendanceData.map((item, index) => ({
                  ...item,
                  key: index,
                }))}
                columns={columns}
                pagination={false}
                className="dtr-record-table"
               
              />
            </div>

            <div className="total-hours-container">
              <h3>Total Approved Hours: {getTotalApprovedHours()} hrs.</h3>
            </div>

            <div className="pagination-container">
              <Select
                defaultValue={pagination.pageSize}
                value={pagination.pageSize}
                onChange={(value) =>
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: value,
                    page: 1,
                  }))
                }
                style={{ width: 120 }}
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <Select.Option key={size} value={size}>
                    {size} / page
                  </Select.Option>
                ))}
              </Select>
              <Pagination
                current={pagination.page}
                pageSize={pagination.pageSize}
                total={
                  hasNextPage
                    ? (pagination.page + 1) * pagination.pageSize
                    : pagination.page * pagination.pageSize
                }
                onChange={(page, pageSize) =>
                  setPagination({ page, pageSize })
                }
                showSizeChanger={false}
              />
            </div>
          </Spin>
        </div>
      </div>
    </>
  );
};

export default AttendanceTable;
