"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Table, Spin, Checkbox } from "antd";
import styles from "./SslPage.module.scss";
import { SslCert } from "@/types/ssl.dto";
import { fetchSsl } from "@/api/ssl.api";

type FilterType = "expired" | "active" | "expiring" | "foreign" | null;

// Функция для парсинга даты из формата "ДД.ММ.ГГГГ"
function parseDateDMY(str: string): Date {
  const [day, month, year] = str.split(".").map(Number);
  return new Date(year, month - 1, day); // месяц от 0 до 11
}

export default function SslPage() {
  // Set page title
  usePageTitle("SSL-сертификаты");

  const [certs, setCerts] = useState<SslCert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>(null);

  useEffect(() => {
    const loadSsl = async () => {
      setLoading(true);
      try {
        const data = await fetchSsl();
        setCerts(data);
      } finally {
        setLoading(false);
      }
    };
    loadSsl();
  }, []);

  const filteredCerts = certs.filter((cert) => {
    if (!filter) return true;

    const now = new Date();
    const validTo = parseDateDMY(cert.valid_to);
    const diffDays =
      (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (filter === "expired") return validTo < now;
    if (filter === "active") return validTo > now;
    if (filter === "expiring") return validTo > now && diffDays <= 30;
    if (filter === "foreign") return cert.has_foreign_domains === true;
    return true;
  });

  const columns = [
    {
      title: "Серийный номер",
      dataIndex: "serial_number",
      key: "serial_number",
    },
    {
      title: "Издатель",
      dataIndex: "cert_authority",
      key: "cert_authority",
    },
    {
      title: "Действует с",
      dataIndex: "valid_from",
      key: "valid_from",
    },
    {
      title: "Действует до",
      dataIndex: "valid_to",
      key: "valid_to",
      render: (text: string) => {
        const now = new Date();
        const validTo = parseDateDMY(text);
        let color = "inherit";

        const diffDays =
          (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

        if (validTo < now) color = "red";
        else if (diffDays <= 30) color = "orange";

        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: "Тема",
      dataIndex: "theme",
      key: "theme",
    },
    {
      title: "DNS-имена",
      dataIndex: "dns_names",
      key: "dns_names",
      render: (dns: string, record: SslCert) =>
        dns.split(",").map((d) => (
          <div
            key={d}
            style={{ color: record.has_foreign_domains ? "red" : "inherit" }}
          >
            {d}
          </div>
        )),
    },
  ];

  if (loading) return <Spin size="large" className={styles.spin} />;

  return (
    <div className={styles.sslPage}>
      <section>
        <h2>SSL сертификаты</h2>

        <div className={styles.filters}>
          <Checkbox
            checked={filter === "expired"}
            onChange={() => setFilter(filter === "expired" ? null : "expired")}
          >
            Просроченные
          </Checkbox>
          <Checkbox
            checked={filter === "active"}
            onChange={() => setFilter(filter === "active" ? null : "active")}
          >
            Действующие
          </Checkbox>
          <Checkbox
            checked={filter === "expiring"}
            onChange={() =>
              setFilter(filter === "expiring" ? null : "expiring")
            }
          >
            Скоро истекут
          </Checkbox>
          <Checkbox
            checked={filter === "foreign"}
            onChange={() => setFilter(filter === "foreign" ? null : "foreign")}
          >
            Посторонние домены
          </Checkbox>
        </div>

        <Table
          dataSource={filteredCerts}
          columns={columns}
          rowKey="serial_number"
          pagination={{ pageSize: 10 }}
          style={{ marginTop: 20 }}
        />
      </section>
    </div>
  );
}
