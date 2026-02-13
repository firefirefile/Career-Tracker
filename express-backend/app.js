const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');

const app = express();

// ========== УЛУЧШЕННЫЙ CORS ДЛЯ TAURI ==========
app.use((req, res, next) => {
    console.log(`📡 ${new Date().toISOString()} ${req.method} ${req.url} from ${req.headers.origin || 'direct'} ${req.headers['user-agent']?.substring(0, 50) || ''}`);

    // Разрешаем ВСЕ origins для Tauri
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Tauri-Request');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Date, Server');

    // Обработка preflight запросов
    if (req.method === 'OPTIONS') {
        console.log('🛫 Preflight запрос разрешён');
        return res.status(200).header('Content-Length', '0').end();
    }

    next();
});

// Дублируем через cors middleware для надёжности
app.use(cors({
    origin: function(origin, callback) {
        // Разрешаем все origins
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'X-Tauri-Request'],
    exposedHeaders: ['Content-Length', 'Content-Type', 'Date', 'Server'],
    maxAge: 86400 // 24 часа
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Добавляем корневой endpoint для проверки
app.get('/api', (req, res) => {
    res.json({
        name: 'Job Tracker API',
        version: '1.0.0',
        endpoints: {
            jobs: '/api/jobs',
            parse: '/api/parser/hh-simple'
        },
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// Роуты
const indexRouter = require('./routes/index');
const jobsRouter = require('./routes/jobs');
const parserRouter = require('./routes/parser');

// Регистрируем роуты с ЧЁТКИМИ путями:
app.use('/', indexRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/parser', parserRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Обработка 404
app.use((req, res, next) => {
    console.log('❌ 404 по пути:', req.originalUrl);
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        availableEndpoints: ['/api', '/api/jobs', '/api/parser/hh-simple', '/health']
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('💥 Ошибка сервера:', err.message);
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Вывод всех зарегистрированных путей при старте
console.log('\n🚀 Express сервер запущен!');
console.log('🌐 Доступные endpoints:');
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(', ');
        console.log(`   ${methods.padEnd(10)} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
        console.log(`   Router: ${middleware.regexp.toString().substring(0, 50)}...`);
    }
});

console.log('\n✅ Сервер готов к работе!');
console.log(`📡 Основные endpoints:`);
console.log(`   GET    /api              - Информация об API`);
console.log(`   GET    /api/jobs         - Все вакансии`);
console.log(`   POST   /api/jobs         - Создать вакансию`);
console.log(`   POST   /api/parser/hh-simple - Парсить вакансию с HH.ru`);
console.log(`   GET    /health           - Проверка здоровья`);
console.log(`\n🎯 Бэкенд работает на: http://127.0.0.1:3000`);
console.log(`🎯 И на: http://localhost:3000\n`);

module.exports = app;