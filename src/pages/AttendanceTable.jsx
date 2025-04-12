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
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasTimedOutToday, setHasTimedOutToday] = useState(false);
  const [totalApprovedHours, setTotalApprovedHours] = useState(0); // Track the total approved hours here
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

        // Update total records (estimate if not available)
        const estimatedTotal =
          response.pagination.totalRecords ||
          (response.data.length < pageSize && !response.pagination.hasNextPage
            ? (page - 1) * pageSize + response.data.length
            : (page + 1) * pageSize);
        setTotalRecords(estimatedTotal);

        checkIfTimedOut(response.data);

        // Update total approved hours based on the current page
        calculateTotalApprovedHours(response.data);
      } else {
        setAttendanceData([]);
        setPagination({ page: 1, pageSize: 10 });
        setHasNextPage(false);
        setTotalRecords(0);
      }
    } catch (error) {
      setAttendanceData([]);
      setPagination({ page: 1, pageSize: 10 });
      setHasNextPage(false);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalApprovedHours = (data) => {
    const total = data
      .filter((record) => record.status === "approved")
      .reduce((sum, record) => sum + (parseFloat(record.total_hours) || 0), 0);

    setTotalApprovedHours(total.toFixed(2));
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
      title: "Setup",
      key: "setup",
      render: (record) => {
        const am = record.am_modality !== "Absent" ? record.am_modality : "";
        const pm = record.pm_modality !== "Absent" ? record.pm_modality : "";
        if (am && pm && am === pm) return am;
        return [am, pm].filter(Boolean).join(" / ") || "-";
      },
    },
    {
      title: "Morning",
      children: [
        {
          title: "Start",
          dataIndex: "time_in_am",
          render: convertTo12HourFormat,
        },
        {
          title: "End",
          dataIndex: "time_out_am",
          render: convertTo12HourFormat,
        },
      ],
    },
    {
      title: "Afternoon",
      children: [
        {
          title: "Start",
          dataIndex: "time_in_pm",
          render: convertTo12HourFormat,
        },
        {
          title: "End",
          dataIndex: "time_out_pm",
          render: convertTo12HourFormat,
        },
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
      render: (text) => {
        let color = "default";
        if (text === "approved") {
          color = "green";
        } else if (text === "disapproved") {
          color = "red";
        } else if (text === "pending") {
          color = "blue";
        }

        return text === "absent" ? "" : <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Approved by",
      key: "approved_by",
      render: (record) => {
        const lastName = record.approved_by_name
          ? record.approved_by_name.split(" ").pop()
          : "-";
        const approvedOn = record.approved_on
          ? new Date(record.approved_on).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "";
        return approvedOn ? `${lastName} (${approvedOn})` : "";
      },
    },
  ];

  return (
    <div
      className={`attendance-container ${collapsed ? "collapsed" : "expanded"}`}
    >
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <div className="attendance-paper overflow-y-auto h-screen p-4">
        <div className="attendance-header flex items-center">
          <img src={mytLogo} alt="MYT Logo" className="attendance-logo" />
          <div className="attendance-header-text">
            <h2 className="attendance-company-name text-xl font-bold">
              MYT SoftDev Solutions, Inc.
            </h2>
            <p className="attendance-comp-address text-sm">
              301 The Greenery, Pope John Paul II Ave, Cebu City, 6000 Cebu
            </p>
          </div>
        </div>

        <h3 className="attendance-title mt-4 text-lg font-semibold">
          DAILY TIME RECORD
        </h3>

        <div className="attendance-button-container my-4 flex flex-wrap gap-2">
          <Button
            type="primary"
            onClick={() => navigate("/make_attendance")}
            disabled={hasTimedOutToday}
            className="attendance-button"
          >
            Time in/out
          </Button>
          <Button
            onClick={() => navigate("/print-approve")}
            className="print-button"
          >
            Print
          </Button>
        </div>

        <Spin spinning={loading} size="large">
          <div className="attendance-table-wrapper overflow-x-auto overflow-y-auto">
            <Table
              dataSource={attendanceData.map((item, index) => ({
                ...item,
                key: index,
              }))}
              columns={columns}
              pagination={false}
              className="attendance-record-table min-w-[1000px]"
              scroll={{ x: 1000 }}
            />
          </div>

          <div className="total-hours-container mt-4">
            <h3 className="text-base font-medium">
              Rendered Hours: {totalApprovedHours} hrs.
            </h3>
          </div>

          <div className="pagination-container mt-4 flex flex-wrap gap-4 items-center">
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
              className="custom-select"
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
              total={totalRecords}
              onChange={(page, pageSize) => setPagination({ page, pageSize })}
              showSizeChanger={false}
            />
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default AttendanceTable;
