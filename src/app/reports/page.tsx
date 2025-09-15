"use client";
import { useEffect, useState } from "react";
import { message, Spin } from "antd";
import { usePageTitle } from "@/hooks/usePageTitle";
import styles from "./ReportsPage.module.scss";
import LastScanCard from "../components/LastScanCard/LastScanCard";
import PreviousScansCard from "../components/PreviousScansCard/PreviousScansCard";
import HostVulnerabilitiesCard from "../components/HostsVulnerabilitiesCard/HostsVulnerabilitiesCard";
import { CompareReportsResponse } from "@/types/Reports.dto";
import {
  fetchReportsData,
  compareReports,
  downloadReport,
} from "@/api/reports.api";


export default function ReportsPage() {
  // Set page title
  usePageTitle("Уязвимости по хостам");

  const [data, setData] = useState<CompareReportsResponse | null>(null);
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const reportsData = await fetchReportsData();
      setData(reportsData);
    } catch (err) {
      console.error("Ошибка загрузки отчётов:", err);
      message.error("Не удалось загрузить отчёты");
    } finally {
      setLoading(false);
    }
  }

  async function handleCompare(firstId: number, secondId: number) {
    if (!data) return;
    try {
      const result = await compareReports(firstId, secondId);
      setData((prev) =>
        prev ? { ...prev, compare_reports: result.compare_reports ?? [] } : prev
      );
      message.success("Отчёты успешно сравнены");
    } catch (err) {
      console.error("Ошибка сравнения отчётов:", err);
      message.error("Не удалось сравнить отчёты");
    }
  }

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await downloadReport();

      if (!blob.size) {
        message.error("Отчёт пустой или недоступен");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "report.pdf"; // можно использовать имя с сервера
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 0);
      window.URL.revokeObjectURL(url);

      message.success("Отчёт успешно скачан");
    } catch (err) {
      console.error("Ошибка при скачивании отчёта:", err);
      message.error("Ошибка при скачивании отчёта");
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className={styles.loading}>
        <Spin tip="Загрузка отчётов..." size="large" />
      </div>
    );

  if (!data) return <div>Нет данных для отображения</div>;

  return (
    <div className={styles.reports}>
      <section>
        <LastScanCard
          data={data}
          downloading={downloading}
          onDownload={handleDownload}
        />

        <PreviousScansCard
          data={data}
          selectedReports={selectedReports}
          setSelectedReports={setSelectedReports}
          onCompare={handleCompare}
        />

        <HostVulnerabilitiesCard data={data} />
      </section>
    </div>
  );
}
