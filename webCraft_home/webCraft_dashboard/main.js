const { app, BrowserWindow } = require('electron');
const path = require('path');

// Optional: Add hot-reloading for development
try {
  require('electron-reloader')(module);
} catch (_) {}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    // Make sure 'icon.png' is in the same folder as main.js
    icon: path.join(__dirname, 'icon.png'), 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // Required if you use Node.js scripts in your HTML
    }
  });

  win.setMenu(null);
  win.loadFile('webCraft_dashboard.html');
  
  // Optional: Open DevTools automatically while you are building
  // win.webContents.openDevTools(); 
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});