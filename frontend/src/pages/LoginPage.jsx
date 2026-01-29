import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../components/Request';
import { useAuth } from '../components/UserAuth';
import '../styles/LoginPage.scss';

const Login = () => {
    const { login, user, loading } = useAuth();
    const { setHeaderProps } = useOutletContext();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (loading) return;
        if (user) return navigate("/home");
        document.title = "Bookmate | Login";
        setHeaderProps({ showSignup: true, showLogout: false });
    }, [user, loading]);

    // handle login form submit
    const handleLogin = async (e) => {
        e.preventDefault();

        if (username.trim() === "" || password.trim() === "") return alert("Please fill in all fields");
        if (e.target.checkValidity() === false) return alert("Please fill in all fields correctly");

        try {
            const res = await api.post("/users/login", {
                name: username,
                password: password
            });

            login(res.data.token);
            navigate("/home");
        } catch (err) {
            console.error(err);
            alert("Login failed: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return;

    return (
        <form onSubmit={handleLogin} className='login'>
            <h2>Login</h2>
            <label htmlFor="username">Username:</label>
            <input id="username" placeholder='Type in your username' type="text" onChange={(e) => setUsername(e.target.value)} autoComplete='username' required />
            <label htmlFor="password">Password:</label>
            <input id="password" placeholder='Type in your password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current-password' required />
            <button>Login</button>
        </form>
    );
};
export default Login;