import './JobForm.css'
import React from 'react';
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import {API_URL, BACKEND_URL} from "../../constants/constants.ts";
import JobFormInput from "../../Components/JobFormInput";
import SelectDropDown from "../../Components/SelectDropDown";
import Button from "../../Components/Button";
import type {FormData, JobFormProps} from "../../types/types.tsx";

const JobForm = ({ onCreate }: JobFormProps) => {
    const navigate = useNavigate()
    const [isParsing, setIsParsing] = useState(false)
    const [parseError, setParseError] = useState<string | null>(null)
    const [parseSuccess, setParseSuccess] = useState(false)

    const[formData, setFormData] = useState<FormData>({
        company: '',
        vacancyName: '',
        url: '',
        status: 'wait',
        comments: '',
        createdAt: new Date().toISOString().split('T')[0],
    })

    // Функция парсинга вакансии
    const parseVacancy = useCallback(async (url: string) => {
        if (!url || !url.includes('hh.ru/vacancy/')) {
            setParseError('Введите ссылку на вакансию HH.ru')
            return
        }

        setIsParsing(true)
        setParseError(null)

        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/parser/hh-simple`,
                { url: url },
                { timeout: 10000 }
            );

            if (response.data.success) {
                const { vacancyName, company } = response.data.data

                setFormData(prev => ({
                    ...prev,
                    vacancyName: vacancyName || prev.vacancyName,
                    company: company || prev.company,
                    url: url
                }))
                setParseSuccess(true)

                setTimeout(() => {
                    setParseSuccess(false)
                }, 3000)
            } else {
                setParseError(response.data.error || 'Не удалось распарсить вакансию')
            }
        } catch (error: any) {
            console.error('Ошибка парсинга:', error)

            let errorMessage = 'Не удалось загрузить данные вакансии'
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Таймаут запроса. Попробуйте позже.'
            } else if (error.response?.status === 404) {
                errorMessage = 'Сервис парсинга недоступен. Проверьте бэкенд.'
            } else if (error.response?.status === 500) {
                errorMessage = 'Ошибка сервера при парсинге'
            }

            setParseError(errorMessage)
        } finally {
            setIsParsing(false)
        }
    }, [])

    // Автопарсинг при вставке ссылки
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.url &&
                formData.url.includes('hh.ru/vacancy/') &&
                (!formData.company || !formData.vacancyName)) {
                parseVacancy(formData.url)
            }
        }, 1500)

        return () => clearTimeout(timer)
    }, [formData.url, formData.company, formData.vacancyName, parseVacancy])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Проверяем обязательные поля
        if (!formData.company.trim() || !formData.vacancyName.trim()) {
            alert('Заполните название компании и вакансии')
            return
        }

        try {
            const response = await axios.post(API_URL, formData)
            navigate('/')
            if (onCreate && response.data.data) {
                onCreate(response.data.data);
            }
        } catch (error) {
            console.error('Ошибка:', error)
            alert('Не удалось сохранить')
        }
    }

    // Функция для ручного парсинга по кнопке
    const handleParseClick = async () => {
        if (!formData.url) {
            setParseError('Введите URL вакансии')
            return
        }
        await parseVacancy(formData.url)
    }

    // Обработчик изменения URL
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value
        setFormData(prev => ({ ...prev, url: newUrl }))

        // Сбрасываем сообщения при изменении URL
        setParseError(null)
        setParseSuccess(false)
    }

    // Обработчик для кнопки "Вставить ссылку и спарсить"
    const handlePasteAndParse = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (text.includes('hh.ru/vacancy/')) {
                setFormData(prev => ({ ...prev, url: text }))
                setTimeout(() => {
                    parseVacancy(text)
                }, 100)
            } else {
                setParseError('В буфере обмена нет ссылки на вакансию HH.ru')
            }
        } catch (error) {
            console.error('Ошибка чтения буфера обмена:', error)
            setParseError('Не удалось получить ссылку из буфера обмена')
        }
    }

    return (
        <section className='job-form'>
            <h2>Новый отклик</h2>
            <form onSubmit={handleSubmit}>
                {/* Секция для URL с парсингом */}
                <div className="url-section">


                        <JobFormInput
                            label="Ссылка на вакансию"
                            isRequired
                            value={formData.url}
                            type='text'
                            onChange={handleUrlChange}
                        />

                    <div className="url-input-group">


                        <div className="parse-buttons">
                            <button
                                type="button"
                                onClick={handleParseClick}
                                disabled={isParsing || !formData.url}
                                className="parse-button"
                            >
                                {isParsing ? 'Загрузка...' : 'Заполнить автоматически'}
                            </button>

                            <button
                                type="button"
                                onClick={handlePasteAndParse}
                                disabled={isParsing}
                                className="paste-button"
                            >
                                Вставить ссылку
                            </button>
                        </div>
                    </div>

                    {/* Сообщения об ошибках/успехе */}
                    {parseError && (
                        <div className="parse-message error">
                             {parseError}
                        </div>
                    )}

                    {parseSuccess && (
                        <div className="parse-message success">
                            Данные вакансии загружены!
                        </div>
                    )}

                    {isParsing && (
                        <div className="parse-message loading">
                            Загружаем данные с HH.ru...
                        </div>
                    )}
                </div>

                {/* Поля формы */}
                <JobFormInput
                    label="Название компании"
                    isRequired
                    value={formData.company}
                    type='text'

                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                />

                <JobFormInput
                    label="Название вакансии"
                    isRequired
                    value={formData.vacancyName}
                    type='text'

                    onChange={(e) => setFormData({...formData, vacancyName: e.target.value})}
                />

                <JobFormInput
                    label="Дата отклика"
                    isRequired={false}
                    value={formData.createdAt}
                    type='date'
                    onChange={(e) => setFormData({...formData, createdAt: e.target.value})}
                />

                <div className="job-form-input">
                    <SelectDropDown
                        value={formData.status}
                        onChange={(value) => setFormData({...formData, status: value as 'wait' | 'interview' | 'deny' | 'archive'})}
                    />
                </div>

                <JobFormInput
                    isBig
                    label="Комментарии"
                    isRequired={false}
                    value={formData.comments}
                    type='text'
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                />

                <Button value='Сохранить отклик' type='submit' />
            </form>
        </section>
    )
}

export default JobForm