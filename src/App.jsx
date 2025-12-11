import { useState, useEffect } from 'react';
import { Layout, Menu, Button, List, Modal, Input, DatePicker, Typography, Tag, Empty, Card, Checkbox, message } from 'antd';
import { 
  PlusOutlined, 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  DeleteOutlined, 
  CalendarOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const [todoItems, setTodoItems] = useState([]);
  const [categories, setCategories] = useState(['个人', '工作', '学习']);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [collapsed, setCollapsed] = useState(false);
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDeadline, setNewTodoDeadline] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    // Load state from local storage
    const savedPanelState = localStorage.getItem('categoryPanelCollapsed') === 'true';
    setCollapsed(savedPanelState);

    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      try {
        const loadedCategories = JSON.parse(savedCategories);
        if (Array.isArray(loadedCategories) && loadedCategories.length > 0) {
          setCategories(loadedCategories);
        }
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    }

    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos).map(item => ({
          ...item,
          deadline: item.deadline ? new Date(item.deadline) : null,
        }));
        setTodoItems(parsedTodos);
      } catch (e) {
        console.error('Failed to load todos:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('categoryPanelCollapsed', collapsed);
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todoItems.map(item => ({
      ...item,
      deadline: item.deadline ? item.deadline.toISOString() : null
    }))));
  }, [todoItems]);

  const formatDeadline = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const dateStr = dayjs(date).format('MM月DD日 HH:mm');

    if (diffDays === 0) {
      return `${dateStr} (今天)`;
    } else if (diffDays === 1) {
      return `${dateStr} (明天)`;
    } else if (diffDays > 1 && diffDays < 7) {
      return `${dateStr} (${diffDays}天后)`;
    }
    return dateStr;
  };

  const getUrgencyTag = (deadline, completed) => {
    if (completed || !deadline) return null;

    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffTime < 0) return <Tag color="error">已过期</Tag>;
    if (diffDays < 1) return <Tag color="warning">紧急</Tag>;
    if (diffDays < 3) return <Tag color="gold">即将到期</Tag>;
    return null;
  };
  
  const getCardStyle = (deadline, completed) => {
      if (completed) return { opacity: 0.6, background: '#f5f5f5' };
      if (!deadline) return {};
      
      const now = new Date();
      const diffTime = deadline - now;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffTime < 0) return { borderLeft: '5px solid #ff4d4f' };
      if (diffDays < 1) return { borderLeft: '5px solid #fa8c16' };
      if (diffDays < 3) return { borderLeft: '5px solid #faad14' };
      return { borderLeft: '5px solid #d9d9d9' };
  };

  const handleAddTodo = () => {
    const todoText = newTodoText.trim();
    if (todoText === '') {
        messageApi.warning('请输入待办事项内容');
        return;
    }

    let category = currentCategory;
    if (currentCategory === 'all') {
      category = categories.length > 0 ? categories[0] : '未分类';
    }

    const newTodo = {
      text: todoText,
      deadline: newTodoDeadline ? newTodoDeadline.toDate() : null,
      completed: false,
      id: Date.now(),
      category: category
    };

    setTodoItems([...todoItems, newTodo]);
    setIsTodoModalOpen(false);
    setNewTodoText('');
    setNewTodoDeadline(null);
    messageApi.success('添加成功');
  };

  const handleDeleteTodo = (id) => {
    Modal.confirm({
        title: '确认删除',
        content: '确定要删除这个待办事项吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
            setTodoItems(todoItems.filter(item => item.id !== id));
            messageApi.success('删除成功');
        }
    });
  };

  const toggleTodoCompletion = (id) => {
    setTodoItems(todoItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (name === '') {
        messageApi.warning('请输入分类名称');
        return;
    }
    if (categories.includes(name)) {
        messageApi.warning('该分类已存在');
        return;
    }

    setCategories([...categories, name]);
    if (categories.length === 0) {
        setCurrentCategory(name);
    }
    setIsCategoryModalOpen(false);
    setNewCategoryName('');
    messageApi.success('分类添加成功');
  };

  const handleDeleteCategory = (category, e) => {
    e.stopPropagation();
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除分类"${category}"吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
            setCategories(categories.filter(c => c !== category));
            if (currentCategory === category) {
                setCurrentCategory('all');
            }
            messageApi.success('分类删除成功');
        }
    });
  };

  const filteredTodos = todoItems
    .filter(item => currentCategory === 'all' || item.category === currentCategory)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline - b.deadline;
    });

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

  const handleMinimize = () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('window-minimize');
    }
  };

  const handleMaximize = () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('window-maximize');
    }
  };

  const handleClose = () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('window-close');
    }
  };

  return (
    <Layout className="h-screen overflow-hidden rounded-xl bg-transparent shadow-2xl border border-gray-200/50">
      {contextHolder}
      
      {/* 顶部可拖拽区域 & macOS 风格红绿灯 */}
      <div className="fixed top-0 left-0 w-full h-[38px] z-50 flex items-center px-4" style={{ WebkitAppRegion: 'drag' }}>
        <div className="flex gap-2 group" style={{ WebkitAppRegion: 'no-drag' }}>
          {/* Close Button - Red */}
          <div 
            onClick={handleClose}
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center cursor-pointer hover:bg-[#ff5f56]/80 active:bg-[#bf403a] transition-colors"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#4d0000] leading-none mt-[1px]">✕</span>
          </div>
          {/* Minimize Button - Yellow */}
          <div 
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center cursor-pointer hover:bg-[#ffbd2e]/80 active:bg-[#bf8e22] transition-colors"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#594208] leading-none mt-[-2px]">−</span>
          </div>
          {/* Maximize Button - Green */}
          <div 
            onClick={handleMaximize}
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center cursor-pointer hover:bg-[#27c93f]/80 active:bg-[#1d8a2b] transition-colors"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[6px] font-bold text-[#0a4010] leading-none mt-[1px]">sw</span>
          </div>
        </div>
      </div>
      
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="light"
        width={250}
        className="border-r border-gray-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
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
      
      <Layout className="bg-white">
        <Header className="bg-white px-6 border-b border-gray-200 flex items-center justify-between h-[64px]">
          <Title level={3} style={{ margin: 0 }}>
            {currentCategory === 'all' ? '全部' : currentCategory}
          </Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsTodoModalOpen(true)}
            className="bg-[#28a745] hover:!bg-[#218838]"
          >
            添加待办
          </Button>
        </Header>
        
        <Content className="p-6 overflow-y-auto bg-gray-50">
          {filteredTodos.length === 0 ? (
            <Empty description="暂无待办事项" className="mt-12" />
          ) : (
            <List
              dataSource={filteredTodos}
              renderItem={item => (
                <List.Item className="p-0 border-0 mb-3">
                    <Card 
                        hoverable
                        bodyStyle={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        className="w-full"
                        style={getCardStyle(item.deadline, item.completed)}
                        onClick={() => toggleTodoCompletion(item.id)}
                    >
                        <div className="flex items-center flex-1">
                            <Checkbox 
                                checked={item.completed} 
                                onChange={() => toggleTodoCompletion(item.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="mr-3"
                            />
                            <div className={`flex flex-col ${item.completed ? 'line-through text-gray-400' : ''}`}>
                                <Text delete={item.completed} strong={!item.completed} className="text-base">
                                    {item.text}
                                </Text>
                                {item.deadline && (
                                    <div className="flex items-center mt-1 text-xs text-gray-500">
                                        <CalendarOutlined className="mr-1" />
                                        {formatDeadline(item.deadline)}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {getUrgencyTag(item.deadline, item.completed)}
                            <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTodo(item.id);
                                }}
                            />
                        </div>
                    </Card>
                </List.Item>
              )}
            />
          )}
        </Content>
      </Layout>

      {/* Add Todo Modal */}
      <Modal
        title="添加新待办事项"
        open={isTodoModalOpen}
        onOk={handleAddTodo}
        onCancel={() => setIsTodoModalOpen(false)}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ className: 'bg-[#28a745] hover:!bg-[#218838]' }}
      >
        <div className="flex flex-col gap-4 py-4">
            <div>
                <div className="mb-2 font-bold">待办事项:</div>
                <Input 
                    placeholder="输入待办事项内容..." 
                    value={newTodoText} 
                    onChange={e => setNewTodoText(e.target.value)}
                    onPressEnter={handleAddTodo}
                />
            </div>
            <div>
                <div className="mb-2 font-bold">截止日期:</div>
                <DatePicker 
                    showTime 
                    className="w-full" 
                    placeholder="选择截止日期和时间"
                    value={newTodoDeadline}
                    onChange={date => setNewTodoDeadline(date)}
                    format="YYYY-MM-DD HH:mm"
                />
            </div>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        title="添加新分类"
        open={isCategoryModalOpen}
        onOk={handleAddCategory}
        onCancel={() => setIsCategoryModalOpen(false)}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ className: 'bg-[#28a745] hover:!bg-[#218838]' }}
      >
        <div className="flex flex-col gap-4 py-4">
            <div>
                <div className="mb-2 font-bold">分类名称:</div>
                <Input 
                    placeholder="输入分类名称..." 
                    value={newCategoryName} 
                    onChange={e => setNewCategoryName(e.target.value)}
                    onPressEnter={handleAddCategory}
                />
            </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default App;
