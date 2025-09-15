"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Layout, Space, Typography, Grid, Dropdown, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import styles from "./Headers.module.scss";

const { Header } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const pageTitles: Record<string, string> = {
  "/dashboard": "Дашборд",
  "/reports": "Уязвимости по хостам",
  "/emails": "Email",
  "/login": "Вход",
  "/ssl": "SSL-сертификаты",
  "/alike": "Схожие домены",
  "/profile": "Профиль",
};

const Headers: React.FC = () => {
  const path = usePathname();
  const router = useRouter();
  const screens = useBreakpoint();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    setAuthenticated(!!!cookie);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/logout', { method: 'POST' });
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
      message.success('Вы успешно вышли из системы');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Ошибка при выходе из системы');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Профиль',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'logout',
      label: 'Выход',
      onClick: handleLogout,
    },
  ];

  const title = pageTitles[path];

  const links = Object.keys(pageTitles).filter((href) => {
    if (path === "/login") {
      return href === "/login";
    }
    if (authenticated) {
      return href !== "/login";
    }
    return true;
  });

  return (
    <Header className={styles.header}>
      <Space
        direction={screens.xs ? "vertical" : "horizontal"}
        size="middle"
        className={`${styles.headerContent}`}
      >
        <Title level={3} className={styles.title}>
          {title}
        </Title>
        <Space size="middle">
          {links.map((href) => {
            if (href === "/profile") {
              return (
                <Dropdown
                  key={href}
                  menu={{ items: userMenuItems }}
                  trigger={['hover']}
                >
                  <span className={`${styles.linkButton} ${
                    path === href ? styles.active : ""
                  }`} style={{ cursor: 'pointer' }}>
                    <UserOutlined style={{ fontSize: '18px' }} />
                  </span>
                </Dropdown>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.linkButton} ${
                  path === href ? styles.active : ""
                }`}
              >
                {pageTitles[href]}
              </Link>
            );
          })}
        </Space>
      </Space>
    </Header>
  );
};

export default Headers;
