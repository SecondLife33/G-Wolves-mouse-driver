const { app, BrowserWindow } = require('electron');
const path = require('path');

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
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});