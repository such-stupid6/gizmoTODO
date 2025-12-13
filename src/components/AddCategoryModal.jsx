import React from 'react';
import { Modal, Input } from 'antd';

const AddCategoryModal = ({ 
  isCategoryModalOpen, 
  setIsCategoryModalOpen, 
  handleAddCategory, 
  newCategoryName, 
  setNewCategoryName 
}) => {
  return (
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
  );
};

export default AddCategoryModal;
