import './SignIn.css';

export default function SignIn({ user, message, onSignout }) {
  const photo = user.admin ? '/vampp.jpeg' : '/sora.jpg';

  return (
    <section className="compte-connecte">
      <div className="profil-connecte">
        <img src={photo} alt="Photo de profil" />

        <div>
          <p>
            Connecté en tant que <strong>{user.name}</strong>
          </p>
          <h2>{user.admin ? 'ADMIN' : 'UTILISATEUR'}</h2>
          <button onClick={onSignout}>Se déconnecter</button>
        </div>
      </div>

      {message && <p className="message-compte">{message}</p>}

      <div className="infos-compte">
        <h2>Infos du compte</h2>
        <p><span>Email:</span> {user.email}</p>
        <p><span>Préférence:</span> {user.preference?.name || 'Non renseignée'}</p>
      </div>
    </section>
  );
}