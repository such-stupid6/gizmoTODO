import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, Tabs } from 'antd';
import { SettingOutlined, ClockCircleOutlined } from '@ant-design/icons';

const SettingsModal = ({ open, onClose, settings, onSave }) => {
  const [form] = Form.useForm();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.setFieldsValue(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]); // Only reset when modal opens, ignore settings changes while open to prevent overwriting user input

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSave(values);
        onClose();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const items = [
    {
      key: '1',
      label: (
        <span>
          <ClockCircleOutlined />
          番茄钟设置
        </span>
      ),
      children: (
        <div className="pt-4">
          <Form.Item
            name={['pomodoro', 'focusTime']}
            label="专注时长 (分钟)"
            rules={[{ required: true, message: '请输入专注时长' }]}
            initialValue={25}
          >
            <InputNumber min={1} max={120} className="w-full" />
          </Form.Item>
          <Form.Item
            name={['pomodoro', 'breakTime']}
            label="休息时长 (分钟)"
            rules={[{ required: true, message: '请输入休息时长' }]}
            initialValue={5}
          >
            <InputNumber min={1} max={60} className="w-full" />
          </Form.Item>
        </div>
      ),
    },
    // Future settings can be added here as new tabs
  ];

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <SettingOutlined />
          <span>全局设置</span>
        </div>
      }
      okText="保存"
      cancelText="取消"
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Tabs defaultActiveKey="1" items={items} />
      </Form>
    </Modal>
  );
};

export default SettingsModal;
