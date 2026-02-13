import  { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import type {Job} from './types/types.tsx';
import {API_URL} from "./constants/constants.ts";


import { Routes, Route, useNavigate } from 'react-router-dom';
import JobTable from "./Sections/JobTable";
import JobForm from "./Sections/JobForm";
import Header from "./Sections/Header";
import JobDetails from "./Sections/JobDetails";




function App() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    // Загрузить задачи при старте
    useEffect(() => {
        fetchJobs();
    }, []);


    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setJobs(response.data.data);
            setError(null);
        } catch (err) {
            setError('Не удалось загрузить задачи');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJobCreated = (newJob: Job) => {
        setJobs([...jobs, newJob]); // Добавляем новую вакансию
    };

    // const handleJobUpdated = (updatedJob: Job) => {
    //     setJobs(jobs.map(job =>
    //         job.id === updatedJob.id ? updatedJob : job
    //     )); // Обновляем вакансию
    // };
    //

    // const handleDeleteJob = async (jobId: number) => {
    //     if(window.confirm('Удалить эту вакансию?')) {
    //         try {
    //             await axios.delete(`${API_URL}/${jobId}`);
    //             setJobs(prevJobs => prevJobs.filter(job =>job.id !== jobId ))
    //
    //         }
    //         catch (err: any) {
    //
    //             alert(`Ошибка ${err.response?.status}: ${JSON.stringify(err.response?.data)}`);
    //         }
    //     }
    //
    // }

    const handleDeleteJob = async (jobId: number) => {
        if(window.confirm('Удалить эту вакансию?')) {
            try {
                console.log('=== НАЧАЛО УДАЛЕНИЯ ===');
                console.log('ID для удаления:', jobId);
                console.log('Тип ID:', typeof jobId);
                console.log('API_URL:', API_URL);

                const deleteUrl = `${API_URL}/${jobId}`;
                console.log('Полный URL для DELETE:', deleteUrl);

                console.log('Делаем DELETE запрос...');
                const response = await axios.delete(deleteUrl);

                console.log('✅ Успешный ответ:', response.data);

                setJobs(prevJobs => {
                    const newJobs = prevJobs.filter(job => job.id !== jobId);
                    console.log('Старые вакансии:', prevJobs.length);
                    console.log('Новые вакансии:', newJobs.length);
                    return newJobs;
                });

                console.log('=== УДАЛЕНИЕ ЗАВЕРШЕНО ===');
            }
            catch (err: any) {
                console.error('=== ОШИБКА УДАЛЕНИЯ ===');
                console.error('Сообщение:', err.message);
                console.error('Код:', err.code);

                if (err.response) {
                    console.error('Статус:', err.response.status);
                    console.error('Данные ответа:', err.response.data);
                    console.error('Заголовки:', err.response.headers);
                }

                if (err.request) {
                    console.error('Запрос был сделан, но нет ответа');
                    console.error('Запрос:', err.request);
                }

                console.error('Конфиг запроса:', {
                    url: err.config?.url,
                    method: err.config?.method,
                    headers: err.config?.headers
                });

                alert(`Ошибка ${err.response?.status || 'нет соединения'}: ${JSON.stringify(err.response?.data || err.message)}`);
            }
        }
    }

    const handleViewJobDetails = (jobId: number) => {

        // Находим вакансию в массиве
        const job = jobs.find(j => j.id === jobId);

        if (job) {
            navigate(`/job/${jobId}`, {
                state: { job }
            });
        } else {
            console.error('Вакансия не найдена:', jobId);

        }
    };


    if (loading) {
        return (
            <div className="app">
                <div className="loading">Загрузка вакансий...</div>
            </div>
        );
    }

    return (
        <div className="app">
            <Header />

            <main className="main">
                {error && (
                    <div className="error">
                        <p>{error}</p>
                        <button onClick={fetchJobs}>Повторить</button>
                    </div>
                )}
                <Routes>
                    {/* Главная - таблица */}
                    <Route
                        path="/"
                        element={
                            <JobTable
                                jobs={jobs}
                                onDeleteJob={handleDeleteJob}
                                onViewJobDetails={handleViewJobDetails}

                            />
                        }
                    />

                    <Route
                        path="/job/:id"
                        element={
                        <JobDetails />}

                    />

                    {/* Форма создания */}
                    <Route
                        path="/create"
                        element={
                        <div className="app-create">
                            <JobForm
                                onCreate={handleJobCreated}
                            />
                        </div>
                        }
                    />

                </Routes>

            </main>

            <footer className="footer">
                <p>
                    <strong>Backend:</strong> Express на localhost:3000
                </p>
                <p>
                    <strong>Frontend:</strong> React на localhost:5173
                </p>
                <button onClick={fetchJobs} className="refresh-button">
                    Обновить список
                </button>
            </footer>
        </div>
    );
}

export default App;