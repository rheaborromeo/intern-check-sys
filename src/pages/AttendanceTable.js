import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Spin, Select, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { getRequest } from "../utils/apicalls";
import Sidebar from "../components/Sidebar";
import "../styles/AttendanceTable.css";
import mytLogo from "../image/myt logo.d51e67ca4d4eeea6450b.png";
import ApprovedPrint from "./ApprovedPrint";
import ReactDOMServer from "react-dom/server";

const AttendanceTable = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasTimedOutToday, setHasTimedOutToday] = useState(false);
  const [pageSize, setPageSize] = useState(10); // Default page size
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance(currentPage);
  }, [currentPage, pageSize]);

  const fetchAttendance = async (page) => {
    setLoading(true);
    const email = localStorage.getItem("email");
    const id = localStorage.getItem("requester");
    const token = localStorage.getItem("authToken");

    try {
      const response = await getRequest(
        `timesheets/attendance?id=${id}&email=${email}&token=${token}&page=${page}&pageSize=${pageSize}`
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

  const getTotalApprovedHours = () => {
    const totalHours = attendanceData
      .filter((record) => record.status === "approved")
      .reduce((sum, record) => sum + (parseFloat(record.total_hours) || 0), 0);

    return totalHours.toFixed(2); // Rounds to two decimal places
  };

  const handlePrint = () => {
    const printContent = ReactDOMServer.renderToStaticMarkup(<ApprovedPrint />);

    const html = `
      <html>
        <head>
          <title>Print - Approved Attendance</title>
          <style>
            body {
              font-family: "Arial", sans-serif;
              margin: 30px;
              color: #333;
              background-color: #fff;
            }

            .approved-header-container {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                padding: 10px 0;
                margin-bottom: 10px;
                border-bottom: none;
}
            .approved-attendance-content {
              flex-grow: 1;
             
              display: flex;
   flex-direction: column;
              overflow: hidden;

}

            .approved-header-text {
              text-align: center;
            }

            .approved-company-name {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  text-align: left;
}


            .approved-company-address {
              font-size: 14px;
              color: #7f8c8d;
              text-align: left;
              margin: 0;
            }

           
              .myt-logo {
  width: 10%;
  height: 15%;
  margin-right: 15px;
  margin-left: 15px;

}

.approved-attendance-title {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  text-align: center !important;
  font-size: 21px !important;
  font-weight: bold !important;
  margin-top: 5px !important;
}

.attendance-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  margin-left: 0;
  padding: 0;
  background-color: white !important;
}

.total-hours-container {
  text-align: right !important;
  font-size: 13px;
  margin-top: 10px;
  margin-right: 20px;
  padding: 10px;
  border-radius: 8px;
  display: block;
  width: auto;
  white-space: nowrap; /* Prevents wrapping */
}
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 14px;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }

            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: center;
              vertical-align: middle;
            }

            th {
              background-color: #f4f4f4;
              font-weight: bold;
            }

            th[colspan] {
              text-align: center;
            }

            tr:nth-child(even) {
              background-color: #f9f9f9;
            }

            .no-data {
              text-align: center;
              padding: 50px;
              color: #999;
              font-size: 16px;
            }

            .buttons-container {
              display: flex;
              justify-content: flex-end;
              gap: 10px;
              margin-bottom: 20px;
            }

            .btn {
              padding: 8px 15px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
            }

            .btn-primary {
              background-color: #007bff;
              color: white;
            }

            .btn-secondary {
              background-color: #fff;
              color: black;
              border: 1px solid #ddd;
            }

              @media print {
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  @page {
    size: auto; /* Adjust paper size dynamically */
    margin: 10mm; /* Ensure content fits inside printable area */
  }

  body {
    font-size: 14px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .attendance-container {
    width: 100%;
    height: auto;
  }
   

  table {
    width: 100% !important;
    max-width: 100% !important;
    font-size: 12px;
    page-break-inside: avoid;
    transform: scale(0.7); /* Adjust scale dynamically */
    transform-origin: top left;
    margin: 0 auto; /* Center the table */
  }

  th, td {
    padding: 6px;
    white-space: nowrap; /* Prevents text wrapping */
  }

  .approved-header-container {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 15px;
    border-bottom: 1px solid #ccc;
  }

  .buttons-container, .btn {
    display: none !important;
  }

  img {
    max-width: 80px;
    height: auto;
  }
}

  }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
    window.onload = function() {
      window.print();
      window.close();
    };
  </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
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
      width: 50,
      className: "date-column",
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
      width: 50,
    },
    {
      title: "Morning", // Grouped header for Morning
      children: [
        {
          title: "Start", // Sub-column for "Start" (Time In)
          dataIndex: "time_in_am",
          key: "time_in_am",
          render: convertTo12HourFormat,
          width: 30,
        },
        {
          title: "End", // Sub-column for "End" (Time Out)
          dataIndex: "time_out_am",
          key: "time_out_am",
          render: convertTo12HourFormat,
          width: 30,
        },
      ],
    },
    {
      title: "Afternoon", // Grouped header for Afternoon
      children: [
        {
          title: "Start", // Sub-column for "Start" (Time In)
          dataIndex: "time_in_pm",
          key: "time_in_pm",
          render: convertTo12HourFormat,
          width: 30,
        },
        {
          title: "End", // Sub-column for "End" (Time Out)
          dataIndex: "time_out_pm",
          key: "time_out_pm",
          render: convertTo12HourFormat,
          width: 30,
        },
      ],
    },
    {
      title: "# of hours",
      dataIndex: "total_hours",
      key: "total_hours",
      width: 50,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      className: "status-column",
      render: (text) =>
        text === "absent" ? (
          ""
        ) : (
          <Tag
            color={text === "approved" ? "green" : "default"}
            className="status-tag"
          >
            {text}
          </Tag>
        ),
      width: 60,
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
      width: 50,
    },
  ];

  return (
    <>
      <div className="sidebar-wrapper">
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      </div>

      <div
        className={`attendance-container ${
          collapsed ? "collapsed" : "expanded"
        }`}
      >
        <div className="attendance-content">
          <div className="header-container">
            <img src={mytLogo} alt="MYT Logo" className="myt-logo" />
            <div className="header-text">
              <h2 className="company-name">MYT SoftDev Solutions, Inc.</h2>
              <p className="company-address">
                301 The Greenery, Pope John Paul II Ave, Cebu City, 6000 Cebu
              </p>
            </div>
          </div>

          <h2 className="attendance-title">Daily Time Record</h2>

          <div className="button-container">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/make_attendance")}
              disabled={hasTimedOutToday}
              className="attendance-button"
            >
              Time in/out
            </Button>

            <Button
              type="default"
              size="large"
              onClick={handlePrint}
              className="print-button"
            >
              Print
            </Button>
          </div>

          <div id="printable-area">
            <Spin spinning={loading} size="large">
              <div className="main-table-wrapper">
                <Table
                  dataSource={attendanceData.map((item, index) => ({
                    ...item,
                    key: index,
                  }))}
                  columns={columns}
                  pagination={false}
                  className="attendance-table"
                  tableLayout="fixed"
                />
              </div>
              <div className="total-hours-container">
                <h3>Total Approved Hours: {getTotalApprovedHours()} hrs.</h3>
              </div>
              <div className="pagination-container">
                <Select
                  defaultValue={pageSize}
                  onChange={(value) => setPageSize(value)}
                  style={{ width: 120 }}
                >
                  {[10, 20, 30, 40, 50].map((size) => (
                    <Select.Option key={size} value={size}>
                      {size} / page
                    </Select.Option>
                  ))}
                </Select>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={attendanceData.length}
                  onChange={setCurrentPage}
                />
              </div>
            </Spin>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceTable;
