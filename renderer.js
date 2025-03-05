// DOM 元素引用
const addTodoButton = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');
const categoryList = document.getElementById('categoryList');
const addCategoryButton = document.getElementById('addCategory');
const currentCategoryTitle = document.getElementById('currentCategory');

// 数据存储
let todoItems = [];
let categories = ['个人', '工作', '学习']; // 默认分类
let currentCategory = 'all'; // 当前选中的分类

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    const togglePanel = document.getElementById('togglePanel');
    const categoriesPanel = document.getElementById('categoriesPanel');
    const contentPanel = document.querySelector('.content-panel');

    // 从本地存储加载面板状态
    const isPanelCollapsed = localStorage.getItem('categoryPanelCollapsed') === 'true';
    
    // 初始化面板状态
    if (isPanelCollapsed) {
        categoriesPanel.classList.add('collapsed');
        togglePanel.classList.add('collapsed');
    }
    
    // 添加切换事件
    togglePanel.addEventListener('click', function() {
        const isCollapsed = categoriesPanel.classList.toggle('collapsed');
        togglePanel.classList.toggle('collapsed');
        
        // 保存状态到本地存储
        localStorage.setItem('categoryPanelCollapsed', isCollapsed);
    });

    // 加载保存的分类
    loadCategories();
    
    // 加载保存的待办事项
    loadTodos();
    
    // 渲染分类列表
    renderCategories();

    // 确保渲染待办事项
    renderFilteredTodos();
    
    // 使用事件委托处理待办事项点击
    todoList.addEventListener('click', function(e) {
        const li = e.target.closest('li');
        if (!li) return;
        
        const id = li.dataset.id;
        const todoItem = todoItems.find(item => item.id == id);
        
        if (todoItem) {
            todoItem.completed = !todoItem.completed;
            li.classList.toggle('completed');
            saveTodos();
        }
    });
    
    // 使用事件委托处理分类点击
    categoryList.addEventListener('click', function(e) {
        const li = e.target.closest('li');
        if (!li) return;
        
        // 更新当前选中的分类
        currentCategory = li.dataset.category;
        
        // 更新UI选中状态
        document.querySelectorAll('#categoryList li').forEach(item => {
            item.classList.remove('active');
        });
        li.classList.add('active');
        
        // 更新标题
        currentCategoryTitle.textContent = currentCategory === 'all' ? '全部' : currentCategory;
        
        // 重新渲染待办事项列表
        renderFilteredTodos();
    });
    
    // 添加分类按钮点击事件
    addCategoryButton.addEventListener('click', showCategoryDialog);
});

// 显示添加待办事项对话框
addTodoButton.addEventListener('click', showInputDialog);

// 显示添加分类对话框
function showCategoryDialog() {
    const dialog = document.getElementById('categoryDialog');
    const categoryInput = document.getElementById('categoryInput');
    
    // 重置输入框
    categoryInput.value = '';
    
    // 显示对话框
    dialog.showModal();
    
    // 设置事件处理
    document.getElementById('cancelCategoryButton').onclick = () => dialog.close();
    document.getElementById('confirmCategoryButton').onclick = () => {
        addCategory(categoryInput.value);
        dialog.close();
    };
}

// 添加新分类
function addCategory(name) {
    name = name.trim();
    if (name === '' || categories.includes(name)) return;
    
    categories.push(name);
    saveCategories();
    renderCategories();
    
    // 如果是添加的第一个自定义分类，自动选中它
    if (categories.length === 1) {
        currentCategory = name;
        currentCategoryTitle.textContent = name;
        renderFilteredTodos();
    }
}

// 渲染分类列表
function renderCategories() {
    // 保留"全部"选项
    categoryList.innerHTML = `
        <li class="category ${currentCategory === 'all' ? 'active' : ''}" data-category="all">全部</li>
    `;
    
    // 添加自定义分类
    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category;
        li.classList.add('category');
        li.dataset.category = category;
        
        if (currentCategory === category) {
            li.classList.add('active');
        }
        
        // 添加删除按钮
        const deleteBtn = document.createElement('span');
        deleteBtn.textContent = '×';
        deleteBtn.classList.add('delete-category');
        deleteBtn.onclick = (e) => {
            e.stopPropagation(); // 阻止冒泡，避免触发分类选择
            if (confirm(`确定要删除分类"${category}"吗？`)) {
                deleteCategory(category);
            }
        };
        
        li.appendChild(deleteBtn);
        categoryList.appendChild(li);
    });
    
    // 更新添加待办事项对话框中的分类选择器
    updateCategorySelect();
}

// 删除分类
function deleteCategory(category) {
    const index = categories.indexOf(category);
    if (index !== -1) {
        categories.splice(index, 1);
        saveCategories();
        
        // 如果删除的是当前选中的分类，则切换到"全部"
        if (currentCategory === category) {
            currentCategory = 'all';
            currentCategoryTitle.textContent = '全部';
        }
        
        // 重新渲染分类和待办事项
        renderCategories();
        renderFilteredTodos();
    }
}

// 更新添加待办事项对话框中的分类选择器
function updateCategorySelect() {
    const select = document.getElementById('todoCategory');
    if (!select) return;
    
    select.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// 显示添加待办事项对话框
function showInputDialog() {
    const dialog = document.getElementById('dialog');
    const todoInput = document.getElementById('todoInput');
    const deadlineInput = document.getElementById('deadLine');
    const categorySelect = document.getElementById('todoCategory');
    
    // 重置输入框内容
    todoInput.value = '';
    deadlineInput.value = '';
    
    // 自动设置当前选中的分类
    if (currentCategory !== 'all' && categories.includes(currentCategory)) {
        // 当前选中的是具体分类，直接使用
        categorySelect.value = currentCategory;
    } else if (currentCategory === 'all' && categories.length > 0) {
        // 当前选中的是"全部"，使用第一个可用分类作为默认值
        categorySelect.value = categories[0];
    }
    
    // 显示对话框
    dialog.showModal();
    
    // 事件处理
    document.getElementById('cancelButton').onclick = () => dialog.close();
    document.getElementById('confirmButton').onclick = () => {
        addTodo(todoInput, deadlineInput, categorySelect);
        dialog.close();
    };
}

// 添加待办事项
function addTodo(todoInput, deadlineInput, categorySelect) {
    const todoText = todoInput.value.trim();
    if (todoText === '') return;
    
    const deadlineValue = deadlineInput.value;
    let deadlineDate = null;
    let deadlineText = '';
    
    if (deadlineValue) {
        deadlineDate = new Date(deadlineValue);
        deadlineText = formatDeadline(deadlineDate);
    }
    
    // 获取分类 - 优先使用当前分类，如果当前是"全部"则使用选择器中的值
    let category;
    if (currentCategory !== 'all' && categories.includes(currentCategory)) {
        category = currentCategory;
    } else {
        category = categorySelect.value;
    }
    
    // 创建待办事项对象
    const todoItem = {
        text: todoText,
        deadline: deadlineDate,
        deadlineText: deadlineText,
        completed: false,
        id: Date.now(),
        category: category
    };
    
    // 添加到数组
    todoItems.push(todoItem);
    
    // 保存并重新渲染
    saveTodos();
    renderFilteredTodos();
}

function createTodoElement(todoItem) {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    li.dataset.id = todoItem.id;
    
    // 添加可点击的视觉提示样式
    li.classList.add('clickable');
    
    // 创建待办事项容器，用于放置待办文本和日期
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('todo-content');
    
    // 添加待办事项文本
    const textSpan = document.createElement('span');
    textSpan.textContent = todoItem.text;
    contentDiv.appendChild(textSpan);
    
    // 如果有截止日期，添加日期元素并设置紧急度样式
    if (todoItem.deadlineText) {
        const dateSpan = document.createElement('span');
        dateSpan.textContent = todoItem.deadlineText;
        dateSpan.classList.add('deadline-text');
        contentDiv.appendChild(dateSpan);
        
        // 添加颜色标记表示紧急程度
        const urgency = getUrgencyClass(todoItem.deadline);
        li.classList.add(urgency);
    }
    
    // 添加内容区域到列表项
    li.appendChild(contentDiv);
    
    // 添加操作按钮区域
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('todo-actions');
    
    // 添加删除按钮
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '×'; // 使用 × 作为删除图标
    deleteButton.classList.add('delete-button');
    deleteButton.title = '删除';
    deleteButton.onclick = function(e) {
        e.stopPropagation(); // 阻止事件冒泡
        if (confirm('确定要删除这个待办事项吗？')) {
            deleteTodo(todoItem.id);
        }
    };
    
    // 将删除按钮添加到操作区域
    actionsDiv.appendChild(deleteButton);
    
    // 将操作区域添加到列表项
    li.appendChild(actionsDiv);
    
    // 设置完成状态
    if (todoItem.completed) {
        li.classList.add('completed');
    }
    
    return li;
}

// 删除待办事项
function deleteTodo(id) {
    // 从数组中删除对应id的待办事项
    const index = todoItems.findIndex(item => item.id == id);
    if (index !== -1) {
        todoItems.splice(index, 1);
        
        // 保存并重新渲染
        saveTodos();
        renderFilteredTodos();
    }
}

// 格式化截止日期
function formatDeadline(date) {
    // 获取当前日期
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 格式化日期
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    let dateStr = `${month}月${day}日 ${hours}:${minutes}`;
    
    // 添加相对时间信息
    if (diffDays === 0) {
        dateStr += ' (今天)';
    } else if (diffDays === 1) {
        dateStr += ' (明天)';
    } else if (diffDays > 1 && diffDays < 7) {
        dateStr += ` (${diffDays}天后)`;
    }
    
    return dateStr;
}

// 获取紧急程度样式类
function getUrgencyClass(deadline) {
    if (!deadline) return '';
    
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffTime < 0) return 'overdue'; // 已过期
    if (diffDays < 1) return 'urgent';  // 不到1天
    if (diffDays < 3) return 'soon';    // 不到3天
    return 'normal';                    // 3天以上
}

function sortAndRenderTodos() {
    console.time('排序渲染'); // 添加性能计时器
    
    // 根据截止日期排序
    todoItems.sort((a, b) => {
        // 已完成的排在最后
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        
        // 没有截止日期的放在后面
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        
        // 按日期升序排序
        return a.deadline - b.deadline;
    });
    
    // 清空列表
    todoList.innerHTML = '';
    
    // 创建文档片段，减少DOM重绘
    const fragment = document.createDocumentFragment();
    
    // 重新添加排序后的元素
    for (const todoItem of todoItems) {
        const li = createTodoElement(todoItem);
        fragment.appendChild(li);
    }
    
    // 一次性添加所有元素到DOM
    todoList.appendChild(fragment);
    
    console.timeEnd('排序渲染'); // 结束性能计时器
}

// 保存到本地存储
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todoItems.map(item => ({
        text: item.text,
        deadline: item.deadline ? item.deadline.toISOString() : null,
        completed: item.completed,
        id: item.id,
        category: item.category
    }))));
}

// 加载待办事项
function loadTodos() {
    const saved = localStorage.getItem('todos');
    if (saved) {
        try {
            todoItems = JSON.parse(saved).map(item => ({
                text: item.text,
                deadline: item.deadline ? new Date(item.deadline) : null,
                deadlineText: item.deadline ? formatDeadline(new Date(item.deadline)) : '',
                completed: item.completed,
                id: item.id || Date.now(),
                category: item.category || (categories.length > 0 ? categories[0] : '未分类')
            }));
            // 加载后立即渲染
            renderFilteredTodos();
        } catch (e) {
            console.error('加载待办事项失败:', e);
            todoItems = [];
        }
    }
    // 即使没有待办事项也需要渲染（显示空状态）
    renderFilteredTodos();
}

// 保存分类
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// 加载分类
function loadCategories() {
    const saved = localStorage.getItem('categories');
    if (saved) {
        try {
            const loadedCategories = JSON.parse(saved);
            if (Array.isArray(loadedCategories) && loadedCategories.length > 0) {
                categories = loadedCategories;
            }
        } catch (e) {
            console.error('加载分类失败:', e);
        }
    }
}

// 添加清除全部功能（可选添加到界面）
function clearAllTodos() {
    if (confirm('确定要清除所有待办事项吗？')) {
        todoItems = [];
        localStorage.removeItem('todos');
        todoList.innerHTML = '';
    }
}

// 根据当前选择的分类筛选并渲染待办事项
function renderFilteredTodos() {
    // 筛选待办事项
    let filteredItems = todoItems;
    if (currentCategory !== 'all') {
        filteredItems = todoItems.filter(item => item.category === currentCategory);
    }
    
    // 排序
    filteredItems.sort((a, b) => {
        // 已完成的排在最后
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        
        // 没有截止日期的放在后面
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        
        // 按日期升序排序
        return a.deadline - b.deadline;
    });
    
    // 渲染
    todoList.innerHTML = '';
    
    if (filteredItems.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = '暂无待办事项';
        todoList.appendChild(emptyMessage);
        return;
    }
    
    const fragment = document.createDocumentFragment();
    filteredItems.forEach(todoItem => {
        const li = createTodoElement(todoItem);
        fragment.appendChild(li);
    });
    
    todoList.appendChild(fragment);
}