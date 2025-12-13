import { useState, useEffect } from 'react';
import { Layout, Button, List, Typography, Empty, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './App.css';

import Sidebar from './components/Sidebar';
import TodoItem from './components/TodoItem';
import AddTodoModal from './components/AddTodoModal';
import AddCategoryModal from './components/AddCategoryModal';

const { Header, Content } = Layout;
const { Title } = Typography;

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

  return (
    <Layout className="h-screen overflow-hidden rounded-xl bg-transparent shadow-2xl border border-gray-200/50">
      {contextHolder}
      
      <Sidebar 
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        categories={categories}
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
        handleDeleteCategory={handleDeleteCategory}
        setIsCategoryModalOpen={setIsCategoryModalOpen}
      />
      
      <Layout className="bg-white">
        <Header className="bg-white px-6 border-b border-gray-200 flex items-center justify-between h-[64px]" style={{ WebkitAppRegion: 'drag' }}>
          <Title level={3} style={{ margin: 0 }}>
            {currentCategory === 'all' ? '全部' : currentCategory}
          </Title>
          <div style={{ WebkitAppRegion: 'no-drag' }}>
            <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setIsTodoModalOpen(true)}
                className="bg-[#28a745] hover:!bg-[#218838]"
            >
                添加待办
            </Button>
          </div>
        </Header>
        
        <Content className="p-6 overflow-y-auto bg-gray-50">
          {filteredTodos.length === 0 ? (
            <Empty description="暂无待办事项" className="mt-12" />
          ) : (
            <List
              dataSource={filteredTodos}
              renderItem={item => (
                <List.Item className="p-0 border-0 mb-3">
                    <TodoItem 
                        item={item} 
                        toggleTodoCompletion={toggleTodoCompletion} 
                        handleDeleteTodo={handleDeleteTodo} 
                    />
                </List.Item>
              )}
            />
          )}
        </Content>
      </Layout>

      <AddTodoModal 
        isTodoModalOpen={isTodoModalOpen}
        setIsTodoModalOpen={setIsTodoModalOpen}
        handleAddTodo={handleAddTodo}
        newTodoText={newTodoText}
        setNewTodoText={setNewTodoText}
        newTodoDeadline={newTodoDeadline}
        setNewTodoDeadline={setNewTodoDeadline}
      />

      <AddCategoryModal 
        isCategoryModalOpen={isCategoryModalOpen}
        setIsCategoryModalOpen={setIsCategoryModalOpen}
        handleAddCategory={handleAddCategory}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
      />
    </Layout>
  );
}

export default App;
