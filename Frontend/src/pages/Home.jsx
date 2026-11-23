import { useNavigate } from 'react-router-dom'
import Navbar from '../components/general/Navbar';

export default function Home() {
    // const navigate = useNavigate();

    return(
        <div className='homeDiv'>
            <Navbar />
        </div>    
    )
}