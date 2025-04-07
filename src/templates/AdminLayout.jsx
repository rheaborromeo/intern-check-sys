// AdminLayout.js
import React, { useState } from "react";
import { Layout } from "antd";
import AdminSidebar from "../components/AdminSidebar"; // adjust path if needed

const { Content } = Layout;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true); // ✅ collapsed by default

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Content style={{ margin: "16px", padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
