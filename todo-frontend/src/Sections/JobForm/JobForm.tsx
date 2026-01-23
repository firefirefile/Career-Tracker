import './JobForm.css'
import React from 'react';
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import {API_URL} from "../../constants/constants.ts";
import JobFormInput from "../../Components/JobFormInput";
import SelectDropDown from "../../Components/SelectDropDown";
import Button from "../../Components/Button";
import type {FormData} from "../../types/types.tsx";

const JobForm = () => {
    const navigate = useNavigate()

    const[formData, setFormData] = useState<FormData>({
        company: '',
        vacancyName: '',
        url: '',
        status: 'wait',
        comments: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await axios.post(API_URL, formData)
            navigate('/') // Возвращаемся на главную после успеха
        } catch (error) {
            console.error('Ошибка:', error)
            alert('Не удалось сохранить')
        }
    }
    return (
        <section className='job-form'>
            <h2>Новый отклик</h2>
            <form onSubmit={handleSubmit}>
                <JobFormInput label="Название компании"
                              isRequired
                              value={formData.company}
                              type='text'
                              onChange={(e) => setFormData({...formData, company: e.target.value})} />
                <JobFormInput label="Название вакансии"
                              isRequired
                              value={formData.vacancyName}
                              type='text'
                              onChange={(e) => setFormData({...formData, vacancyName: e.target.value})} />
                <JobFormInput label="Ссылка"
                              isRequired
                              value={formData.url}
                              type='text'
                              onChange={(e) => setFormData({...formData, url: e.target.value})} />
                <div className="job-form-input">
                <SelectDropDown value={formData.status} onChange={(value)  => setFormData({...formData, status: value as 'wait' | 'interview' | 'deny' | 'archive'})} />
                </div>
                    <JobFormInput isBig label="Комментарии" isRequired={false} value={formData.comments} type='text' onChange={(e) => setFormData({...formData, comments: e.target.value})} />
                <Button value='Отправить' type='submit' />
            </form>
        </section>

    )
}

export default JobForm