import React, { useState } from 'react';
import { Card, Checkbox, Button, Typography, Tag } from 'antd';
import { DeleteOutlined, CalendarOutlined, PlayCircleOutlined, FieldTimeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const TodoItem = ({ item, toggleTodoCompletion, handleDeleteTodo, handleStartPomodoro }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = (e) => {
    e?.stopPropagation();
    
    // If already completed or currently animating, just toggle immediately (or ignore if animating?)
    // If checking (false -> true), we animate first.
    if (!item.completed && !isAnimating) {
        setIsAnimating(true);
        // Wait for animation (500ms) before actual toggle
        setTimeout(() => {
            toggleTodoCompletion(item.id);
            setIsAnimating(false);
        }, 600);
    } else {
        // Unchecking or already animating - toggle immediately
        toggleTodoCompletion(item.id);
        setIsAnimating(false);
    }
  };

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
      if (completed) return {};
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
        className={`w-full transition-all duration-300 ${item.completed ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
        style={getCardStyle(item.deadline, item.completed)}
        onClick={handleToggle}
    >
        <div className="flex items-center flex-1 gap-4">
            <Checkbox 
                checked={item.completed || isAnimating} 
                onChange={handleToggle}
                onClick={(e) => e.stopPropagation()}
            />
            <div className={`flex flex-col transition-opacity duration-300 ${item.completed ? 'opacity-50' : 'opacity-100'}`}>
                <div className="relative inline-block w-fit">
                    <Text strong={!item.completed && !isAnimating} className="text-base">
                        {item.text}
                    </Text>
                    <span 
                        className={`absolute left-0 top-1/2 h-[2px] bg-gray-600 transition-all duration-500 ease-out`}
                        style={{ 
                            width: (item.completed || isAnimating) ? '100%' : '0%',
                            transform: 'translateY(-50%)'
                        }}
                    />
                </div>
                {item.deadline && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                        <CalendarOutlined className="mr-1" />
                        {formatDeadline(item.deadline)}
                    </div>
                )}
                {item.totalFocusTime > 0 && (
                    <div className="flex items-center mt-1 text-xs text-blue-500">
                        <FieldTimeOutlined className="mr-1" />
                        已专注: {item.totalFocusTime} 分钟
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
