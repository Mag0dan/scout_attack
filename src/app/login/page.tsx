"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Form, Input, Button, App, Tooltip } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from "./LoginPage.module.scss";
import { fetchLoginUser, verify2FA } from "@/api/auth.api";

export default function LoginPage() {
  const router = useRouter();
  const { message } = App.useApp();

  // Set page title
  usePageTitle("Вход");

  const [require2fa, setRequire2fa] = useState(false);

  const onFinishLogin = async (values: { login: string; password: string }) => {
    try {
      const res = await fetchLoginUser(values.login, values.password);

      if (res.require2fa) {
        setRequire2fa(true);
        message.info("Введите код двухфакторной аутентификации");
      } else if (res.success) {
        if (res.must_change_password) {
          router.push("/profile", { scroll: false });
          message.warning("Необходимо сменить пароль");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      message.error((error as Error).message || "Ошибка входа");
    } finally {
    }
  };

  const onFinish2FA = async (values: { code: string }) => {
    try {
      const res = await verify2FA(values.code);

      if (res.success) {
        if (res.must_change_password) {
          message.warning("Необходимо сменить пароль");
        } else {
          message.success("Успешный вход");
          router.push("/dashboard");
        }
      } else {
        message.error("Неверный код 2FA");
      }
    } catch (error) {
      message.error((error as Error).message || "Ошибка проверки 2FA");
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.logo}>
        <span className={styles.logoText}>W</span>
        <span className={styles.logoText}>Y</span>
        <span className={styles.logoText}>S</span>
      </div>
      
      {!require2fa ? (
        <div className={styles.loginCard}>
          <h2 className={styles.title}>Вход в систему</h2>
          
          <Form
            name="login"
            onFinish={onFinishLogin}
            layout="vertical"
            className={styles.form}
          >
            <Form.Item
              label="Имя пользователя"
              name="login"
              rules={[{ required: true, message: "Введите логин" }]}
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="Введите имя пользователя" 
                className={styles.input}
              />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[{ required: true, message: "Введите пароль" }]}
            >
              <Input.Password 
                prefix={<LockOutlined />}
                placeholder="Введите пароль" 
                className={styles.input}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block className={styles.loginButton}>
                Войти
              </Button>
            </Form.Item>

            <div className={styles.forgotWrapper}>
              <Tooltip title="Обратитесь к вашему менеджеру для смены пароля">
                <a className={styles.forgotLink}>Забыли пароль?</a>
              </Tooltip>
            </div>
          </Form>
        </div>
      ) : (
        <Form
          name="2fa"
          onFinish={onFinish2FA}
          layout="vertical"
          className={styles.form}
        >
          <Form.Item
            label="Код из приложения"
            name="code"
            rules={[
              { required: true, message: "Введите 6-значный код" },
              { len: 6, message: "Код должен состоять из 6 цифр" },
            ]}
          >
            <Input placeholder="123456" maxLength={6} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Подтвердить
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
}
