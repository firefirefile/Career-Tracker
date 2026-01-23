import './Button.css'
import type {ButtonProps} from "../../types/types.tsx";

const Button = (props:ButtonProps) => {
    const {
        value,
        onClick,
        type
    } = props

    return (
        <button className='button'
                onClick={onClick}
                type={type}
        > {value}</button>
    )
}

export default Button