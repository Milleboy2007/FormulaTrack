import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/general/Navbar';
import Footer from '../components/general/Footer';
import './Profil.css';

/* ------------------------------------------------------------------
   API de l’app. À ADAPTER avec l’équipe backend :
   - PUT    /users/profile    { name, email }               -> renvoie l’utilisateur à jour
   - PUT    /users/favorites  { drivers, circuits, races }  -> listes d’identifiants OpenF1
   - DELETE /users/profile
   L’utilisateur (GET /users/whoami) doit contenir : name, email, admin,
   bestScore (nombre) et favorites ({ drivers: [], circuits: [], races: [] }).
------------------------------------------------------------------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/users',
  withCredentials: true,
});

const userApi = {
  update: (data) => api.put('/profile', data),
  saveFavorites: (favorites) => api.put('/favorites', favorites),
  remove: () => api.delete('/profile'),
};

const notifyAuthChange = () => window.dispatchEvent(new Event('auth-change'));

/* ------------------------------------------------------------------
   OpenF1 : pilotes de la dernière session, courses et circuits de l’année
------------------------------------------------------------------- */
const OPENF1 = 'https://api.openf1.org/v1';

async function getList(path) {
  const res = await fetch(`${OPENF1}${path}`);
  if (!res.ok) throw new Error('OpenF1');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

const uniqueBy = (list, key) => [...new Map(list.map((x) => [x[key], x])).values()];
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });

function useOpenF1() {
  const [state, setState] = useState({ options: null, error: false });

  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([getList('/drivers?session_key=latest'), getList(`/meetings?year=${year}`)])
      .then(([drivers, meetings]) => {
        setState({
          error: false,
          options: {
            drivers: uniqueBy(drivers, 'driver_number').map((d) => ({
              id: d.driver_number,
              title: d.full_name,
              sub: d.team_name,
              image: d.headshot_url,
              color: `#${d.team_colour}`,
            })),
            circuits: uniqueBy(meetings, 'circuit_key').map((m) => ({
              id: m.circuit_key,
              title: m.circuit_short_name,
              sub: `${m.location}, ${m.country_name}`,
              image: m.circuit_image,
            })),
            races: meetings
              .filter((m) => !m.is_cancelled)
              .map((m) => ({
                id: m.meeting_key,
                title: m.meeting_name,
                sub: fmtDate(m.date_start),
                image: m.country_flag,
              })),
          },
        });
      })
      .catch(() => setState({ options: null, error: true }));
  }, []);

  return state;
}

/* ------------------------------------------------------------------ */

function ProfileCard({ user, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [message, setMessage] = useState('');

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function cancel() {
    setForm({ name: user.name, email: user.email });
    setEditing(false);
    setMessage('');
  }

  async function save(e) {
    e.preventDefault();
    setMessage('');
    try {
      const res = await userApi.update(form);
      onSaved(res.data);
      setEditing(false);
      notifyAuthChange();
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Impossible d’enregistrer les modifications.');
    }
  }

  return (
    <section className="card profil-card">
      <div className="profil-head">
        <img src={user.admin ? '/vampp.jpeg' : '/sora.jpg'} alt="Photo de profil" />
        <div>
          <h2>{user.name}</h2>
          <small>{user.admin ? 'ADMIN' : 'UTILISATEUR'}</small>
        </div>
      </div>

      <form onSubmit={save} className="profil-form">
        <label>
          Nom
          <input name="name" value={form.name} onChange={update} readOnly={!editing} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={update} readOnly={!editing} required />
        </label>

        {message && <p className="msg">{message}</p>}

        {editing ? (
          <div className="btn-row">
            <button type="submit" className="btn">Enregistrer</button>
            <button type="button" className="btn ghost" onClick={cancel}>Annuler</button>
          </div>
        ) : (
          <button type="button" className="btn" onClick={() => setEditing(true)}>
            Modifier mon profil
          </button>
        )}
      </form>
    </section>
  );
}

function ScoreCard({ score }) {
  return (
    <section className="card score-card">
      <small>Meilleur score</small>
      <strong>{score ?? '—'}</strong>
    </section>
  );
}

const TABS = [
  { id: 'drivers', label: 'Pilotes', add: 'Ajouter un pilote' },
  { id: 'circuits', label: 'Circuits', add: 'Ajouter un circuit' },
  { id: 'races', label: 'Courses', add: 'Ajouter une course' },
];

function Favorites({ initial }) {
  const f1 = useOpenF1();
  const [tab, setTab] = useState('drivers');
  const [favs, setFavs] = useState({ drivers: [], circuits: [], races: [], ...initial });
  const [error, setError] = useState('');

  const current = TABS.find((t) => t.id === tab);
  const options = f1.options?.[tab] ?? [];
  const chosen = favs[tab];
  const items = chosen.map((id) => options.find((o) => o.id === id)).filter(Boolean);
  const available = options.filter((o) => !chosen.includes(o.id));

  async function change(ids) {
    const previous = favs;
    const next = { ...favs, [tab]: ids };
    setFavs(next);
    setError('');
    try {
      await userApi.saveFavorites(next);
    } catch {
      setFavs(previous);
      setError('Impossible d’enregistrer vos favoris.');
    }
  }

  return (
    <section className="card">
      <h2 className="section-title">Mes favoris</h2>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label} ({favs[t.id].length})
          </button>
        ))}
      </div>

      {f1.error && <p className="msg">Impossible de charger les données OpenF1. Réessayez plus tard.</p>}
      {!f1.options && !f1.error && <p className="muted">Chargement des données F1…</p>}

      {f1.options && (
        <>
          <select
            value=""
            onChange={(e) => e.target.value && change([...chosen, Number(e.target.value)])}
            aria-label={current.add}
          >
            <option value="">{current.add}…</option>
            {available.map((o) => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>

          {items.length === 0 && <p className="muted">Aucun favori pour le moment.</p>}

          <ul className="fav-list">
            {items.map((o) => (
              <li key={o.id} className="fav" style={{ '--team': o.color ?? 'var(--ink)' }}>
                <span className="fav-bar" aria-hidden="true" />
                <img src={o.image} alt="" />
                <span className="fav-who">
                  <strong>{o.title}</strong>
                  <small>{o.sub}</small>
                </span>
                <button aria-label={`Retirer ${o.title}`} onClick={() => change(chosen.filter((id) => id !== o.id))}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {error && <p className="msg">{error}</p>}
    </section>
  );
}

function DangerZone({ onDeleted }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  async function remove() {
    setError('');
    try {
      await userApi.remove();
      onDeleted();
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de supprimer le compte.');
    }
  }

  return (
    <section className="card danger">
      <h2 className="section-title">Supprimer mon compte</h2>
      {confirming ? (
        <>
          <p>Cette action est définitive. Votre profil et vos favoris seront perdus.</p>
          <div className="btn-row">
            <button className="btn alert" onClick={remove}>Oui, supprimer</button>
            <button className="btn ghost" onClick={() => setConfirming(false)}>Annuler</button>
          </div>
        </>
      ) : (
        <button className="btn alert" onClick={() => setConfirming(true)}>Supprimer mon compte</button>
      )}
      {error && <p className="msg">{error}</p>}
    </section>
  );
}

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get('/whoami')
      .then((res) => setUser(res.data))
      .catch(() => navigate('/compte'));
  }, [navigate]);

  function handleDeleted() {
    notifyAuthChange();
    navigate('/compte');
  }

  return (
    <>
      <Navbar user={user} />
      <main className="profil-page">
        <h1>Mon profil</h1>
        {!user ? (
          <p className="muted">Chargement…</p>
        ) : (
          <div className="profil-layout">
            <div className="profil-top">
              <ProfileCard user={user} onSaved={setUser} />
              <ScoreCard score={user.bestScore} />
            </div>
            <Favorites initial={user.favorites} />
            <DangerZone onDeleted={handleDeleted} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}