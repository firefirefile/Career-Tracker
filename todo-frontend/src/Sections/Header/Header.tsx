import './Header.css'
import { Link} from 'react-router-dom';

const Header = () => {


    return (
        <header className="header">
            <h1>HeadHunter hunter</h1>
            <nav className="header-nav">
                <ul className="header-nav-list">
                    <li> <Link className="header-nav-item" to="/"> Список</Link></li>
                    <li><Link className="header-nav-item" to="/create" > Добавить </Link></li>
                </ul>
            </nav>
        </header>
    )
}

export default Header