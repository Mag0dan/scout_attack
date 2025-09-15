"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Table, Input, Tag, Spin, Checkbox } from "antd";
import styles from "./EmailsPage.module.scss";
import { fetchEmails } from "@/api/emails.api";
import { EmailItem, SearchLoc, Leak } from "@/types/emails.dto";

const { Search } = Input;

export default function EmailsPage() {
  // Set page title
  usePageTitle("Email");

  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredEmails, setFilteredEmails] = useState<EmailItem[]>([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [compromisedFilter, setCompromisedFilter] = useState(false);

  useEffect(() => {
    const loadEmails = async () => {
      setLoading(true);
      try {
        const data = await fetchEmails();
        setEmails(data);
        setFilteredEmails(data);
      } finally {
        setLoading(false);
      }
    };
    loadEmails();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      filterEmails();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [emailFilter, emails, compromisedFilter]);

  // Фильтрация
  const filterEmails = () => {
    let result = emails;

    // фильтр по email
    if (emailFilter) {
      result = result.filter((e) =>
        e.email.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }

    // фильтр по скомпрометированным
    if (compromisedFilter) {
      result = result.filter((e) => e.compromised_flg);
    }

    setFilteredEmails(result);
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (_: string, record: EmailItem) => (
        <span style={{ color: record.compromised_flg ? "red" : undefined }}>
          {record.email} {record.is_latest_only && <Tag color="blue">New</Tag>}
        </span>
      ),
    },
    {
      width: "350px",
      title: "Места обнаружения",
      dataIndex: "search_locs",
      key: "search_locs",
      render: (locs: SearchLoc[]) =>
        locs.map((loc) => (
          <div className={styles.loc_name} key={loc.loc_name}>
            <Tag>{loc.loc_name}</Tag>
            {loc.dates?.map((d, i) => (
              <span key={i} style={{ fontSize: "12px", color: "#888" }}>
                {d.date_from} — {d.date_to}
              </span>
            ))}
          </div>
        )),
    },
    {
      title: "Утечки",
      dataIndex: "leaks",
      key: "leaks",
      render: (leaks: Leak[]) =>
        leaks.map((leak) => (
          <div className={styles.loc_name} key={leak.leak_name}>
            <Tag>{leak.leak_name}</Tag>
            <span style={{ fontSize: "12px", color: "#888" }}>
              {leak.leak_date}
            </span>
          </div>
        )),
    },
  ];

  if (loading) return <Spin size="large" />;

  return (
    <div className={styles.emailsPage}>
      <section>
        <h2>Найденные email в интернете</h2>

        <div className={styles.filters}>
          <Search
            placeholder="Введите email для поиска..."
            onChange={(e) => setEmailFilter(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Checkbox
            checked={compromisedFilter}
            onChange={(e) => setCompromisedFilter(e.target.checked)}
          >
            Скомпрометированные
          </Checkbox>
        </div>

        <Table
          dataSource={filteredEmails}
          columns={columns}
          rowKey="email"
          pagination={{ pageSize: 10 }}
        />
      </section>
    </div>
  );
}
