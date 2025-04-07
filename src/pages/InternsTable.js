import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  notification,
} from "antd";
import { PlusOutlined } from "@ant-design/icons"; // Import the PlusOutlined icon
import { useNavigate } from "react-router-dom";  // Import the useNavigate hook
import { getRequest, postRequest } from "../utils/apicalls";
import AdminSidebar from "../components/AdminSidebar";
import mytLogo from "../image/myt logo.d51e67ca4d4eeea6450b.png";
import "../styles/InternsTable.css";

const InternsTable = () => {  
  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reload, setReload] = useState(false); // New reload state
  const [form] = Form.useForm();
  const pageSize = 10;
  const navigate = useNavigate();

  const fetchInterns = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await getRequest(
        `interns/get?page=${currentPage}&token=${token}`
      );

      if (response?.status === "failed") {
        console.error("Error:", response.message);
        setUserData([]);
      } else if (Array.isArray(response?.data)) {
        const transformedData = response.data.map((intern) => ({
          id: intern.id,
          name: `${intern.first_name} ${intern.middle_name ? intern.middle_name.charAt(0) + "." : ""} ${intern.last_name}${intern.suffix ? ", " + intern.suffix : ""}`.trim(),
          school: intern.school || "N/A",
          email: intern.email || "N/A",
          type: intern.type || "N/A",
        }));
        setUserData(transformedData);
      } else {
        console.error("Unexpected response format:", response);
        setUserData([]);
      }
    } catch (error) {
      console.error("Error fetching intern users:", error);
      setUserData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, [currentPage, reload]); // <-- include reload

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 90,
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
      title: "Type",
      dataIndex: "type",
      key: "type",
      align: "center",
    },
  ];

  const handleAddIntern = async (values) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      notification.error({ message: "Unauthorized: Missing auth token" });
      return;
    }

    const dataToSubmit = {
      first_name: values.first_name,
      middle_name: values.middle_name,
      last_name: values.last_name,
      school: values.school,
      email: values.email,
      type: values.type,
      suffix: values.suffix,
      token,
    };

    try {
      const response = await postRequest("interns/create", dataToSubmit);

      if (response?.status === "success" || response?.message?.includes("success")) {
        notification.success({
          message: "Intern Added Successfully",
        });
        setReload((prev) => !prev); // Trigger reload
        setIsModalVisible(false); // Close modal
        form.resetFields(); // Clear form
      } else {
        notification.error({
          message: "Failed to Add Intern",
          description: response?.message || "Something went wrong.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <div
      className={`list-attendance-container ${collapsed ? "collapsed" : "expanded"}`}
    >
      <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <div className="list-attendance-content">
        <div className="header-container">
          <img src={mytLogo} alt="MYT Logo" className="myt-logo" />
          <div className="header-text">
            <h2 className="company-name">MYT SoftDev Solutions, Inc.</h2>
            <p className="company-address">
              301 The Greenery, Pope John Paul II Ave, Cebu City, 6000 Cebu
            </p>
          </div>
        </div>
        <h2 className="list-attendance-title">Interns Record</h2>

        <div className="button-container">
          <Button
            type="primary"
            onClick={() => setIsModalVisible(true)}
            className="list-attendance-button"
            icon={<PlusOutlined />} // Add the Plus icon here
          >
            Add Intern
          </Button>
        </div>

        <div className="list-table-wrapper">
          <Spin spinning={loading} size="large">
            <div className="list-table-header">
              <Table
                dataSource={userData.map((item, index) => ({
                  ...item,
                  key: index,
                }))}
                columns={columns}
                tableLayout="fixed"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  onChange: (page) => setCurrentPage(page),
                }}
                locale={{
                  emptyText: <Empty description="No Intern Records Yet" />,
                }}
                className="list-attendance-table"
                onRow={(record) => ({
                  onClick: () => {
                    navigate(`/interns/${record.id}/attendance`);
                  },
                })}
              />
            </div>
          </Spin>
        </div>
      </div>

      {/* Add Intern Modal */}
      <Modal
        title="Add New Intern"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddIntern}>
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: "Please input the first name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="middle_name" label="Middle Name">
            <Input />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: "Please input the last name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="suffix" label="Suffix">
            <Input />
          </Form.Item>

          <Form.Item
            name="school"
            label="School"
            rules={[{ required: true, message: "Please input the school!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input the email!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select a type!" }]}
          >
            <Select>
              <Select.Option value="HS">HS</Select.Option>
              <Select.Option value="College">College</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Intern
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InternsTable;
