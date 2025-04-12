import React, { useEffect, useState } from "react";
import { Table, Button, Empty, Spin, notification, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getRequest, postRequest } from "../utils/apicalls";
import AdminSidebar from "../components/AdminSidebar";
import mytLogo from "../image/myt logo.d51e67ca4d4eeea6450b.png";
import "../styles/InternsTable.css";

const InternsTable = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();

  const fetchInterns = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await getRequest(`interns/get?token=${token}`);

      if (response?.status === "failed") {
        setUserData([]);
      } else if (Array.isArray(response?.data)) {
        const transformed = response.data.map((intern) => ({
          id: intern.id,
          name: `${intern.first_name} ${
            intern.middle_name ? intern.middle_name.charAt(0) + "." : ""
          } ${intern.last_name}${
            intern.suffix ? ", " + intern.suffix : ""
          }`.trim(),
          school: intern.school || "N/A",
          email: intern.email || "N/A",
          type: intern.type || "N/A",
        }));
        setUserData(transformed);
      } else {
        setUserData([]);
      }
    } catch (err) {
      setUserData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, [reload]);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", align: "center", width: 90 },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 150,
      render: (text, record) => (
        <span
          style={{
            cursor: "pointer",
            color: "inherit",
            textDecoration: "none",
          }}
          onClick={() => navigate(`/interns/${record.id}/attendance`)}
          onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
        >
          {text}
        </span>
      ),
    },
    {
      title: "School",
      dataIndex: "school",
      key: "school",
      align: "center",
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      width: 150,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      align: "center",
      width: 100,
    },
  ];

  return (
    <div
      className={`list-record-container ${
        collapsed ? "collapsed" : "expanded"
      }`}
    >
      <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <div className="list-dashboard-content overflow-y-auto p-4">
        <div className="list-header-container">
          <img src={mytLogo} alt="MYT Logo" className="list-myt-logo" />
          <div className="list-header-text">
            <h2 className="list-company-name text-xl font-bold">
              MYT SoftDev Solutions, Inc.
            </h2>
            <p className="list-company-address text-sm">
              301 The Greenery, Pope John Paul II Ave, Cebu City, 6000 Cebu
            </p>
          </div>
        </div>

        <h3 className="list-title-header text-lg font-semibold">
          Interns Record
        </h3>

        <div className="button-container">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/create_intern")}
          >
            Add Intern
          </Button>
        </div>
        <div className="list-table-wrapper">
          <Spin spinning={loading} size="large">
            <Table
              dataSource={userData.map((item, index) => ({
                ...item,
                key: index,
              }))}
              columns={columns}
              tableLayout="fixed"
              locale={{
                emptyText: <Empty description="No Intern Records Yet" />,
              }}
              className="list-attendance-table"
              scroll={{ x: "max-content" }}
              pagination={false}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default InternsTable;
