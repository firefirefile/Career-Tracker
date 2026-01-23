import './JobFormInput.css'
import type {JobFormInputProps} from "../../types/types.tsx";

const JobFormInput = (props: JobFormInputProps) => {
const {
    label,
    isRequired = true,
    value,
    type,
    onChange,
    isBig = false,

} = props

    return (
        <div className={`job-form-input ${isBig ? 'is-big' : ''}`}>
            <label>{label}</label>
            <input
                type={type}
                required={isRequired}
                value={value}
                onChange={(e) => onChange(e)}



            />
        </div>

    )
}

export default JobFormInput