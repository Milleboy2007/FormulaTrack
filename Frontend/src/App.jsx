import { Routes, Route } from 'react-router-dom';
// import './App.css';
// import Home from './pages/Home';
// import Explore from './pages/Explore';
// import Profil from './pages/Profil';
// import Pilotes from '../src/components/PiloteCard';
import Compte from './pages/auth/Compte';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

export default function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<Home />} />
      <Route path="/pilotes" element={<Pilotes />} />
      <Route path="/profil" element={<Profil />} />
      <Route path="/explore" element={<Explore />} /> */}
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/compte" element={<Compte />} />
    </Routes>
  );
}