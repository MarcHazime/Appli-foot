import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../index.css';

import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const { t } = useLanguage();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
            login(res.data.token, res.data.userId, res.data.role);
            showToast('Login successful!', 'success');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            showToast('Login failed. Please check your credentials.', 'error');
        }
    };

    return (
        <div className="auth-container">
            <h2>{t.auth.loginTitle}</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder={t.auth.email} value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder={t.auth.password} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">{t.auth.loginBtn}</button>
            </form>
            <p>{t.auth.noAccount} <Link to="/register">{t.auth.registerLink}</Link></p>
        </div>
    );
};

export default Login;
