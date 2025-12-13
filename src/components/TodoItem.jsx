import React from 'react';
import { Card, Checkbox, Button, Typography, Tag } from 'antd';
import { DeleteOutlined, CalendarOutlined, PlayCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const TodoItem = ({ item, toggleTodoCompletion, handleDeleteTodo, handleStartPomodoro }) => {
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

  return (
    <Card 
        hoverable
        bodyStyle={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        className="w-full"
        style={getCardStyle(item.deadline, item.completed)}
        onClick={() => toggleTodoCompletion(item.id)}
    >
        <div className="flex items-center flex-1 gap-4">
            <Checkbox 
                checked={item.completed} 
                onChange={() => toggleTodoCompletion(item.id)}
                onClick={(e) => e.stopPropagation()}
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
            {!item.completed && (
                <Button 
                    type="text" 
                    icon={<PlayCircleOutlined />} 
                    className="text-gray-400 hover:text-blue-500 flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStartPomodoro(item);
                    }}
                />
            )}
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
  );
};

export default TodoItem;
