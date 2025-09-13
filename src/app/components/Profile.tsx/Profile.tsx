import React from "react";
import { Form, Input, Button, Space } from "antd";
import styles from "./Profile.module.scss";

type ProfileProps = {
  loadingPassword: boolean;
  onPasswordChange: (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
  }) => void;
};

const Profile: React.FC<ProfileProps> = ({
  loadingPassword,
  onPasswordChange,
}) => {
  const confirmPasswordRules = [
    { required: true, message: "Подтвердите пароль" },
    ({ getFieldValue }: { getFieldValue: (name: string) => string }) => ({
      validator(_: unknown, value: string) {
        if (!value || getFieldValue("newPassword") === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error("Пароли не совпадают"));
      },
    }),
  ];

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {/* Смена пароля */}
      <div className={styles.formWrapper}>
        <Form layout="vertical" onFinish={onPasswordChange}>
          <Form.Item
            label="Текущий пароль"
            name="currentPassword"
            rules={[{ required: true, message: "Введите текущий пароль" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Новый пароль"
            name="newPassword"
            rules={[{ required: true, message: "Введите новый пароль" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Подтверждение пароля"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={confirmPasswordRules}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingPassword}
              block
            >
              Сменить пароль
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Space>
  );
};

export default Profile;
