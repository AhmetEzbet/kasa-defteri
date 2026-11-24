// Kasa Defteri - Windows masaüstü uygulaması. Arayüz web sürümüyle birebir aynıdır.
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('node:path');

if (!app.requestSingleInstanceLock()) { app.quit(); }

let pencere = null;
function ac() {
  pencere = new BrowserWindow({
    width: 540, height: 920, minWidth: 380, minHeight: 600,
    backgroundColor: '#f4f1ea', title: 'Kasa Defteri', autoHideMenuBar: true,
    icon: path.join(__dirname, 'www', 'icon-192.png'),
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false }
  });
  pencere.loadFile(path.join(__dirname, 'www', 'index.html'));
  // Uygulama içinde başka sayfaya gidilmesin; dış bağlantılar tarayıcıda açılsın
  pencere.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  pencere.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('blob:')) return { action: 'allow', overrideBrowserWindowOptions: { autoHideMenuBar: true, backgroundColor: '#1d1b17' } };
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}
Menu.setApplicationMenu(null);
app.on('second-instance', () => { if (pencere) { if (pencere.isMinimized()) pencere.restore(); pencere.focus(); } });
app.whenReady().then(ac);
app.on('window-all-closed', () => app.quit());
