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

    const handleDeleteJob = async (jobId: number) => {
        if(window.confirm('Удалить эту вакансию?')) {
            try {
                console.log(`URL запроса: ${API_URL}/${jobId}`);
                await axios.delete(`${API_URL}/${jobId}`);


                setJobs(prevJobs => prevJobs.filter(job =>job.id !== jobId ))

            }
            catch (err: any) {

                alert(`Ошибка ${err.response?.status}: ${JSON.stringify(err.response?.data)}`);
            }
        }

    }

    const handleViewJobDetails = (jobId: number) => {
        console.log('Открываем детали вакансии ID:', jobId);

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
                                onChange={handleJobCreated}
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