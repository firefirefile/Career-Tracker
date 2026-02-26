const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let expressProcess;
const EXPRESS_PORT = 3000;

// Глобальный обработчик ошибок
process.on('uncaughtException', (error) => {
    console.error('Необработанная ошибка:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Необработанный отказ промиса:', reason);
});

// 1. Запускаем Express
function startExpress() {
    console.log('Запускаем Express...');

    const expressPath = app.isPackaged
        ? path.join(process.resourcesPath, 'express-backend')
        : path.join(__dirname, 'express-backend');

    const wwwPath = path.join(expressPath, 'bin', 'www');

    if (!fs.existsSync(wwwPath)) {
        console.error('❌ Нет файла www по пути:', wwwPath);
        return false;
    }

    // Используем node из Electron
    const nodePath = app.isPackaged ? process.execPath : 'node';

    expressProcess = spawn(nodePath, [wwwPath], {
        cwd: expressPath,
        env: {
            PORT: EXPRESS_PORT,
            NODE_ENV: app.isPackaged ? 'production' : 'development'
        },
        stdio: 'pipe'
    });

    expressProcess.stdout.on('data', data => {
        const msg = data.toString().trim();
        if (msg) console.log('📦 Express:', msg);
    });

    expressProcess.stderr.on('data', data => {
        const msg = data.toString().trim();
        if (msg) console.error('❌ Express error:', msg);
    });

    expressProcess.on('error', (err) => {
        console.error('❌ Не удалось запустить Express:', err.message);
    });

    expressProcess.on('exit', (code) => {
        console.log(`📦 Express завершился с кодом: ${code}`);
    });

    // Ждём немного, чтобы Express запустился
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), 1500);
    });
}

// 2. Создаём окно
async function createWindow() {
    if (mainWindow) {
        console.log('Окно уже создано');
        return;
    }

    console.log('Создаём окно...');

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Career Tracker',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        }
    });

    // Ловим ошибки рендеринга
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('✅ Окно загрузилось');
    });

    mainWindow.webContents.on('failed-to-load', (event, errorCode, errorDescription) => {
        console.error('❌ Ошибка загрузки:', errorCode, errorDescription);
    });

    mainWindow.webContents.on('crashed', (event, killed) => {
        console.error('❌ Окно упало. killed:', killed);
    });

    // Загружаем фронтенд
    if (app.isPackaged) {
        // В packaged режиме используем app.getAppPath() для корректной работы с ASAR
        const basePath = app.getAppPath();
        const indexPath = path.join(basePath, 'todo-frontend', 'dist', 'index.html');
        console.log('Загружаю index.html из packaged ресурсов:', indexPath);

        try {
            await mainWindow.loadFile(indexPath);
            console.log('✅ Фронтенд успешно загружен из packaged ресурсов');
        } catch (error) {
            console.error('❌ Не удалось загрузить фронтенд из packaged ресурсов:', error.message);
            console.log('Пробую fallback на Express сервер...');
            try {
                await mainWindow.loadURL(`http://localhost:${EXPRESS_PORT}`);
                console.log('✅ Загружено fallback с Express');
            } catch (fallbackError) {
                console.error('❌ Fallback также не удался:', fallbackError);
            }
        }
    } else {
        console.log('Загружаю dev-сервер:', 'http://localhost:5173');
        try {
            await mainWindow.loadURL('http://localhost:5173');
            console.log('✅ Dev-сервер загружен');
        } catch (error) {
            console.error('❌ Ошибка загрузки dev-сервера:', error);
        }
    }
}

// 3. Запуск приложения
app.whenReady().then(async () => {
    console.log('🚀 Electron готов');
    console.log(`📡 Порт Express: ${EXPRESS_PORT}`);

    // Запускаем Express
    const expressStarted = await startExpress();
    if (!expressStarted) {
        console.error('❌ Не удалось запустить Express');
    }

    // Ждём и создаём окно
    setTimeout(() => {
        createWindow().catch(console.error);
    }, 2000);

    // macOS: активация
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow().catch(console.error);
        }
    });
});

// 4. Обработка закрытия всех окон
app.on('window-all-closed', () => {
    console.log('Все окна закрыты');
    if (expressProcess && !expressProcess.killed) {
        console.log('Останавливаю Express...');
        expressProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 5. Выход из приложения
app.on('before-quit', () => {
    if (expressProcess && !expressProcess.killed) {
        expressProcess.kill();
    }
});