const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// ===== portable 模式：让 userData / logs / sessionData 跟着 exe 走 =====
// electron-builder 打包成 portable 时运行会注入此环境变量，普通 `npm start` 时不存在，不影响开发调试
if (process.env.PORTABLE_EXECUTABLE_DIR) {
  const dataDir = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  app.setPath('userData', dataDir);
  app.setPath('sessionData', dataDir);
  app.setPath('logs', path.join(dataDir, 'logs'));
}
// ===== 以上必须在 app.whenReady() 之前执行 =====

function createWindow() {
  const win = new BrowserWindow({
    width: 1700,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 关键：允许 WebHID 设备访问，不弹选择器，直接放行
  win.webContents.session.setDevicePermissionHandler(() => {
    return true;
  });

  // 加载 htxu 文件夹中的 index.html
  win.loadFile(path.join(__dirname, 'htxu', 'index.html'));

  return win;
}

// ===== 单实例锁：防止双击多次导致多实例抢 WebHID 设备 =====
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  // 已有实例在运行，当前实例直接退出
  app.quit();
} else {
  // 第二个实例启动时，把已有窗口唤到前台
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    } else {
      // 极端情况：第一实例窗口还没建好，补建一个
      app.whenReady().then(createWindow);
    }
  });

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}