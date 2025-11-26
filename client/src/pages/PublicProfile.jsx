import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const PublicProfile = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [profileUser, setProfileUser] = useState(null);
    const navigate = useNavigate();

    const [showMsgForm, setShowMsgForm] = useState(false);
    const [msgContent, setMsgContent] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setProfileUser(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUser();
    }, [id, user.token]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
                receiverId: id,
                content: msgContent
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showToast(t.profile.messageSent, 'success');
            setShowMsgForm(false);
            setMsgContent('');
        } catch (err) {
            console.error(err);
            showToast('Failed to send message', 'error');
        }
    };

    if (!profileUser) return <div>{t.map.loading}</div>;

    const isPlayer = profileUser.role === 'PLAYER';
    const details = isPlayer ? profileUser.playerProfile : profileUser.clubProfile;

    return (
        <div className="profile-container">
            <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', marginRight: '1rem' }}>{t.profile.back}</button>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2>{isPlayer ? `${details.firstName} ${details.lastName}` : details.clubName}</h2>
                <p className="role-badge">{profileUser.role}</p>

                <div className="profile-details">
                    <p><strong>{t.profile.location}:</strong> {details.location}</p>
                    {isPlayer ? (
                        <>
                            <p><strong>{t.profile.age}:</strong> {details.age}</p>
                            <p><strong>{t.profile.position}:</strong> {details.position}</p>
                        </>
                    ) : (
                        <p><strong>{t.profile.level}:</strong> {details.level}</p>
                    )}
                    <p><strong>{t.profile.bio}:</strong> {details.bio || details.description}</p>
                    <p><strong>{t.profile.contact}:</strong> {profileUser.email}</p>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid #555', paddingTop: '1rem' }}>
                    {!showMsgForm ? (
                        <button onClick={() => setShowMsgForm(true)}>{t.profile.sendMessage}</button>
                    ) : (
                        <form onSubmit={handleSendMessage}>
                            <textarea
                                value={msgContent}
                                onChange={(e) => setMsgContent(e.target.value)}
                                placeholder={t.profile.typeMessage}
                                required
                                style={{ width: '100%', minHeight: '100px' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit">{t.profile.send}</button>
                                <button type="button" onClick={() => setShowMsgForm(false)} style={{ background: '#d32f2f' }}>{t.profile.cancel}</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
