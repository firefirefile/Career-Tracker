const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Jobs API',
        endpoints: {
            jobs: '/api/jobs',
        },
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;