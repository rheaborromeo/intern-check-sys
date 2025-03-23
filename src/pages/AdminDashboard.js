import React, { useState, useEffect } from "react";
import { Table, Tabs, Tag, Checkbox, message, Button } from "antd";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminDashboard.css";
import { getRequest, postRequest } from "../utils/apicalls";

const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [pendingData, setPendingData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState({});

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Fetch Attendance Data
  const fetchAttendance = async () => {
    setLoading(true);

    const email = localStorage.getItem("username");
    const id = localStorage.getItem("id");
    const token = localStorage.getItem("token");
    try {
     const response = await getRequest(
             `timesheets/attendance?id=${id}&email=${email}&token=${token}`
           );
      console.log("API Response:", response);
      if (response && response.data) {
        setAllData(response.data);
        setPendingData(response.data.filter((item) => item.status.toLowerCase() === "pending"));
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Checkbox Selection
  const onSelectChange = (record, checked) => {
    setSelectedRecords((prev) => ({
      ...prev,
      [record.id]: checked,
    }));
  };

  // Approve Selected Records
  const approveSelected = async () => {
    const approvedIds = Object.keys(selectedRecords).filter((id) => selectedRecords[id]);

    if (approvedIds.length === 0) {
      message.warning("No records selected for approval.");
      return;
    }

    try {
      await postRequest("timesheets/approve", { ids: approvedIds, status: "Approved" });
      message.success("Selected records approved successfully.");
      fetchAttendance(); // Refresh data after approval
      setSelectedRecords({});
    } catch (error) {
      message.error("Failed to approve records.");
    }
  };

  // Table Columns
  const columnsBase = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Time In (AM)", dataIndex: "time_in_am", key: "time_in_am" },
    { title: "Time Out (AM)", dataIndex: "time_out_am", key: "time_out_am" },
    { title: "Time In (PM)", dataIndex: "time_in_pm", key: "time_in_pm" },
    { title: "Time Out (PM)", dataIndex: "time_out_pm", key: "time_out_pm" },
    { title: "Total Hours", dataIndex: "total_hours", key: "total_hours" },
  ];

  return (
    <div className={`admin-dashboard-container ${collapsed ? "collapsed" : "expanded"}`}>
      <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      
      <div className="admin-dashboard-content">
        <Tabs defaultActiveKey="Pending">
          {/* Pending Tab */}
          <TabPane tab="Pending" key="Pending">
            <Button
              type="primary"
              onClick={approveSelected}
              disabled={Object.keys(selectedRecords).length === 0}
              style={{ marginBottom: 10 }}
            >
              Approve Selected
            </Button>
            <Table
              columns={[
                { title: "Name", dataIndex: "name", key: "name" },
                ...columnsBase,
                {
                  title: "Approve",
                  key: "approve",
                  render: (_, record) => (
                    <Checkbox
                      checked={selectedRecords[record.id] || false}
                      onChange={(e) => onSelectChange(record, e.target.checked)}
                    />
                  ),
                },
              ]}
              dataSource={pendingData}
              rowKey="id"
              loading={loading}
            />
          </TabPane>

          {/* Approved Tab */}
          <TabPane tab="Approved" key="Approved">
            <Table
              columns={[{ title: "Name", dataIndex: "name", key: "name" }, ...columnsBase]}
              dataSource={allData.filter((item) => item.status.toLowerCase() === "approved")}
              rowKey="id"
              loading={loading}
            />
          </TabPane>

          {/* Disapproved Tab */}
          <TabPane tab="Disapproved" key="Disapproved">
            <Table
              columns={[{ title: "Name", dataIndex: "name", key: "name" }, ...columnsBase]}
              dataSource={allData.filter((item) => item.status.toLowerCase() === "disapproved")}
              rowKey="id"
              loading={loading}
            />
          </TabPane>

          {/* All Records Tab */}
          <TabPane tab="All" key="All">
            <Table
              columns={[
                { title: "Name", dataIndex: "name", key: "name" },
                ...columnsBase,
                { title: "Status", dataIndex: "status", key: "status" },
              ]}
              dataSource={allData}
              rowKey="id"
              loading={loading}
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;