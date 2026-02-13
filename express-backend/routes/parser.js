const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// Парсер для HH.ru
router.post('/hh-simple', async (req, res) => {
    try {
        const { url } = req.body;


        if (!url || !url.includes('hh.ru/vacancy/')) {
            return res.status(400).json({
                success: false,
                error: 'Нужна ссылка на вакансию HH.ru'
            });
        }

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        let vacancyName = $('[data-qa="vacancy-title"]').first().text().trim();

        if (!vacancyName) {
            vacancyName = $('h1').first().text().trim();
        }

        vacancyName = vacancyName.replace(/\s+/g, ' ').trim();
        vacancyName = vacancyName.replace(/^Вакансия\s*[:\-]?\s*/i, '');

        let company = '';

        company = $('[data-qa="vacancy-company-name"]').first().text().trim();

        // Способ 2: Если не нашли, ищем ссылку с классом компании
        if (!company) {
            company = $('a[data-qa="vacancy-serp__vacancy-employer"]').first().text().trim();
        }


        if (!company) {
            company = $('.vacancy-company-name').first().text().trim();
        }


        if (!company) {
            company = $('span.vacancy-company-name').first().text().trim();
        }


        if (!company) {
            const companyElements = $('*:contains("ООО"), *:contains("ИП"), *:contains("АО"), *:contains("ПАО")');
            for (let i = 0; i < companyElements.length; i++) {
                const text = $(companyElements[i]).text().trim();
                if (text && (text.includes('ООО') || text.includes('ИП') || text.includes('АО'))) {
                    company = text;
                    break;
                }
            }
        }

        // УБИРАЕМ ДУБЛИРОВАНИЕ
        company = company.replace(/\s+/g, ' ').trim();

        // Удаляем повторяющиеся части
        company = company.replace(/(ООО|ИП|АО|ПАО)\s+(.+?)(?:\1\s+\2)+/i, '$1 $2');

        // Удаляем дублирование
        const words = company.split(/\s+/);
        const uniqueWords = [];
        const seen = new Set();

        for (const word of words) {
            const normalizedWord = word.trim();
            if (normalizedWord && !seen.has(normalizedWord)) {
                seen.add(normalizedWord);
                uniqueWords.push(normalizedWord);
            }
        }

        company = uniqueWords.join(' ');

        // Очистка окончаний
        company = company.replace(/[.,\s]+$/, '');

        // Ограничиваем длину (если нужно)
        if (company.length > 100) {
            company = company.substring(0, 100) + '...';
        }

        console.log('✅ Найдено:', {
            vacancyName,
            company,
            companyLength: company.length
        });

        // Дебаг: посмотрим, что находит на странице
        console.log('🔎 Дебаг - все элементы с data-qa="vacancy-company-name":');
        $('[data-qa="vacancy-company-name"]').each((i, el) => {
            console.log(`  ${i}: "${$(el).text().trim()}"`);
        });

        if (!vacancyName) {
            return res.json({
                success: false,
                error: 'Не удалось найти название вакансии'
            });
        }

        res.json({
            success: true,
            data: {
                vacancyName: vacancyName || 'Не указано',
                company: company || 'Не указано',
                sourceUrl: url
            }
        });

    } catch (error) {
        console.error('❌ Ошибка парсинга:', error.message);

        let errorMessage = 'Ошибка при загрузке страницы';
        if (error.code === 'ECONNABORTED') {
            errorMessage = 'Таймаут запроса. Слишком долгий ответ от HH.ru';
        } else if (error.response) {
            errorMessage = `Ошибка ${error.response.status}: ${error.response.statusText}`;
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            details: error.message
        });
    }
});

router.post('/hh-simple-v2', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url || !url.includes('hh.ru/vacancy/')) {
            return res.status(400).json({ success: false, error: 'Нужна ссылка на вакансию HH.ru' });
        }

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);


        const vacancyName = $('[data-qa="vacancy-title"]').first().text().trim().replace(/\s+/g, ' ');


        let company = $('[data-qa="vacancy-company-name"]').first().text().trim();
        company = company.replace(/\s+/g, ' ').trim();

        const halfLength = Math.floor(company.length / 2);
        const firstHalf = company.substring(0, halfLength).trim();
        const secondHalf = company.substring(halfLength).trim();

        if (firstHalf === secondHalf) {
            company = firstHalf;
        }

        res.json({
            success: true,
            data: {
                vacancyName: vacancyName || 'Не указано',
                company: company || 'Не указано',
                sourceUrl: url
            }
        });

    } catch (error) {
        console.error('Ошибка:', error.message);
        res.status(500).json({ success: false, error: 'Ошибка парсинга' });
    }
});

module.exports = router;