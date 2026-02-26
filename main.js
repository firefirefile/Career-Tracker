const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
let expressServer = null; // Для in-process сервера
let expressProcess = null; // Для отдельного процесса (dev)
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
    
    if (app.isPackaged) {
        // В packaged режиме запускаем Express в основном процессе
        try {
            const expressPath = path.join(process.resourcesPath, 'express-backend');
            const appPath = path.join(expressPath, 'app.js');
            
            console.log('Загружаю Express app из:', appPath);
            
            if (!fs.existsSync(appPath)) {
                console.error('❌ Не найден app.js по пути:', appPath);
                return false;
            }
            
            // Устанавливаем переменные окружения для Express
            process.env.PORT = EXPRESS_PORT;
            process.env.NODE_ENV = 'production';
            
            // Загружаем Express приложение
            const expressApp = require(appPath);
            
            // Создаём HTTP сервер
            expressServer = http.createServer(expressApp);
            
            // Запускаем сервер
            expressServer.listen(EXPRESS_PORT, '0.0.0.0', () => {
                console.log(`✅ Express запущен на порту ${EXPRESS_PORT} (в основном процессе)`);
            });
            
            expressServer.on('error', (err) => {
                console.error('❌ Ошибка Express сервера:', err);
            });
            
            return true;
        } catch (error) {
            console.error('❌ Не удалось запустить Express в основном процессе:', error);
            return false;
        }
    } else {
        // В dev режиме запускаем отдельный процесс
        const expressPath = path.join(__dirname, 'express-backend');
        const wwwPath = path.join(expressPath, 'bin', 'www');

        if (!fs.existsSync(wwwPath)) {
            console.error('❌ Нет файла www по пути:', wwwPath);
            return false;
        }

        // Используем системный node
        expressProcess = spawn('node', [wwwPath], {
            cwd: expressPath,
            env: {
                PORT: EXPRESS_PORT,
                NODE_ENV: 'development'
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

    // Открывать внешние ссылки в системном браузере
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // Если ссылка на внешний сайт (не localhost:3000 или file://), открываем в браузере
        if (url.startsWith('http://') || url.startsWith('https://')) {
            const isLocalhost = url.includes('localhost:3000') || url.includes('127.0.0.1:3000');
            if (!isLocalhost) {
                console.log('🌐 Открываю внешнюю ссылку в браузере:', url);
                require('electron').shell.openExternal(url);
                return { action: 'deny' };
            }
        }
        return { action: 'allow' };
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

    // Открывать внешние ссылки при навигации в системном браузере
    mainWindow.webContents.on('will-navigate', (event, url) => {
        // Если это не внутренняя навигация (не API и не file://), открываем в браузере
        if (url.startsWith('http://') || url.startsWith('https://')) {
            const isLocalhost = url.includes('localhost:3000') || url.includes('127.0.0.1:3000');
            if (!isLocalhost) {
                console.log('🌐 Открываю внешнюю ссылку в браузере (will-navigate):', url);
                event.preventDefault();
                require('electron').shell.openExternal(url);
            }
        }
    });

    // Загружаем фронтенд
    if (app.isPackaged) {
        // В packaged режиме используем app.getAppPath() для корректной работы с ASAR
        const basePath = app.getAppPath();
        const indexPath = path.join(basePath, 'todo-frontend', 'dist', 'index.html');
        console.log('Загружаю index.html из packaged ресурсов:', indexPath);

        // Проверяем существование файла
        if (!fs.existsSync(indexPath)) {
            console.error('❌ Файл index.html не найден по пути:', indexPath);
            console.log('Попробую альтернативный путь или fallback...');
        } else {
            console.log('✅ Файл найден, загружаю...');
        }

        try {
            // Используем loadFile - он должен работать с ASAR
            await mainWindow.loadFile(indexPath);
            console.log('✅ Фронтенд успешно загружен из packaged ресурсов');
        } catch (error) {
            console.error('❌ Ошибка loadFile:', error.message);
            console.log('Пробую загрузить через file:// URL...');
            try {
                // Альтернативный способ - через file://
                await mainWindow.loadURL(`file://${indexPath}`);
                console.log('✅ Загружено через file://');
            } catch (e) {
                console.error('❌ Не удалось загрузить через file://:', e.message);
                console.log('Пробую fallback на Express сервер...');
                try {
                    await mainWindow.loadURL(`http://localhost:${EXPRESS_PORT}`);
                    console.log('✅ Загружено fallback с Express');
                } catch (fallbackError) {
                    console.error('❌ Все способы загрузки не удались:', fallbackError);
                }
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
    
    // Останавливаем Express
    if (expressServer) {
        console.log('Останавливаю Express сервер...');
        expressServer.close(() => {
            console.log('✅ Express сервер остановлен');
        });
        expressServer = null;
    }
    
    if (expressProcess && !expressProcess.killed) {
        console.log('Останавливаю Express процесс...');
        expressProcess.kill();
        expressProcess = null;
    }
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 5. Выход из приложения
app.on('before-quit', () => {
    if (expressServer) {
        console.log('Останавливаю Express сервер перед выходом...');
        expressServer.close();
        expressServer = null;
    }
    if (expressProcess && !expressProcess.killed) {
        expressProcess.kill();
        expressProcess = null;
    }
});