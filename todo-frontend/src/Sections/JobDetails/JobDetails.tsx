
import './JobDetails.css'
import {Link, useLocation} from "react-router-dom";
import type {Job} from "../../types/types.tsx";
// import SelectDropDown from "../../Components/SelectDropDown";

const JobDetails = () => {
 const location = useLocation()
    const job =location.state?.job as Job

    if (!job) {
        return (
            <div className="job-details">
                <div className="job-not-found">
                    <h2>Вакансия не найдена</h2>
                    <p>Пожалуйста, перейдите из списка вакансий</p>
                    <Link to="/">← Назад к списку</Link>
                </div>
            </div>
        );
    }
  
  return (
    <div
        className="job-details"
     >
      <div className="job-details--header">
          <Link to="/">Назад к списку</Link>
          <div className="job-details--header-actions">
              <p>Тут будут кнопки редактировать и удалить</p>
          </div>
      </div>
        <div className="job-details--main">
            <div className="job-details--main-info">
                <h1>{job.vacancyName}</h1>
                <p><a href={job.url}>Ссылка</a></p>
            </div>
            <div className="job-details--main-company">
                <p>{job.company}</p>
            </div>
            {/*<div className="job-details--main-status">*/}
            {/*    <SelectDropDown value={job.status} onChange={console.log('Че блядь делать')} />*/}
            {/*</div>*/}
            <div className="job-details--main-comments">
                {job.comments}
            </div>
        </div>
    </div>
)
}

export default JobDetails