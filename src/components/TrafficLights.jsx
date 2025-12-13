import React from 'react';

const TrafficLights = () => {
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
    <div className="h-[40px] flex items-center px-4" style={{ WebkitAppRegion: 'drag' }}>
        <div className="flex gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
        {/* Close Button - Red */}
        <div 
            onClick={handleClose}
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center cursor-pointer hover:bg-[#ff5f56]/80 active:bg-[#bf403a] transition-colors group"
        >
            <svg width="7" height="7" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="#4c0000" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>
        {/* Minimize Button - Yellow */}
        <div 
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center cursor-pointer hover:bg-[#ffbd2e]/80 active:bg-[#bf8e22] transition-colors group"
        >
            <svg width="7" height="7" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <path d="M2 5H8" stroke="#995700" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>
        {/* Maximize Button - Green */}
        <div 
            onClick={handleMaximize}
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center cursor-pointer hover:bg-[#27c93f]/80 active:bg-[#1d8a2b] transition-colors group"
        >
            <svg width="6" height="6" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <path d="M1.5 8.5v-4M1.5 8.5h4M1.5 8.5l4-4M8.5 1.5v4M8.5 1.5h-4M8.5 1.5l-4 4" stroke="#006500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
        </div>
    </div>
  );
};

export default TrafficLights;
