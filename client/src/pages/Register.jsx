import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'PLAYER',
        firstName: '',
        lastName: '',
        clubName: '',
        city: ''
    });
    const { login } = useContext(AuthContext);
    const { t } = useLanguage();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData);
            console.log("reponse du register", res.data);
            login(res.data.token, res.data.userId, res.data.role);
            showToast(`Registration successful! Role: ${res.data.role}`, 'success');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            showToast('Registration failed. Please try again.', 'error');
        }
    };

    return (
        <div className="auth-container">
            <h2>{t.auth.registerTitle}</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder={t.auth.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder={t.auth.password} onChange={handleChange} required />
                <select name="role" onChange={handleChange} value={formData.role}>
                    <option value="PLAYER">{t.auth.player}</option>
                    <option value="CLUB">{t.auth.club}</option>
                </select>

                {formData.role === 'PLAYER' && (
                    <>
                        <input type="text" name="firstName" placeholder={t.auth.firstName} onChange={handleChange} required />
                        <input type="text" name="lastName" placeholder={t.auth.lastName} onChange={handleChange} required />
                    </>
                )}

                {formData.role === 'CLUB' && (
                    <input type="text" name="clubName" placeholder={t.auth.clubName} onChange={handleChange} required />
                )}

                <input type="text" name="city" placeholder={t.auth.city} onChange={handleChange} required />

                <button type="submit">{t.auth.registerBtn}</button>
            </form>
            <p>{t.auth.hasAccount} <Link to="/login">{t.auth.loginLink}</Link></p>
        </div>
    );
};

export default Register;
