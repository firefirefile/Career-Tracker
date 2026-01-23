const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const app = express();

// CORS настройки
const corsOptions = {
    origin: 'http://localhost:5173', // Адрес Vite dev сервера
    optionsSuccessStatus: 200,
    credentials: true
};

// Middleware - ВАЖНО: cors ДО других middleware!
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Подключаем роуты
const indexRouter = require('./routes/index');
const jobsRouter = require('./routes/jobs'); // ← переименовал переменную

app.use('/', indexRouter);
app.use('/api/jobs', jobsRouter); // ← изменил маршрут с /api/todos на /api/jobs

// Обработка 404
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

module.exports = app;