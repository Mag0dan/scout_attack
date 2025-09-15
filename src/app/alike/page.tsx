"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Table, Spin } from "antd";
import styles from "./AlikePage.module.scss";
import { fetchAlike } from "@/api/alike.api";
import { AlikeDomain } from "@/types/alike.dto";

export default function AlikePage() {
  // Set page title
  usePageTitle("Схожие домены");

  const [domains, setDomains] = useState<AlikeDomain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDomains = async () => {
      setLoading(true);
      try {
        const data = await fetchAlike();
        setDomains(data);
      } finally {
        setLoading(false);
      }
    };
    loadDomains();
  }, []);

  const columns = [
    {
      title: "Домен",
      dataIndex: "domain",
      key: "domain",
    },
    {
      title: "IP-адрес",
      dataIndex: "ip_address",
      key: "ip_address",
    },
  ];

  if (loading) return <Spin size="large" />;

  return (
    <div className={styles.alikePage}>
      <section>
        <h2>Схожие по написанию домены</h2>
        <Table
          dataSource={domains}
          columns={columns}
          rowKey="domain"
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 20 }}
        />
      </section>
    </div>
  );
}
