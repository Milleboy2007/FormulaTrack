import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// import Explore from './pages/Explore';
// import Profil from './pages/Profil';
// import Pilotes from '../src/components/PiloteCard';
import Compte from './pages/auth/Compte';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/compte" element={<Compte />} />
      {/* <Route path="/pilotes" element={<Pilotes />} /> */}
      {/* <Route path="/profil" element={<Profil />} /> */}
      {/* <Route path="/explore" element={<Explore />} /> */}
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      
      
    </Routes>
  );
}