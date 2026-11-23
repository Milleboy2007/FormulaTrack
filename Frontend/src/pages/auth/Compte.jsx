import { useEffect, useState } from 'react';
import axios from 'axios';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Navbar from '../../components/general/Navbar';
import Footer from '../../components/general/Footer';
import './Compte.css';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/users',
  withCredentials: true,
});

const notifyAuthChange = () => window.dispatchEvent(new Event('auth-change'));

export default function Compte() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/whoami')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function authRequest(path, payload, fallbackError) {
    setMessage('');
    try {
      const res = await api.post(path, payload);
      setUser(path === '/signout' ? null : res.data);
      notifyAuthChange();
    } catch (err) {
      setMessage(err?.response?.data?.message || fallbackError);
    }
  }

  const handleSignup = (data) => authRequest('/signup', data, 'Impossible de créer le compte.');
  const handleSignin = (data) => authRequest('/signin', data, 'Impossible de se connecter.');
  const handleSignout = () => authRequest('/signout', {}, 'Impossible de se déconnecter.');

  return (
    <>
      <Navbar user={user} />
      <div className="compte-page">
        <div className="compte-container">
          {!loading &&
            (user ? (
              <SignIn user={user} message={message} onSignout={handleSignout} />
            ) : (
              <SignUp message={message} onSignup={handleSignup} onSignin={handleSignin} />
            ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
