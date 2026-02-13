const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let expressProcess;
const EXPRESS_PORT = 5000;

// 1. Запускаем Express
function startExpress() {
    console.log('Запускаем Express...');

    const expressPath = app.isPackaged
        ? path.join(process.resourcesPath, 'express-backend')
        : path.join(__dirname, 'express-backend');

    const wwwPath = path.join(expressPath, 'bin', 'www');

    if (!fs.existsSync(wwwPath)) {
        console.error('Нет www файла');
        return false;
    }

    // Используем node из Electron
    const nodePath = app.isPackaged ? process.execPath : 'node';

    expressProcess = spawn(nodePath, [wwwPath], {
        cwd: expressPath,
        env: {
            PORT: EXPRESS_PORT,
            NODE_ENV: app.isPackaged ? 'production' : 'development'
        }
    });

    expressProcess.stdout.on('data', data => console.log('Express:', data.toString()));
    expressProcess.stderr.on('data', data => console.error('Express error:', data.toString()));

    return true;
}

// 2. Создаём одно окно
function createWindow() {
    if (mainWindow) return; // Уже есть окно

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Грузим файлы React напрямую
    if (app.isPackaged) {
        const indexPath = path.join(process.resourcesPath, 'todo-frontend', 'dist', 'index.html');
        if (fs.existsSync(indexPath)) {
            mainWindow.loadFile(indexPath);
        } else {
            mainWindow.loadURL(`http://localhost:${EXPRESS_PORT}`);
        }
    } else {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
}

// 3. Всё вместе
app.whenReady().then(() => {
    console.log('Electron готов');

    startExpress();

    // Ждём немного и создаём окно
    setTimeout(() => {
        createWindow();
    }, 2000);

    // Только для macOS: если нет окон после активации
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 4. Закрываем всё
app.on('window-all-closed', () => {
    if (expressProcess) expressProcess.kill();

    if (process.platform !== 'darwin') {
        app.quit();
    }
});