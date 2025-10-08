// HostVulnerabilitiesCard.tsx
"use client";

import { Table, Typography, Card, Drawer, Spin } from "antd";
import { useState } from "react";
import styles from "./HostsVulnerabilitiesCard.module.scss";

import { getHostColumns } from "./HostColumns";
import {
  CompareReportsResponse,
  HostCompare,
  PortInfo,
  VulnDetail,
  EncryptionDetail,
  Subdomain, // <- убедись, что тип есть в Reports.dto
} from "@/types/Reports.dto";
import { fetchVuln, fetchEncrypt } from "@/api/vulners.api";

const { Title } = Typography;

interface HostsVulnerabilitiesCardProps {
  data: CompareReportsResponse;
}

const HostVulnerabilitiesCard: React.FC<HostsVulnerabilitiesCardProps> = ({
  data,
}) => {
  const [expandedHosts, setExpandedHosts] = useState<Record<string, boolean>>(
    {}
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [vulnData, setVulnData] = useState<VulnDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const [encryptDrawerVisible, setEncryptDrawerVisible] = useState(false);
  const [encryptData, setEncryptData] = useState<EncryptionDetail | null>(null);
  const [encryptLoading, setEncryptLoading] = useState(false);

  const toggleHost = (ip: string) => {
    setExpandedHosts((prev) => ({ ...prev, [ip]: !prev[ip] }));
  };

  const openVulnDrawer = async (name: string) => {
    setDrawerVisible(true);
    setLoading(true);
    try {
      const data = await fetchVuln<VulnDetail>(name);
      setVulnData(data);
    } catch (err) {
      console.error(err);
      setVulnData(null);
    } finally {
      setLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const openEncryptDrawer = async (name: string) => {
    setEncryptDrawerVisible(true);
    setEncryptLoading(true);
    try {
      const data = await fetchEncrypt<EncryptionDetail>(name);
      setEncryptData(data);
    } catch (err) {
      console.error(err);
      setEncryptData(null);
    } finally {
      setEncryptLoading(false);
    }
  };

  const closeEncryptDrawer = () => {
    setEncryptDrawerVisible(false);
  };

  // колонки поддоменов
  const subdomainColumns = [
    {
      title: "Поддомен/ssl",
      dataIndex: "Subdomain",
      key: "Subdomain",
      render: (text: string) => (
        <span className={styles.subdomain}>{text}</span>
      ),
    },
    {
      title: "Тип связи",
      dataIndex: "ConnType",
      key: "ConnType",
      render: (text: string) => <span className={styles.connType}>{text}</span>,
      width: 160,
    },
  ];

  return (
    <Card className={styles.card}>
      <Title level={4}>Уязвимости по хостам</Title>

      {data?.compare_reports?.map((host: HostCompare) => {
        const isExpanded = !!expandedHosts[host.IP];

        return (
          <Card key={host.IP} className={styles.hostCard}>
            <Title
              level={5}
              onClick={() => toggleHost(host.IP)}
              className={styles.hostTitle}
            >
              {host.IP}  {host.Hostname}{" "}
              {host.ConType ? `(${host.ConType})` : ""}
              <br/>
              Порты: {Object.keys(host.Ports).length} | 
              Уязвимости: {Object.values(host.Ports).reduce(
                (total, port) => total + Object.keys(port.Vulnerabilities).length,
                0
              )} | 
              Поддомены: {host.Subdomains?.length || 0}
              <span className={styles.show}>{isExpanded ? "скрыть" : "показать"}</span>
            </Title>

            <div
              className={isExpanded ? styles.tableWrapper : styles.tableHidden}
            >
              <div className={styles.hostContent}>
                <Table<PortInfo>
                  className={styles.portsTable}
                  size="middle"
                  pagination={false}
                  rowKey={(row) => row.Port}
                  dataSource={Object.values(host.Ports)}
                  columns={getHostColumns(openVulnDrawer, openEncryptDrawer)}
                  
                />
                {/* Левая колонка — Поддомены */}
                
                  <Table<Subdomain>
                    size="middle"
                    pagination={false}
                    rowKey={(row) => row.Subdomain}
                    dataSource={host.Subdomains ?? []}
                    columns={subdomainColumns}
                    locale={{ emptyText: "Нет поддоменов" }}
                    bordered={true}
                  />
                

                {/* Правая колонка — Порты/уязвимости */}
                
              </div>
            </div>
          </Card>
        );
      })}

      <Drawer
        title={"Информация об уязвимости"}
        placement="right"
        width={420}
        onClose={closeDrawer}
        open={drawerVisible}
        afterOpenChange={(open) => !open && setVulnData(null)}
      >
        {loading ? (
          <Spin />
        ) : vulnData ? (
          <div>
            <p>
              <strong>Имя: </strong>
              {vulnData.name}
            </p>
            <p>
              <strong>Описание:</strong> {vulnData.description}
            </p>
            <p>
              <strong>CVSS Score:</strong> {vulnData.cvss_score}
            </p>
            <p>
              <strong>Уровень критичности:</strong> {vulnData.crit_level}
            </p>
            <p>
              <strong>CVSS Vector:</strong> {vulnData.cvss_vector}
            </p>
            <p>
              <strong>CVSS Version:</strong> {vulnData.cvss_version}
            </p>
          </div>
        ) : (
          <p>Не удалось загрузить данные</p>
        )}
      </Drawer>

      <Drawer
        title={"Информация о шифровании"}
        placement="right"
        width={420}
        onClose={closeEncryptDrawer}
        open={encryptDrawerVisible}
        afterOpenChange={(open) => !open && setEncryptData(null)}
      >
        {encryptLoading ? (
          <Spin />
        ) : encryptData ? (
          <div>
            <p>
              <strong>Название: </strong>
              {encryptData.name}
            </p>
            <p>
              <strong>Описание:</strong> {encryptData.description}
            </p>
            <p>
              <strong>Серьёзность:</strong> {encryptData.severity}
            </p>
            <p>
              <strong>Уровень критичности:</strong> {encryptData.crit_level}
            </p>
          </div>
        ) : (
          <p>Не удалось загрузить данные</p>
        )}
      </Drawer>
    </Card>
  );
};

export default HostVulnerabilitiesCard;
