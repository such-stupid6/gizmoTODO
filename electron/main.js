import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

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
  app.commandLine.appendSwitch('disable-dev-shm-usage');
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 为了简化迁移，先关闭隔离，后续建议开启并使用 preload
    },
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
