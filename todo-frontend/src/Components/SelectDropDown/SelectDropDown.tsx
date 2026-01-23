import './SelectDropDown.css'
import type { JobStatus, SelectDropDownProps } from "../../types/types.tsx";



const SelectDropDown = ({
                            value,
                            onChange,
                        }: SelectDropDownProps) => {

    const  statusClasses: Record<string, string> = {
        wait: 'status-wait',
        interview: 'status-interview',
        deny: 'status-deny',
        archive: 'status-archive'

    }

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as JobStatus)}  // ← as JobStatus
            className={`select-drop-down ${statusClasses[value] || ''}` }
        >
            <option value='interview'>Собеседование</option>
            <option value='wait'>Откликнулся/ Жду ОС</option>
            <option value='deny'>Отказ</option>
            <option value='archive'>Архив</option>
        </select>
    );
};

export default SelectDropDown;