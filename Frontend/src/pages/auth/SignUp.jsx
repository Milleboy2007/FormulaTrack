import { useState } from 'react';
import './SignUp.css';

const SIGNUP_FIELDS = [
  { name: 'firstName', type: 'text', placeholder: 'Prénom' },
  { name: 'lastName', type: 'text', placeholder: 'Nom' },
  { name: 'email', type: 'email', placeholder: 'Email' },
  { name: 'password', type: 'password', placeholder: 'Mot de passe' },
  { name: 'confirmPassword', type: 'password', placeholder: 'Confirmer le mot de passe' },
];

export default function SignUp({ onSignup, onSignin, message }) {
  const [signin, setSignin] = useState({ email: '', password: '' });

  function handleSignup(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));

    if (f.password !== f.confirmPassword) {
      alert('Les mots de passe ne sont pas identiques.');
      return;
    }

    onSignup({
      name: `${f.firstName} ${f.lastName}`.trim(),
      email: f.email,
      password: f.password,
      preferencesOlfactives: f.preferencesOlfactives,
    });
  }

  function handleSignin(e) {
    e.preventDefault();
    onSignin(signin);
  }

  const updateSignin = (e) => setSignin({ ...signin, [e.target.name]: e.target.value });

  return (
    <main className="account-page">
      <div className="account-box">
        <div className="account-image"></div>

        <div className="account-forms">
          {message && <p className="account-message">{message}</p>}

          <section className="account-card">
            <h2 className="titre">Créer un compte</h2>

            <form onSubmit={handleSignup} className="form">
              {SIGNUP_FIELDS.map((field) => (
                <input key={field.name} required {...field} />
              ))}


              <button type="submit" className="btn-principal">
                Créer un compte
              </button>
            </form>
          </section>

          <section className="account-card">
            <h2 className="titre">Connexion</h2>

            <form onSubmit={handleSignin} className="form">
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={signin.email}
                onChange={updateSignin}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Mot de passe"
                value={signin.password}
                onChange={updateSignin}
                required
              />

              <button type="submit" className="btn-principal">
                Se connecter
              </button>

              {/* <div className="profils-demo">
                {DEMO_PROFILES.map(({ label, img, email, password }) => (
                  <button
                    key={label}
                    type="button"
                    className="profil-demo"
                    onClick={() => setSignin({ email, password })}
                  >
                    <img src={img} alt={label} />
                    <p>{label}</p>
                  </button>
                ))}
              </div> */}
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}