import React from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  AppstoreOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import TrafficLights from './TrafficLights';

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar = ({ 
  collapsed, 
  setCollapsed, 
  categories, 
  currentCategory, 
  setCurrentCategory, 
  handleDeleteCategory, 
  setIsCategoryModalOpen 
}) => {
  const menuItems = [
    {
      key: 'all',
      icon: <AppstoreOutlined />,
      label: '全部',
    },
    ...categories.map(cat => ({
      key: cat,
      label: (
        <div className="flex justify-between items-center group w-full">
          <span>{cat}</span>
          <Button 
            type="text" 
            size="small" 
            danger
            icon={<DeleteOutlined />} 
            className="opacity-0 group-hover:opacity-100"
            onClick={(e) => handleDeleteCategory(cat, e)}
          />
        </div>
      ),
    })),
    {
        key: 'add_new_category_btn',
        label: <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setIsCategoryModalOpen(true)}>添加分类</Button>,
        disabled: true,
        className: "!cursor-default !bg-transparent hover:!bg-transparent !p-0 !h-auto !mb-0"
    }
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed} 
      theme="light"
      width={250}
      className="border-r border-gray-200 bg-gray-50/50"
    >
      <TrafficLights />

      <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100">
        {!collapsed && <Title level={4} style={{ margin: 0 }}>分类</Title>}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        />
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[currentCategory]}
        items={menuItems}
        onClick={({ key }) => {
            if (key !== 'add_new_category_btn') {
                setCurrentCategory(key);
            }
        }}
        className="border-none"
        style={{ height: 'calc(100% - 65px)', overflowY: 'auto' }}
      />
    </Sider>
  );
};

export default Sidebar;
