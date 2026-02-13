const fs = require('fs').promises;
const fsSync = require('fs'); // Добавляем синхронный fs
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'jobs.json');

class JobsStorage {
    constructor() {
        // Создаем папку data если её нет (синхронно в конструкторе)
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fsSync.existsSync(dataDir)) {
            fsSync.mkdirSync(dataDir, { recursive: true });
        }

        // Инициализируем данные
        this.init();
    }

    async init() {
        try {
            // Проверяем существует ли файл
            await fs.access(DATA_FILE);

            // Читаем данные из файла
            const data = await fs.readFile(DATA_FILE, 'utf-8');
            this.jobs = JSON.parse(data);
            console.log(`Loaded ${this.jobs.length} jobs from file`);
        } catch (error) {
            // Если файла нет, создаем с начальными данными
            console.log('Creating new data file with initial data...');
            this.jobs = [
                {
                    id: 1,
                    company: 'U mami',
                    vacancyName: 'Mommy',
                    url: 'https://ya.ru/',
                    status: 'wait',
                    createdAt: new Date().toISOString(),
                    comments: ['У мамы вкусные пирожки'],
                },
                {
                    id: 2,
                    company: 'U mami1',
                    vacancyName: 'Mommy2',
                    url: 'https://ya.ru/',
                    status: 'wait',
                    createdAt: new Date().toISOString(),
                    comments: ['У мамы вкусные пирожки',
                        " Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur dignissimos distinctio dolore, doloribus dolorum fuga laboriosam perspiciatis placeat similique sint."],
                },
                {
                    id: 3,
                    company: 'U mami1',
                    vacancyName: 'Mommy2',
                    url: 'https://ya.ru/',
                    status: 'wait',
                    createdAt: new Date().toISOString(),
                    comments: ['У мамы вкусные пирожки',
                        " Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur dignissimos distinctio dolore, doloribus dolorum fuga laboriosam perspiciatis placeat similique sint."],
                },
                {
                    id: 4,
                    company: 'U mami1',
                    vacancyName: 'Mommy2',
                    url: 'https://ya.ru/',
                    status: 'wait',
                    createdAt: new Date().toISOString(),
                    comments: ['У мамы вкусные пирожки',
                        " Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur dignissimos distinctio dolore, doloribus dolorum fuga laboriosam perspiciatis placeat similique sint."],
                }
            ];
            await this.save();
        }
    }

    async save() {
        try {
            await fs.writeFile(DATA_FILE, JSON.stringify(this.jobs, null, 2), 'utf-8');
            console.log(`Data saved (${this.jobs.length} jobs)`);
        } catch (error) {
            console.error('Error saving jobs:', error);
            throw error;
        }
    }

    async getAll() {
        return this.jobs;
    }

    async getById(id) {
        const job = this.jobs.find(j => j.id === id);
        if (!job) {
            throw new Error(`Job with id ${id} not found`);
        }
        return job;
    }

    async create(jobData) {
        const newJob = {
            id: this.getNextId(),
            company: jobData.company.trim(),
            vacancyName: jobData.vacancyName.trim(),
            url: jobData.url || '',
            status: jobData.status || 'wait',
            comments: Array.isArray(jobData.comments) ? jobData.comments : [jobData.comments || ''],
            createdAt: jobData.createdAt || new Date().toISOString(),
        };

        this.jobs.push(newJob);
        await this.save();
        return newJob;
    }

    async update(id, updates) {
        const index = this.jobs.findIndex(j => j.id === id);
        if (index === -1) {
            throw new Error(`Job with id ${id} not found`);
        }

        // Обновляем только переданные поля
        const job = this.jobs[index];

        if (updates.company !== undefined) {
            job.company = updates.company.trim();
        }

        if (updates.vacancyName !== undefined) {
            job.vacancyName = updates.vacancyName.trim();
        }

        if (updates.url !== undefined) {
            job.url = updates.url;
        }

        if (updates.status !== undefined) {
            // Проверяем валидность статуса
            const validStatuses = ['interview', 'wait', 'deny', 'archive'];
            if (validStatuses.includes(updates.status)) {
                job.status = updates.status;
            }
        }

        if (updates.comments !== undefined) {
            job.comments = Array.isArray(updates.comments) ? updates.comments : [updates.comments];
        }

        job.updatedAt = new Date().toISOString();
        await this.save();
        return job;
    }

    async delete(id) {
        const initialLength = this.jobs.length;
        this.jobs = this.jobs.filter(j => j.id !== id);

        if (this.jobs.length === initialLength) {
            throw new Error(`Job with id ${id} not found`);
        }

        await this.save();
        return true;
    }

    async updateStatus(id, status) {
        const index = this.jobs.findIndex(j => j.id === id);
        if (index === -1) {
            throw new Error(`Job with id ${id} not found`);
        }

        // Проверяем валидность статуса
        const validStatuses = ['interview', 'wait', 'deny', 'archive'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }

        this.jobs[index].status = status;
        this.jobs[index].updatedAt = new Date().toISOString();
        await this.save();
        return this.jobs[index];
    }

    async search(company, status) {
        let filteredJobs = [...this.jobs];

        if (company) {
            filteredJobs = filteredJobs.filter(j =>
                j.company.toLowerCase().includes(company.toLowerCase())
            );
        }

        if (status) {
            filteredJobs = filteredJobs.filter(j => j.status === status);
        }

        return filteredJobs;
    }

    getNextId() {
        if (this.jobs.length === 0) return 1;
        return Math.max(...this.jobs.map(j => j.id)) + 1;
    }

    getStats() {
        const total = this.jobs.length;
        const byStatus = {
            interview: this.jobs.filter(j => j.status === 'interview').length,
            wait: this.jobs.filter(j => j.status === 'wait').length,
            deny: this.jobs.filter(j => j.status === 'deny').length,
            archive: this.jobs.filter(j => j.status === 'archive').length,
        };

        return {
            total,
            byStatus,
            summary: {
                active: byStatus.interview + byStatus.wait,
                inactive: byStatus.deny + byStatus.archive
            }
        };
    }
}

// Создаем экземпляр и экспортируем его
const jobsStorage = new JobsStorage();
module.exports = jobsStorage;