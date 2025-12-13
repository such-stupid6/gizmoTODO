// Generate Mock Data
export const generateMockData = () => {
    const categories = [
      {
        key: 'root',
        title: '全部项目',
        children: [
          {
            key: 'work',
            title: '工作',
            children: [
              {
                key: 'project1',
                title: '项目1',
                children: [
                  {
                    key: 'frontend',
                    title: '前端优化',
                    children: [
                        { key: 'animation', title: '动图修改', children: [] }
                    ]
                  }
                ]
              }
            ]
          },
          {
            key: 'personal',
            title: '个人',
            children: []
          }
        ]
      }
    ];
  
    const todos = [
      {
        id: 1700000000001,
        text: '修复动图卡顿问题',
        completed: false,
        deadline: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days later
        categoryId: 'animation'
      },
      {
        id: 1700000000002,
        text: '重构侧边栏组件',
        completed: true,
        deadline: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        categoryId: 'frontend'
      },
      {
        id: 1700000000003,
        text: '周报撰写',
        completed: false,
        deadline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        categoryId: 'work'
      }
    ];
  
    return { categories, todos };
  };
