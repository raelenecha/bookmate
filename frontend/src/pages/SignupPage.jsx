import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../components/Request';
import '../styles/SignupPage.scss';

const Signup = () => {
    const { setHeaderProps } = useOutletContext();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        document.title = 'Bookmate | Sign Up';
        setHeaderProps({ showLogin: true, showLogout: false });
    }, []);

    // handle signup form submit
    const handleSignup = async (e) => {
        e.preventDefault();
        if (!e.target.checkValidity()) return alert('Please fill in all fields');
        if (password !== confirmPassword) return alert('Passwords do not match');
        // signup logic

        try {
            const form = new FormData(e.target);
            const signUp =  await api.post("/users", form);
            alert(signUp.data.message)
        } catch (err) {
            console.error(err);
            if (err.response?.data?.message.includes("E11000")) alert("Username already exists")
            else alert("Signup failed: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <form onSubmit={handleSignup} className='login'>
            <h2>Sign Up</h2>
            
            <label htmlFor="username">Username:</label>
            <input id="username" name='name' placeholder='Type in your username' autoComplete='name' type="text" />
            
            <label htmlFor="role">Role:</label>
            <select id="role" name='role'>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
            </select>
            
            <label htmlFor="password">Password:</label>
            <input id="password" name='password' placeholder='Type in your password' type="password" autoComplete='new-password' value={password} onChange={(e) => setPassword(e.target.value)} />
            
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input id="confirmPassword" placeholder='Re-type your password' type="password" autoComplete='off' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            
            <button>Sign Up</button>
        </form>
    );
};
export default Signup;