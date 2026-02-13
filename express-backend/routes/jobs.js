const express = require('express');
const router = express.Router();
const jobsStorage = require('../storage/JobsStorage');

// GET /api/jobs - получить все вакансии
router.get('/', async (req, res) => {
    try {
        const jobs = await jobsStorage.getAll();
        res.json({
            success: true,
            data: jobs,
            count: jobs.length
        });
    } catch (error) {
        console.error('Error getting jobs:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/jobs/:id - получить вакансию по ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }

        const job = await jobsStorage.getById(id);
        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        console.error('Error getting job:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/jobs - создать новую вакансию
router.post('/', async (req, res) => {
    try {
        const { company, vacancyName, url, status = 'wait', comments = [], createdAt } = req.body;

        // Валидация
        if (!company || company.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Company name is required'
            });
        }

        if (!vacancyName || vacancyName.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Vacancy name is required'
            });
        }

        const newJob = {
            company: company.trim(),
            vacancyName: vacancyName.trim(),
            url: url || '',
            status: status,
            comments: comments,
            createdAt: createdAt
        };

        const createdJob = await jobsStorage.create(newJob);

        res.status(201).json({
            success: true,
            data: createdJob,
            message: 'Job created successfully'
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// PUT /api/jobs/:id - обновить вакансию
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }

        const { company, vacancyName, url, status, comments } = req.body;

        // Проверяем что статус валидный если он передан
        if (status !== undefined) {
            const validStatuses = ['interview', 'wait', 'deny', 'archive'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid status value'
                });
            }
        }

        const updates = {};
        if (company !== undefined) updates.company = company;
        if (vacancyName !== undefined) updates.vacancyName = vacancyName;
        if (url !== undefined) updates.url = url;
        if (status !== undefined) updates.status = status;
        if (comments !== undefined) updates.comments = comments;

        const updatedJob = await jobsStorage.update(id, updates);

        res.json({
            success: true,
            data: updatedJob,
            message: 'Job updated successfully'
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        console.error('Error updating job:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// PATCH /api/jobs/:id - обновить статус
router.patch('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }

        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }

        // Проверяем что статус валидный
        const validStatuses = ['interview', 'wait', 'deny', 'archive'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value'
            });
        }

        const updatedJob = await jobsStorage.updateStatus(id, status);

        res.json({
            success: true,
            data: updatedJob,
            message: 'Job status updated successfully'
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        console.error('Error updating job status:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// DELETE /api/jobs/:id - удалить вакансию
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }

        await jobsStorage.delete(id);

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        console.error('Error deleting job:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/jobs/stats - получить статистику
router.get('/stats', async (req, res) => {
    try {
        const stats = jobsStorage.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/jobs/search - поиск вакансий
router.get('/search', async (req, res) => {
    try {
        const { company, status } = req.query;
        const jobs = await jobsStorage.search(company, status);

        res.json({
            success: true,
            data: jobs,
            count: jobs.length
        });
    } catch (error) {
        console.error('Error searching jobs:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;