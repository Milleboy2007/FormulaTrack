import { useNavigate } from 'react-router-dom'
import Navbar from '../components/general/Navbar';
import Compte from './auth/Compte';
import Profil from './Profil';
import Pilotes from '../components/PiloteCard';

export default function Home() {
    // const navigate = useNavigate();

    return(
        <div className='homeDiv'>
            <Navbar />
            <PiloteCard />
            {/* <Profil />
            <Compte/> */}
        </div>    
    )
}