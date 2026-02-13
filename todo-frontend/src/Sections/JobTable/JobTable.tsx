import './JobTable.css'
import JobTableRow from "../../Components/JobTableRow";
import type {Job, JobTableProps} from "../../types/types.tsx";

const JobTable = ({jobs, onDeleteJob, onViewJobDetails} : JobTableProps) => {


    return (
        <>

            <table className="job-table">
                <thead>

                <tr className="job-table--th">
                    <th>№</th>
                    <th>Company</th>
                    <th>VacancyName</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Comments</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {jobs.map((job:Job, index: number) => (
                    <JobTableRow job={job}
                                 onDelete={onDeleteJob}
                                 onView={onViewJobDetails}
                                 index={index}
                                 key={job.id}
                    />
                ))}
                </tbody>

            </table>
        </>
    )
}

export default JobTable