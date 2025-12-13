import React from 'react';
import { Layout, Tree, Button, Typography, Tooltip } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  DeleteOutlined,
  PlusOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  SettingOutlined
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
  openSettings
}) => {
  
  const renderTitle = (node) => {
    const isRoot = node.key === 'root';
    return (
      <div className="flex items-center group w-full pr-2 overflow-hidden">
        <span className="mr-2 text-gray-500 shrink-0 flex items-center">
            {isRoot ? <AppstoreOutlined /> : <FolderOutlined />}
        </span>
        <span className="truncate flex-1" title={node.title}>{node.title}</span>
        {!isRoot && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                 {/* Add Subcategory Button - actually just opens modal, assumes current category is selected? 
                     We should probably select it when clicking this if it's not selected.
                     But to avoid conflict, let's just use the global Add button context. 
                     Wait, if I click + here, I expect to add to THIS node.
                     So I should update currentCategory to this node.
                 */}
                <Tooltip title="添加子分类">
                    <Button 
                        type="text" 
                        size="small" 
                        icon={<PlusOutlined />} 
                        className="!w-5 !h-5 !min-w-0 flex items-center justify-center text-gray-500 hover:text-green-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentCategory(node.key);
                            setIsCategoryModalOpen(true);
                        }}
                    />
                </Tooltip>
                <Tooltip title="删除">
                    <Button 
                        type="text" 
                        size="small" 
                        danger
                        icon={<DeleteOutlined />} 
                        className="!w-5 !h-5 !min-w-0 flex items-center justify-center"
                        onClick={(e) => handleDeleteCategory(node.key, e)}
                    />
                </Tooltip>
            </div>
        )}
        {isRoot && (
             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip title="添加子分类">
                    <Button 
                        type="text" 
                        size="small" 
                        icon={<PlusOutlined />} 
                        className="!w-5 !h-5 !min-w-0 flex items-center justify-center text-gray-500 hover:text-green-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentCategory(node.key);
                            setIsCategoryModalOpen(true);
                        }}
                    />
                </Tooltip>
             </div>
        )}
      </div>
    );
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed} 
      theme="light"
      width={250}
      className="border-r border-gray-200 bg-gray-50/50"
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
