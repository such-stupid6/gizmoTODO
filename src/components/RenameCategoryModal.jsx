import React, { useEffect, useRef } from 'react';
import { Modal, Input, Form } from 'antd';

const RenameCategoryModal = ({ 
    isModalOpen, 
    setIsModalOpen, 
    handleRename, 
    initialName 
}) => {
    const [form] = Form.useForm();
    const inputRef = useRef(null);

    useEffect(() => {
        if (isModalOpen) {
            form.setFieldsValue({ name: initialName });
            // Focus input after modal opens
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isModalOpen, initialName, form]);

    const onOk = () => {
        form.validateFields().then(values => {
            handleRename(values.name);
            setIsModalOpen(false);
            form.resetFields();
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const onCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    return (
        <Modal
            title="重命名分类"
            open={isModalOpen}
            onOk={onOk}
            onCancel={onCancel}
            okText="确定"
            cancelText="取消"
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    rules={[{ required: true, message: '请输入新的分类名称' }]}
                >
                    <Input 
                        ref={inputRef}
                        placeholder="分类名称" 
                        onPressEnter={onOk} 
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RenameCategoryModal;
