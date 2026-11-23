import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import './Pilotes.css';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
});

/*
  Format attendu de GET /drivers :
  [{ id, name, team, color, points, wins, podiums }]
  - color : couleur de l’écurie en hexadécimal (ex. "#DC0000")
*/

function DriverRow({ driver, position, leaderPoints, isOpen, onToggle }) {
  const gap = leaderPoints - driver.points;

  return (
    <li className="driver">
      <button
        className="driver-row"
        style={{ '--team': driver.color }}
        aria-expanded={isOpen}
        aria-controls={`stats-${driver.id}`}
        onClick={onToggle}
      >
        <span className="driver-pos">{position}</span>
        <span className="driver-bar" aria-hidden="true" />
        <span className="driver-who">
          <strong>{driver.name}</strong>
          <small>{driver.team}</small>
        </span>
        <span className="driver-gap">{position === 1 ? 'Leader' : `−${gap}`}</span>
        <span className="driver-pts">{driver.points}</span>
      </button>

      {isOpen && (
        <div id={`stats-${driver.id}`} className="driver-stats" style={{ '--team': driver.color }}>
          <div className="driver-meter" aria-hidden="true">
            <span style={{ width: `${(driver.points / leaderPoints) * 100}%` }} />
          </div>
          <dl>
            <div>
              <dt>Victoires</dt>
              <dd>{driver.wins}</dd>
            </div>
            <div>
              <dt>Podiums</dt>
              <dd>{driver.podiums}</dd>
            </div>
            <div>
              <dt>Retard sur le leader</dt>
              <dd>{gap} pts</dd>
            </div>
          </dl>
        </div>
      )}
    </li>
  );
}

export function DriverList({ drivers }) {
  const [openId, setOpenId] = useState(null);
  const sorted = [...drivers].sort((a, b) => b.points - a.points);
  const leaderPoints = sorted[0]?.points ?? 0;

  return (
    <ol className="driver-list" aria-label="Classement des pilotes">
      {sorted.map((driver, i) => (
        <DriverRow
          key={driver.id}
          driver={driver}
          position={i + 1}
          leaderPoints={leaderPoints}
          isOpen={openId === driver.id}
          onToggle={() => setOpenId(openId === driver.id ? null : driver.id)}
        />
      ))}
    </ol>
  );
}

export default function Pilotes() {
  const [drivers, setDrivers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/drivers')
      .then((res) => setDrivers(res.data))
      .catch(() => setError('Impossible de charger les pilotes. Réessayez dans un instant.'));
  }, []);

  return (
    <>
      <Navbar />
      <main className="pilotes-page">
        <h1>Pilotes</h1>
        {error && <p className="pilotes-msg">{error}</p>}
        {!drivers && !error && <p className="pilotes-msg">Chargement des pilotes…</p>}
        {drivers?.length === 0 && <p className="pilotes-msg">Aucun pilote pour le moment.</p>}
        {drivers?.length > 0 && <DriverList drivers={drivers} />}
      </main>
      <Footer />
    </>
  );
}