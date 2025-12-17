import React from 'react';
import { Layout, Tree, Button, Typography, Tooltip, Dropdown } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  DeleteOutlined,
  PlusOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  SettingOutlined,
  EditOutlined
} from '@ant-design/icons';
import TrafficLights from './TrafficLights';

const { Sider } = Layout;
const { Title } = Typography;
const { DirectoryTree } = Tree;

const Sidebar = ({ 
  collapsed, 
  setCollapsed, 
  categories, 
  currentCategory, 
  setCurrentCategory, 
  handleDeleteCategory, 
  setIsCategoryModalOpen,
  openSettings,
  onRenameCategory
}) => {
  
  const renderTitle = (node) => {
    const isRoot = node.key === 'root';
    const isSelected = currentCategory === node.key;
    
    const items = [
      {
        key: 'add',
        label: '添加子分类',
        icon: <PlusOutlined />,
        onClick: () => {
          setCurrentCategory(node.key);
          setIsCategoryModalOpen(true);
        }
      },
      !isRoot && {
        key: 'rename',
        label: '重命名',
        icon: <EditOutlined />,
        onClick: () => onRenameCategory(node)
      },
      !isRoot && {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteCategory(node.key)
      }
    ].filter(Boolean);

    return (
      <Dropdown menu={{ items }} trigger={['contextMenu']}>
        <div className="flex items-center group w-full pr-2 overflow-hidden">
          <span className={`mr-2 shrink-0 flex items-center ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
              {isRoot ? <AppstoreOutlined /> : <FolderOutlined />}
          </span>
          <span 
            className={`truncate flex-1 transition-colors ${isSelected ? 'font-bold text-gray-950' : 'text-gray-900'}`} 
            title={node.title}
          >
            {node.title}
          </span>
        </div>
      </Dropdown>
    );
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed} 
      theme="light"
      width={250}
      className="border-r border-gray-200 bg-white"
    >
      <div className="h-full flex flex-col">
        <TrafficLights />

        <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100 shrink-0">
        {!collapsed && <Title level={4} style={{ margin: 0 }}>分类</Title>}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        <Tree
            blockNode
            showIcon={false}
            defaultExpandAll
            selectedKeys={[currentCategory]}
            onSelect={(keys) => {
                if (keys.length > 0) {
                    setCurrentCategory(keys[0]);
                }
            }}
            treeData={categories}
            titleRender={renderTitle}
            className="bg-transparent"
        />
      </div>

      <div className="p-4 border-t border-gray-100 shrink-0">
        <Button 
            type="text" 
            icon={<SettingOutlined />} 
            className="w-full flex items-center justify-start text-gray-500 hover:text-gray-800"
            onClick={openSettings}
        >
            {!collapsed && "设置"}
        </Button>
      </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
