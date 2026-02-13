import React from "react";

export interface Job {
    id: number;
    company: string;
    vacancyName:string;
    url: string;
    status: JobStatus;
    createdAt: string;
    updatedAt?: string
    comments?:string
}

export interface SelectDropDownProps {
    value: JobStatus;
    onChange: (value: JobStatus) => void;
}

export interface ButtonProps {
    value: string;
    onClick?: () => void;
    type: 'button' | 'submit';

}

export interface  JobFormInputProps {
    label: string;
    isRequired: boolean;
    value:string;
    type:string;
    onChange: (e:React.ChangeEvent<HTMLInputElement>) => void;
    isBig?: boolean;
    ref?: HTMLInputElement;

}

export interface FormData {
    company: string;
    vacancyName:string;
    url: string;
    status: JobStatus;
    comments:string;
    createdAt: string;
}

export interface JobTableProps {
    jobs: Job[] ;
    onDeleteJob: (jobId: JobId) => void;
    onViewJobDetails: (jobId: JobId) => void;
}

export interface JobFormProps {
    onCreate?:(job: Job) => void;
}

export interface JobTableRowProps {
    job: Job;
    onDelete: (jobId: JobId) => void;
    onView: (jobId: JobId) => void;
    index: number;
}

export type JobStatus = 'interview' | 'wait' | 'deny' | 'archive';
export type JobId = number