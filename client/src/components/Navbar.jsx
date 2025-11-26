import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      if (user) {
        try {
          const res = await axios.get('http://localhost:3000/api/messages/unread', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setUnreadCount(res.data.count);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchUnread();
    // Poll every 10 seconds
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/dashboard">Football Match</Link>
      <div className="navbar-links">
        <Link to="/dashboard">{t.nav.dashboard}</Link>
        <Link to="/map">{t.nav.map}</Link>
        <Link to="/messages" style={{ position: 'relative' }}>
          {t.nav.messages}
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-10px',
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '10px'
            }}>
              {unreadCount}
            </span>
          )}
        </Link>
        <Link to="/profile">{t.nav.profile}</Link>
        <button onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')} className="lang-btn" style={{ marginRight: '10px', background: 'transparent', border: '1px solid white', color: 'white', cursor: 'pointer' }}>
          {language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
        </button>
        <button onClick={handleLogout} className="logout-btn">{t.nav.logout}</button>
      </div>
    </nav>
  );
};

export default Navbar;
