import React from 'react';
import { Modal, Input, DatePicker } from 'antd';

const AddTodoModal = ({ 
  isTodoModalOpen, 
  setIsTodoModalOpen, 
  handleAddTodo, 
  newTodoText, 
  setNewTodoText, 
  newTodoDeadline, 
  setNewTodoDeadline 
}) => {
  return (
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
  );
};

export default AddTodoModal;
