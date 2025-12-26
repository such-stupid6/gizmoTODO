import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';

Store.initRenderer();
const store = new Store();
console.log('Electron Store Path:', store.path);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 尝试修复 Linux 下输入法问题
if (process.platform === 'linux') {
  const xmodifiers = process.env.XMODIFIERS || '';
  if (xmodifiers.includes('fcitx')) {
    process.env.GTK_IM_MODULE = 'fcitx';
    process.env.QT_IM_MODULE = 'fcitx';
  } else if (xmodifiers.includes('ibus')) {
    process.env.GTK_IM_MODULE = 'ibus';
    process.env.QT_IM_MODULE = 'ibus';
  }
}

const isDev = process.env.NODE_ENV === 'development';

// 针对 Linux 平台添加 --no-sandbox 参数
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
  // 禁用 GPU 加速，解决 WSL 下 /dev/shm 共享内存错误和鼠标点击偏移问题
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
} else {
  // Windows/macOS 不需要这些补丁，移除它们以获得最佳性能
  // 保持默认 GPU 加速开启
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 为了简化迁移，先关闭隔离，后续建议开启并使用 preload
    },
    frame: false, // 完全无边框，自己绘制红绿灯
    transparent: true, // 允许透明背景，实现圆角
    backgroundColor: '#00000000', // 透明背景色
  });

  mainWindow.setMenu(null); // 完全移除菜单栏

  // Store original window size
  let originalSize = [900, 600];
  let isMiniMode = false;

  // 跟踪最大化状态，解决部分透明窗口下 isMaximized() 判断不准确的问题
  let isWindowMaximized = false;
  mainWindow.on('maximize', () => { isWindowMaximized = true; });
  mainWindow.on('unmaximize', () => { isWindowMaximized = false; });

  // IPC 监听：窗口控制
  ipcMain.on('window-minimize', () => mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    if (isWindowMaximized) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('window-close', () => mainWindow.close());

  // Store IPC
  ipcMain.handle('store-get', (event, key) => {
    return store.get(key);
  });
  ipcMain.on('store-set', (event, key, value) => {
    store.set(key, value);
  });
  ipcMain.on('store-delete', (event, key) => {
    store.delete(key);
  });

  // Mini Mode IPC
  ipcMain.on('enter-mini-mode', () => {
    console.log('IPC: enter-mini-mode');
    if (isMiniMode) return;
    
    isMiniMode = true;
    originalSize = mainWindow.getSize();
    console.log('Saving original size:', originalSize);
    
    // 允许缩小到更小尺寸
    mainWindow.setMinimumSize(100, 100);
    mainWindow.setSize(180, 180);
    mainWindow.setAlwaysOnTop(true);
  });

  ipcMain.on('leave-mini-mode', () => {
    console.log('IPC: leave-mini-mode');
    if (!isMiniMode) return;
    
    isMiniMode = false;
    // 恢复正常大小
    mainWindow.setSize(originalSize[0], originalSize[1]);
    mainWindow.setMinimumSize(400, 300); // 恢复合理的最小尺寸限制
    mainWindow.setAlwaysOnTop(false);
    mainWindow.center();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, 'dist' is adjacent to 'electron' folder usually, or inside it depending on build config.
    // Assuming standard vite build output to 'dist' in root.
    // When running electron from root:
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
