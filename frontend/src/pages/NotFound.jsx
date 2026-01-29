import '../styles/NotFound.scss';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not_found">
            <h1>404</h1>
            <h2>Page not found</h2>
            <p>Hmm... this page seems to be missing from our shelves</p>

            <button onClick={() => navigate(-1)}>Take me back!</button>
        </div>
    );
}

export default NotFound;