import { Link, NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Navbar.css';

const LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/profil', label: 'Profil' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo" aria-label="Formula Track, retour à l’accueil">
        <img src={logo} alt="Logo FT pour Formula Track en blanc et rouge avec contour noir." />
      </Link>

      <nav aria-label="Navigation principale">
        <ul className="navbar-links">
          {LINKS.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink to={to} end={end}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}