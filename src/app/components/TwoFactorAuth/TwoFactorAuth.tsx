"use client";

import { useState } from "react";
import { Modal, Input, Button, Form, Typography, Spin } from "antd";
import { App } from "antd";

import { setup2FA, confirm2FA } from "@/api/twoFactor.api";

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const QR_CODE_API = "https://api.qrserver.com/v1/create-qr-code/";

export default function TwoFactorAuth({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [step, setStep] = useState<"setup" | "confirm">("setup");

  const { message } = App.useApp();

  const handleSetup = async (password: string) => {
    setLoading(true);
    try {
      const data = await setup2FA(password);
      if (data.success) {
        setQrCode(data.qrcode ?? null);
        setSecret(data.totp_secret ?? null);
        setStep("confirm");
        message.success("QR-код сгенерирован, отсканируйте его в приложении");
      } else {
        message.error("Не удалось сгенерировать QR-код");
      }
    } catch (err) {
      console.error(err);
      message.error("Ошибка при настройке 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (code: string) => {
    setLoading(true);
    try {
      const data = await confirm2FA(code);
      if (data.success) {
        message.success("2FA успешно активирована");
        onSuccess();
        onClose();
      } else {
        message.error("Код неверный, попробуйте снова");
      }
    } catch (err) {
      console.error(err);
      message.error("Ошибка при подтверждении 2FA");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Двухфакторная аутентификация"
    >
      {step === "setup" && (
        <Form
          onFinish={(values) => handleSetup(values.password)}
          layout="vertical"
        >
          <Form.Item
            name="password"
            label="Введите пароль"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Сгенерировать QR-код
          </Button>
        </Form>
      )}

      {step === "confirm" && (
        <>
          {qrCode && (
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <img
                src={`${QR_CODE_API}?size=200x200&data=${encodeURIComponent(
                  qrCode
                )}`}
                alt="QR Code for 2FA setup"
              />
              <Text
                type="secondary"
                style={{ display: "block", marginTop: "0.5rem" }}
              >
                Секрет: {secret}
              </Text>
            </div>
          )}
          <Form
            onFinish={(values) => handleConfirm(values.code)}
            layout="vertical"
          >
            <Form.Item
              name="code"
              label="Введите 6-значный код"
              rules={[{ required: true, message: "Введите код из приложения" }]}
            >
              <Input maxLength={6} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Подтвердить
            </Button>
          </Form>
        </>
      )}
    </Modal>
  );
}
