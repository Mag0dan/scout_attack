import React from "react";
import styles from "./TopIPsList.module.scss";
import { TopIP } from "@/types/dashboard.dto";

type Props = {
  topIPs: TopIP[];
  totalIPsCount: number;
  vulnerableIPsCount: number;
  oldEncIPsCount: number;
};

// ключи в одном месте + строгая типизация
const LEVELS = ["Critical", "Medium", "Low"] as const;
type Level = (typeof LEVELS)[number];

const COLORS: Record<Level, string> = {
  Critical: "#dc3545", // красный
  Medium: "#ffc107", // жёлтый
  Low: "#28a745", // зелёный
};

const TopIPsList: React.FC<Props> = ({
  topIPs,
  totalIPsCount,
  vulnerableIPsCount,
  oldEncIPsCount,
}) => {
  // ищем максимум по всем IP
  const maxVulnCount = Math.max(
    ...topIPs.map((ip) => Number(ip.vulnerabilityCount ?? 0)),
    1 // защита от деления на 0
  );

  const topIP = topIPs.map((item) => {

    return (
      <div key={item.ip} className={styles.item}>
        <span className={styles.ip}>{item.ip}</span>

        <div className={styles.barWrapper}>
          {LEVELS.map((lvl) => {
            const count = Number(item[lvl] ?? 0);
            if (!count) return null;

            // считаем ширину относительно maxVulnCount
            const width = (count / maxVulnCount) * 100;

            return (
              <div
                key={lvl}
                className={styles.barSegment}
                style={{ width: `${width}%`, backgroundColor: COLORS[lvl] }}
              >
                {count}
              </div>
            );
          })}
        </div>
      </div>
    );
  });

  return (
    <div className={styles.card}>
      <h2>IP-адреса</h2>

      <div className={styles.summary}>
        <div className={styles.total}>
          <strong>{totalIPsCount}</strong>
          <br />
          Найдено
          <br />
          IP-адресов
        </div>
        <div className={styles.vulnerable}>
          <strong>{vulnerableIPsCount}</strong>
          <br />С уязвимостями
        </div>
        <div className={styles.oldEnc}>
          <strong>{oldEncIPsCount}</strong>
          <br />
          С устаревшим
          <br />
          шифрованием
        </div>
      </div>
      <h3>IP-адреса с наибольшим количеством уязвимостей</h3>
      {topIP}
    </div>
  );
};

export default TopIPsList;
