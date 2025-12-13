import { useState, useEffect } from 'react';
import { Layout, Button, List, Typography, Empty, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './App.css';

import Sidebar from './components/Sidebar';
import TodoItem from './components/TodoItem';
import AddTodoModal from './components/AddTodoModal';
import AddCategoryModal from './components/AddCategoryModal';
import PomodoroView from './components/PomodoroView';
import SettingsModal from './components/SettingsModal';
import { generateMockData } from './mock/data';

// Helper for IPC
const getIpcRenderer = () => {
    if (window.ipcRenderer) return window.ipcRenderer;
    if (window.require) {
      try {
        return window.require('electron').ipcRenderer;
      } catch (e) {
        console.error('Electron IPC not available:', e);
      }
    }
    return { 
        send: (channel) => console.log(`IPC send: ${channel}`),
        invoke: (channel) => { console.log(`IPC invoke: ${channel}`); return Promise.resolve(null); }
    };
};
const ipcRenderer = getIpcRenderer();

const { Header, Content } = Layout;
const { Title } = Typography;

// Helper to find a node and its path in the tree
const findNode = (nodes, key) => {
  for (let node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNode(node.children, key);
      if (found) return found;
    }
  }
  return null;
};

// Helper to collect all descendant keys (including self)
const getDescendantKeys = (nodes, key) => {
  let keys = [];
  const node = findNode(nodes, key);
  if (node) {
    keys.push(node.key);
    if (node.children) {
      node.children.forEach(child => {
        keys = keys.concat(getDescendantKeys([child], child.key));
      });
    }
  }
  return keys;
};

function App() {
  const [todoItems, setTodoItems] = useState([]);
  // Initial structure with a Root node
  const [categories, setCategories] = useState([
    { key: 'root', title: '全部项目', children: [] }
  ]);
  const [currentCategory, setCurrentCategory] = useState('root');
  const [collapsed, setCollapsed] = useState(false);
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [activePomodoroItem, setActivePomodoroItem] = useState(null);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDeadline, setNewTodoDeadline] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Default settings
  const [settings, setSettings] = useState({
    pomodoro: {
      focusTime: 25,
      breakTime: 5
    }
  });
  
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const loadData = async () => {
        try {
            // Load from Electron Store via IPC
            let savedPanelState = await ipcRenderer.invoke('store-get', 'categoryPanelCollapsed');
            let savedSettings = await ipcRenderer.invoke('store-get', 'appSettings');
            let savedCategories = await ipcRenderer.invoke('store-get', 'categories');
            let savedTodos = await ipcRenderer.invoke('store-get', 'todos');

            // MIGRATION: Check LocalStorage if Store is empty
            if (!savedCategories && !savedTodos) {
                const lsCategories = localStorage.getItem('categories');
                const lsTodos = localStorage.getItem('todos');
                
                if (lsCategories || lsTodos) {
                    console.log('Migrating from LocalStorage to Electron Store...');
                    if (lsCategories) {
                        savedCategories = JSON.parse(lsCategories);
                        ipcRenderer.send('store-set', 'categories', savedCategories);
                    }
                    if (lsTodos) {
                        savedTodos = JSON.parse(lsTodos);
                        ipcRenderer.send('store-set', 'todos', savedTodos);
                    }
                    
                    const lsSettings = localStorage.getItem('appSettings');
                    if (lsSettings) {
                        savedSettings = JSON.parse(lsSettings);
                        ipcRenderer.send('store-set', 'appSettings', savedSettings);
                    }
                    
                    const lsPanel = localStorage.getItem('categoryPanelCollapsed');
                    if (lsPanel) {
                        savedPanelState = lsPanel === 'true';
                        ipcRenderer.send('store-set', 'categoryPanelCollapsed', savedPanelState);
                    }
                }
            }

            // Apply Data
            if (savedPanelState !== undefined && savedPanelState !== null) {
                setCollapsed(savedPanelState);
            }

            if (savedSettings && Object.keys(savedSettings).length > 0) {
                setSettings(prev => ({
                    ...prev,
                    ...savedSettings,
                    pomodoro: {
                        ...prev.pomodoro,
                        ...(savedSettings.pomodoro || {})
                    }
                }));
            }

            if (savedCategories && savedTodos) {
                // Legacy check for categories (if migration brought over old format)
                const isLegacy = Array.isArray(savedCategories) && savedCategories.length > 0 && typeof savedCategories[0] === 'string';
                
                // Empty Root Check: if it's just the default empty root and no todos
                const isEmptyRoot = Array.isArray(savedCategories) && savedCategories.length === 1 && savedCategories[0].key === 'root' && (!savedCategories[0].children || savedCategories[0].children.length === 0) && (!savedTodos || savedTodos.length === 0);

                if (isLegacy || isEmptyRoot) {
                    console.log('Legacy or Empty data detected, triggering Mock Data generation');
                    throw new Error('Legacy or Empty Format');
                }

                setCategories(savedCategories);
                setTodoItems(savedTodos.map(item => ({
                    ...item,
                    deadline: item.deadline ? new Date(item.deadline) : null
                })));
            } else {
                // Initialize with Mock Data
                const { categories: mockCats, todos: mockTodos } = generateMockData();
                setCategories(mockCats);
                setTodoItems(mockTodos.map(item => ({
                    ...item,
                    deadline: item.deadline ? new Date(item.deadline) : null
                })));
                ipcRenderer.send('store-set', 'categories', mockCats);
                ipcRenderer.send('store-set', 'todos', mockTodos);
            }

        } catch (e) {
            console.error('Data loading error or reset:', e);
            const { categories: mockCats, todos: mockTodos } = generateMockData();
            setCategories(mockCats);
            setTodoItems(mockTodos.map(item => ({
                ...item,
                deadline: item.deadline ? new Date(item.deadline) : null
            })));
        }
    };

    loadData();
  }, []);

  useEffect(() => {
    ipcRenderer.send('store-set', 'categoryPanelCollapsed', collapsed);
  }, [collapsed]);

  useEffect(() => {
    ipcRenderer.send('store-set', 'categories', categories);
  }, [categories]);

  useEffect(() => {
    ipcRenderer.send('store-set', 'todos', todoItems.map(item => ({
      ...item,
      deadline: item.deadline ? item.deadline.toISOString() : null
    })));
  }, [todoItems]);

  const handleAddTodo = () => {
    const todoText = newTodoText.trim();
    if (todoText === '') {
        messageApi.warning('请输入待办事项内容');
        return;
    }

    // Default to current category (or root if selected)
    // If user selected a node, we add todo to that node.
    // However, if the user thinks "Leaf nodes are todo items", maybe they want to add todo AS a node?
    // But our data model separates Categories (Tree) and Todos (List linked to Category).
    // We stick to this model for now as it's more robust for "content".
    const categoryId = currentCategory;

    const newTodo = {
      text: todoText,
      deadline: newTodoDeadline ? newTodoDeadline.toDate() : null,
      completed: false,
      id: Date.now(),
      categoryId: categoryId
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

  // Add sub-category to the currently selected node
  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (name === '') {
        messageApi.warning('请输入分类名称');
        return;
    }

    const newCategory = {
        key: Date.now().toString(),
        title: name,
        children: []
    };

    const addNode = (nodes, targetKey) => {
        return nodes.map(node => {
            if (node.key === targetKey) {
                return { ...node, children: [...(node.children || []), newCategory] };
            }
            if (node.children) {
                return { ...node, children: addNode(node.children, targetKey) };
            }
            return node;
        });
    };

    // If currentCategory is not found (shouldn't happen), add to root
    const updatedCategories = addNode(categories, currentCategory);
    setCategories(updatedCategories);

    setIsCategoryModalOpen(false);
    setNewCategoryName('');
    messageApi.success('子分类添加成功');
  };

  const handleDeleteCategory = (key) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除此分类及其所有子分类和待办吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
            const deleteNode = (nodes, targetKey) => {
                return nodes.filter(node => node.key !== targetKey).map(node => {
                    if (node.children) {
                        return { ...node, children: deleteNode(node.children, targetKey) };
                    }
                    return node;
                });
            };

            const updatedCategories = deleteNode(categories, key);
            setCategories(updatedCategories);
            
            // Also delete todos in this category and its subcategories?
            // Yes, let's find all descendant keys first
            // Wait, I can't find keys after deletion easily unless I search first.
            // But strict deletion of todos is good practice.
            // For now, let's just update categories. Orphaned todos won't show up if filtered by key.
            // Better: switch to root if deleted.
            if (currentCategory === key || getDescendantKeys(categories, key).includes(currentCategory)) {
                setCurrentCategory('root');
            }
            messageApi.success('分类删除成功');
        }
    });
  };

  // Save settings
  const handleSaveSettings = (newSettings) => {
    // Ensure numbers to prevent string/number mismatch issues
    if (newSettings.pomodoro) {
        if (newSettings.pomodoro.focusTime) newSettings.pomodoro.focusTime = Number(newSettings.pomodoro.focusTime);
        if (newSettings.pomodoro.breakTime) newSettings.pomodoro.breakTime = Number(newSettings.pomodoro.breakTime);
    }

    setSettings(prev => {
        const mergedSettings = {
            ...prev,
            ...newSettings,
            pomodoro: {
                ...prev.pomodoro,
                ...(newSettings.pomodoro || {})
            }
        };
        ipcRenderer.send('store-set', 'appSettings', mergedSettings);
        return mergedSettings;
    });
    messageApi.success('设置已保存');
  };

  // Update todo focus time
  const updateTodoFocusTime = (todoId, minutesToAdd) => {
    const updatedTodos = todoItems.map(item => {
      if (item.id === todoId) {
        return {
          ...item,
          totalFocusTime: (item.totalFocusTime || 0) + minutesToAdd
        };
      }
      return item;
    });
    setTodoItems(updatedTodos);
  };

  const handleStartPomodoro = (item) => {
    setActivePomodoroItem(item);
    setIsMiniMode(true);
    ipcRenderer.send('enter-mini-mode');
  };
  
  const handleClosePomodoro = () => {
      setIsMiniMode(false);
      setActivePomodoroItem(null);
      ipcRenderer.send('leave-mini-mode');
  };

  // Get current category title
  const currentCategoryNode = findNode(categories, currentCategory);
  const currentTitle = currentCategoryNode ? currentCategoryNode.title : '全部项目';

  // Filter todos: show todos in current category AND its subcategories?
  // Or just exact match?
  // "Work -> Project 1 -> Frontend -> Animation"
  // If I click "Work", do I want to see "Animation" tasks? Usually YES.
  const relevantCategoryKeys = getDescendantKeys(categories, currentCategory);
  
  const filteredTodos = todoItems
    .filter(item => relevantCategoryKeys.includes(item.categoryId))
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline - b.deadline;
    });

  if (isMiniMode) {
      return (
          <PomodoroView 
            todoItem={activePomodoroItem} 
            onClose={handleClosePomodoro} 
            settings={settings}
            onUpdateFocusTime={updateTodoFocusTime}
          />
      );
  }

  return (
    <Layout className="h-screen overflow-hidden rounded-xl bg-transparent shadow-2xl border border-gray-200/50">
      {contextHolder}
      
      <SettingsModal 
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
      
      <Sidebar 
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        categories={categories}
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
        handleDeleteCategory={handleDeleteCategory}
        setIsCategoryModalOpen={setIsCategoryModalOpen}
        openSettings={() => setIsSettingsModalOpen(true)}
      />
      
      <Layout className="bg-white">
        <Header className="bg-white px-6 border-b border-gray-200 flex items-center justify-between h-[64px]" style={{ WebkitAppRegion: 'drag' }}>
          <Title level={3} style={{ margin: 0 }}>
            {currentTitle}
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
                        handleStartPomodoro={handleStartPomodoro}
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
