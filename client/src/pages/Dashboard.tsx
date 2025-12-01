import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import { useLanguage } from '../context/LanguageContext';

interface SearchResult {
    id: string;
    role: string;
    playerProfile?: {
        firstName: string;
        lastName: string;
        location: string;
    };
    clubProfile?: {
        clubName: string;
        location: string;
    };
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [results, setResults] = useState<SearchResult[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/search?q=${searchTerm}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (Array.isArray(res.data)) {
                setResults(res.data);
            } else {
                console.error("API returned non-array:", res.data);
                setResults([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return null;

    return (
        <div className="dashboard-container">
            <h1>{t.dashboard.welcome}, {(user as any).firstName || (user as any).clubName}!</h1>

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
                        <h3>{u.role === 'PLAYER' ? `${u.playerProfile?.firstName} ${u.playerProfile?.lastName}` : u.clubProfile?.clubName}</h3>
                        <p>{u.role}</p>
                        <p>{u.role === 'PLAYER' ? u.playerProfile?.location : u.clubProfile?.location}</p>
                        <Link to={`/user/${u.id}`} className="view-profile-btn">{t.dashboard.viewProfile}</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
