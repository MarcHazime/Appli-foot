import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/search?q=${searchTerm}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setResults(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="dashboard-container">
            <h1>{t.dashboard.welcome}, {user.firstName || user.clubName}!</h1>

            <div className="search-section">
                <h2>{t.dashboard.searchTitle}</h2>
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder={t.dashboard.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>
            </div>

            <div className="results-section">
                {results.length === 0 && <p>{t.dashboard.noResults}</p>}
                {results.map((u) => (
                    <div key={u.id} className="card">
                        <h3>{u?.role === 'PLAYER' ? `${u?.playerProfile?.firstName} ${u?.playerProfile?.lastName}` : u?.clubProfile?.clubName}</h3>
                        <p>{u.role}</p>
                        <p>{u.role === 'PLAYER' ? u?.playerProfile?.location : u?.clubProfile?.location}</p>
                        <Link to={`/user/${u.id}`} className="view-profile-btn">{t.dashboard.viewProfile}</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
