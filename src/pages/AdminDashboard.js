import React, { useState, useEffect } from "react";
import { Table, Tabs, Tag, Checkbox, message } from "antd";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminDashboard.css";
import { getRequest, postRequest } from "../utils/apicalls";

const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState({});

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await getRequest("/interns/attendance_record");
      if (Array.isArray(response)) {
        setData(response);
      } else {
        console.error("Unexpected response format:", response);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setData([]);
    }
    setLoading(false);
  };

  const handleApproval = async (record) => {
    try {
      await postRequest("/interns/approved_attendance", { id: record.id, status: "Approved" });
      message.success("Attendance approved");
      fetchAttendance(); // Refresh data after approval
    } catch (error) {
      message.error("Failed to approve attendance");
    }
  };

  const onSelectChange = (record, checked) => {
    setSelectedRecords((prev) => ({
      ...prev,
      [record.id]: checked,
    }));
    if (checked) {
      handleApproval(record);
    }
  };

  const columnsBase = [
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Mode (F2F/Remote)",
      dataIndex: "mode",
      key: "mode",
      render: (text) => text && <Tag color={text === "F2F" ? "blue" : "green"}>{text}</Tag>,
    },
    { title: "Time In (AM)", dataIndex: "timeIn1", key: "timeIn1" },
    { title: "Time Out (AM)", dataIndex: "timeOut1", key: "timeOut1" },
    { title: "Time In (PM)", dataIndex: "timeIn2", key: "timeIn2" },
    { title: "Time Out (PM)", dataIndex: "timeOut2", key: "timeOut2" },
  ];

  return (
    <div className={`admin-dashboard-container ${collapsed ? "collapsed" : "expanded"}`}>
      <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      
      <div className="admin-dashboard-content">
        <Tabs defaultActiveKey="Pending">
          <TabPane tab="Pending" key="Pending">
            <Table
              columns={[
                { title: "Name", dataIndex: "name", key: "name" },
                ...columnsBase,
                {
                  title: "Status",
                  key: "status",
                  render: (_, record) => (
                    <Checkbox
                      checked={selectedRecords[record.id] || false}
                      onChange={(e) => onSelectChange(record, e.target.checked)}
                    >
                      Approve
                    </Checkbox>
                  ),
                },
              ]}
              dataSource={data.filter((item) => item.status === "Pending")}
              rowKey="id"
              loading={loading}
              scroll={{ x: "max-content" }}
            />
          </TabPane>

          <TabPane tab="Approved" key="Approved">
            <Table
              columns={[{ title: "Name", dataIndex: "name", key: "name" }, ...columnsBase]}
              dataSource={data.filter((item) => item.status === "Approved")}
              rowKey="id"
              loading={loading}
              scroll={{ x: "max-content" }}
            />
          </TabPane>

          <TabPane tab="Disapproved" key="Disapproved">
            <Table
              columns={[{ title: "Name", dataIndex: "name", key: "name" }, ...columnsBase]}
              dataSource={data.filter((item) => item.status === "Disapproved")}
              rowKey="id"
              loading={loading}
              scroll={{ x: "max-content" }}
            />
          </TabPane>

          <TabPane tab="All" key="All">
            <Table
              columns={[
                { title: "Name", dataIndex: "name", key: "name" },
                ...columnsBase,
                { title: "Status", dataIndex: "status", key: "status" },
              ]}
              dataSource={data}
              rowKey="id"
              loading={loading}
              scroll={{ x: "max-content" }}
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
