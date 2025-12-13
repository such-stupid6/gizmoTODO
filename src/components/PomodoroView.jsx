import React, { useState, useEffect, useRef } from 'react';
import { Button, Progress, Typography, Space, Tooltip } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, CloseOutlined, SwapOutlined, StopOutlined } from '@ant-design/icons';

const getIpcRenderer = () => {
  if (window.ipcRenderer) return window.ipcRenderer;
  if (window.require) {
    try {
      return window.require('electron').ipcRenderer;
    } catch (e) {
      console.error('Electron IPC not available:', e);
    }
  }
  return { send: (channel) => console.log(`IPC send: ${channel}`) };
};

const ipcRenderer = getIpcRenderer();

const { Title } = Typography;

const FOCUS_TIME = 25 * 60; // 25 minutes
const SHORT_BREAK_TIME = 5 * 60; // 5 minutes

const PomodoroView = ({ todoItem, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const timerRef = useRef(null);

  useEffect(() => {
    // Timer logic
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setIsActive(false);
      // Auto-switch mode logic could go here
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const startTimer = () => {
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : SHORT_BREAK_TIME);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : SHORT_BREAK_TIME);
  };

  const switchMode = () => {
    const newMode = mode === 'focus' ? 'break' : 'focus';
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : SHORT_BREAK_TIME);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(
    ((mode === 'focus' ? FOCUS_TIME : SHORT_BREAK_TIME) - timeLeft) / 
    (mode === 'focus' ? FOCUS_TIME : SHORT_BREAK_TIME) * 100
  );

  return (
    <div className="h-full w-full flex items-center justify-center bg-transparent">
      <div className="relative w-[160px] h-[160px] rounded-full bg-white overflow-hidden group drag-region border-4 border-gray-100" style={{ WebkitAppRegion: 'drag' }}>
      
        {/* Traffic Lights - Top Left */}
        <div className="absolute top-6 left-8 flex gap-1.5 z-20 no-drag opacity-0 group-hover:opacity-100 transition-opacity" style={{ WebkitAppRegion: 'no-drag' }}>
          <div 
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer shadow-sm flex items-center justify-center group/close"
              onClick={onClose}
          >
              <CloseOutlined className="text-[8px] text-red-900 opacity-0 group-hover/close:opacity-100" />
          </div>
          <div 
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer shadow-sm flex items-center justify-center group/min"
              onClick={() => ipcRenderer.send('window-minimize')}
          >
              <div className="w-2 h-0.5 bg-yellow-900 opacity-0 group-hover/min:opacity-100"></div>
          </div>
        </div>
        
        <div className="relative flex items-center justify-center w-full h-full">
          <Progress 
            type="circle" 
            percent={progressPercent} 
            showInfo={false}
            width={130}
            strokeColor={mode === 'focus' ? '#ff4d4f' : '#52c41a'}
            strokeWidth={4}
            trailColor="#f5f5f5"
          />
          
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
            {/* Timer - Click to Start Only */}
            <div 
              className={`text-2xl font-mono font-bold text-gray-700 select-none no-drag ${!isActive ? 'cursor-pointer hover:scale-105' : ''} transition-transform`}
              onClick={!isActive ? startTimer : undefined}
              title={!isActive ? "开始" : ""}
              style={{ WebkitAppRegion: 'no-drag' }}
            >
              {formatTime(timeLeft)}
            </div>
            
            {/* Controls - Visible on Hover or when paused */}
            <div className={`flex items-center gap-1 mt-1 transition-opacity duration-300 no-drag ${isActive ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`} style={{ WebkitAppRegion: 'no-drag' }}>
              <Tooltip title={isActive ? "放弃" : "开始"}>
                  <Button 
                  shape="circle" 
                  size="small"
                  icon={isActive ? <StopOutlined /> : <PlayCircleOutlined />} 
                  onClick={isActive ? stopTimer : startTimer}
                  className={`border-none bg-transparent shadow-none ${isActive ? 'text-red-400 hover:text-red-600' : 'text-gray-400 hover:text-blue-500'}`}
                  />
              </Tooltip>
              
              <Tooltip title={mode === 'focus' ? "切换到休息" : "切换到专注"}>
                  <Button 
                  shape="circle" 
                  size="small"
                  icon={<SwapOutlined />} 
                  onClick={switchMode}
                  className="text-gray-400 hover:text-green-500 border-none bg-transparent shadow-none"
                  />
              </Tooltip>
            </div>
  
             {/* Task Name - Bottom */}
             <div className="absolute bottom-4 w-24 truncate text-center text-[10px] text-gray-400 pointer-events-none">
              {todoItem?.text || '专注任务'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroView;
