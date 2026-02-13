import './JobTableRow.css'
import type { JobStatus,  JobTableRowProps} from '../../types/types.tsx'
import SelectDropDown from "../SelectDropDown";
import {useState} from "react";
import axios from "axios";
import {API_URL} from "../../constants/constants.ts";
import Button from "../Button";

const JobTableRow = ({ job, onDelete, onView, index }: JobTableRowProps) => {

    const [status, setStatus] = useState(job.status)

    const handleStatusChange = async (newStatus: JobStatus) => {
        setStatus(newStatus);
        try {
            await  axios.put(`${API_URL}/${job.id}`, {status: newStatus});
        } catch (error) {
            setStatus(job.status)
        }
    }

    const handleDeleteClick = () => {
        if(onDelete) {
            onDelete(job.id);
        }
    }

    const  handleOnView = () => {
        if (onView) {
            onView(job.id)
        }
    }
    return (
        <tr className='job-table-row'>
            <td>{index + 1}</td>
            <td>{job.company}</td>
            <td>
                <a href={job.url} target='_blank'>
                    {job.vacancyName}
                </a>
            </td>
            <td>{new Date(job.createdAt).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit'
            })}</td>

            <td>
                <SelectDropDown value={status} onChange={handleStatusChange}></SelectDropDown>
            </td>
            <td>
                {job.comments}
                {/*<ul>*/}
                {/*    {job.comments?.map((comment, index) => (*/}
                {/*        <li key={index}>*/}
                {/*            <p>{comment}</p>*/}
                {/*        </li>*/}
                {/*    ))}*/}
                {/*</ul>*/}
            </td>
            <td className="actions-cell">
                <Button value='Удалить вакансию' type='button'
                onClick={handleDeleteClick}
                />
                <Button value='Подробнее' type='button'
                onClick={handleOnView}/>
            </td>
        </tr>
    )
}

export default JobTableRow