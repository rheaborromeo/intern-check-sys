import React, { useEffect, useState } from "react";
import { Table, Spin } from "antd";
import mytLogo from "../image/myt logo.d51e67ca4d4eeea6450b.png";
import "../styles/ApprovedPrint.css";
import { getRequest } from "../utils/apicalls";

const ApprovedPrint = ({ internId }) => {
  const [intern, setIntern] = useState(null);
  const [approvedRecords, setApprovedRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchApprovedRecords();
  }, []);

  const fetchApprovedRecords = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `timesheets/get_approved_interns_timesheets?intern_id=${internId}&token=${token}`
      );
      if (response?.data) {
        setIntern({
          name: response.data.name,
          school: response.data.school,
        });
        setApprovedRecords(
          Array.isArray(response.data.timesheets) ? response.data.timesheets : []
        );
      }
    } catch (error) {
      console.error("Error fetching approved records:", error);
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
    return totalHours.toFixed(2);
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
    },
    {
      title: "Setup",
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
        {
          title: "Start",
          dataIndex: "time_in_am",
          key: "time_in_am",
          render: convertTo12HourFormat,
        },
        {
          title: "End",
          dataIndex: "time_out_am",
          key: "time_out_am",
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
          key: "time_in_pm",
          render: convertTo12HourFormat,
        },
        {
          title: "End",
          dataIndex: "time_out_pm",
          key: "time_out_pm",
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
      title: "Approved by",
      key: "approved_by",
      render: (record) => {
        const approvedByParts = record.approved_by?.trim().split(" ") || [];
        const lastName =
          approvedByParts.length > 0
            ? approvedByParts[approvedByParts.length - 1]
            : "-";
    
        const approvedOn = record.approved_on
          ? new Date(record.approved_on).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "";
    
        return `${lastName} (${approvedOn})`;
      },
    }
    
  ];

  return (
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

        <div className="dtr-info-table">
          <div className="dtr-info-cell">
            <strong>Name of Student:</strong>
            <div className="dtr-info-value">{intern?.name || ""}</div>
          </div>
          <div className="dtr-info-cell">
            <strong>Organization:</strong>
            <div className="dtr-info-value">{intern?.school || ""}</div>
          </div>
          <div className="dtr-info-cell">
            <strong>Name of Supervisor:</strong>
            <div className="dtr-info-value"></div>
          </div>
          <div className="dtr-info-cell">
            <strong>Designation:</strong>
            <div className="dtr-info-value">Intern</div>
          </div>
        </div>

        <Spin spinning={loading} size="large">
          <div className="table-wrapper">
            <Table
              dataSource={approvedRecords.map((item, index) => ({
                ...item,
                key: index,
              }))}
              columns={approvedColumns}
              pagination={false}
              className="dtr-record-table"
              tableLayout="auto"
              scroll={{ x: true }}
            />
          </div>
        </Spin>

        <div className="total-hours-container">
          <h3>Total Approved Hours: {getTotalApprovedHours()} hrs.</h3>
        </div>
      </div>
    </div>
  );
};

export default ApprovedPrint;
