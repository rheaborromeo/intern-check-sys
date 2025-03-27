import React, { useState, useEffect } from "react";
import { Table, Tabs, Checkbox, message, Button } from "antd";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminDashboard.css";
import { getRequest, postRequest } from "../utils/apicalls";

const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [pendingData, setPendingData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [disapprovedData, setDisapprovedData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState({});

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`timesheets/list`);
      console.log("API Response:", response);
      if (response && response.data) {
        setAllData(response.data);
        setPendingData(response.data.filter(item => item.status.toLowerCase() === "pending"));
        setApprovedData(response.data.filter(item => item.status.toLowerCase() === "approved"));
        setDisapprovedData(response.data.filter(item => item.status.toLowerCase() === "disapproved"));
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSelectChange = (record, checked) => {
    setSelectedRecords(prev => ({ ...prev, [record.id]: checked }));
  };

  const approveSelected = async () => {
    const approvedIds = Object.keys(selectedRecords).filter(id => selectedRecords[id]);
    if (approvedIds.length === 0) {
      message.warning("No records selected for approval.");
      return;
    }
    const requester = localStorage.getItem("requester");
    try {
      await postRequest("timesheets/approve", { requester, timesheet_ids: approvedIds });
      message.success("Selected records approved successfully.");
      fetchAttendance();
      setSelectedRecords({});
    } catch (error) {
      message.error("Failed to approve records.");
    }
  };

  const disapproveSelected = async () => {
    const disapprovedIds = Object.keys(selectedRecords).filter(id => selectedRecords[id]);
    if (disapprovedIds.length === 0) {
      message.warning("No records selected for disapproval.");
      return;
    }
    const requester = localStorage.getItem("requester");
    try {
      await postRequest("timesheets/disapprove", { requester, timesheet_ids: disapprovedIds });
      message.success("Selected records disapproved successfully.");
      fetchAttendance();
      setSelectedRecords({});
    } catch (error) {
      message.error("Failed to disapprove records.");
    }
  };

  const columnsBase = [
    { title: "Date", dataIndex: "date", key: "date", render: (date) =>
      new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), },
    { title: "AM Modality", dataIndex: "am_modality", key: "am_modality", render: (text) => text === "Absent" ? "" : text  },
    { title: "Time In (AM)", dataIndex: "time_in_am", key: "time_in_am" },
    { title: "Time Out (AM)", dataIndex: "time_out_am", key: "time_out_am" },
    { title: "PM Modality", dataIndex: "pm_modality", key: "pm_modality", render: (text) => text === "Absent" ? "" : text  },
    { title: "Time In (PM)", dataIndex: "time_in_pm", key: "time_in_pm" },
    { title: "Time Out (PM)", dataIndex: "time_out_pm", key: "time_out_pm" },
    { title: "Total Hours", dataIndex: "total_hours", key: "total_hours" },
  ];

  return (
    <div className={`admin-dashboard-container ${collapsed ? "collapsed" : "expanded"}`}>
      <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div className="admin-dashboard-content">
        <h3 className="title-header">Monitoring Records</h3>
        <Tabs defaultActiveKey="Pending">
          <TabPane tab="Pending" key="Pending">
          
            <Table
              columns={[{ title: "Name", dataIndex: "full_name", key: "full_name" }, ...columnsBase, {
                title: "Status", key: "select",
                render: (_, record) => (
                  <Checkbox
                    checked={selectedRecords[record.id] || false}
                    onChange={e => onSelectChange(record, e.target.checked)}
                  />
                ),
              }]}
              dataSource={pendingData}
              rowKey="id"
              loading={loading}
            />
            <div className="button-container">
            <Button type="primary" onClick={approveSelected} className="approve-btn">
              Approve
            </Button>
            <Button type="danger" onClick={disapproveSelected} className="disapprove-btn">
              Disapprove
            </Button>
          </div>
          </TabPane>
          <TabPane tab="Approved" key="Approved">
            <Table columns={[{ title: "Name", dataIndex: "full_name", key: "full_name" }, ...columnsBase]} dataSource={approvedData} rowKey="id" loading={loading} />
          </TabPane>
          <TabPane tab="Disapproved" key="Disapproved">
            <Table columns={[{ title: "Name", dataIndex: "full_name", key: "full_name" }, ...columnsBase]} dataSource={disapprovedData} rowKey="id" loading={loading} />
          </TabPane>
          <TabPane tab="All" key="All">
            <Table columns={[{ title: "Name", dataIndex: "full_name", key: "full_name" }, ...columnsBase, { title: "Status", dataIndex: "status", key: "status" }]} dataSource={allData} rowKey="id" loading={loading} />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
