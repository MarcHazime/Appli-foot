import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface PublicUser {
    id: string;
    role: string;
    email: string;
    playerProfile?: {
        firstName: string;
        lastName: string;
        location: string;
        age: string | number;
        position: string;
        bio: string;
    };
    clubProfile?: {
        clubName: string;
        location: string;
        level: string;
        description: string;
    };
}

const PublicProfile: React.FC = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
    const navigate = useNavigate();

    const [showMsgForm, setShowMsgForm] = useState<boolean>(false);
    const [msgContent, setMsgContent] = useState<string>('');

    useEffect(() => {
        const fetchUser = async () => {
            if (!user) return;
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
    }, [id, user]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
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

    if (!details) return <div>Profile not found</div>;

    return (
        <div className="profile-container">
            <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', marginRight: '1rem' }}>{t.profile.back}</button>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2>{isPlayer ? `${(details as any).firstName} ${(details as any).lastName}` : (details as any).clubName}</h2>
                <p className="role-badge">{profileUser.role}</p>

                <div className="profile-details">
                    <p><strong>{t.profile.location}:</strong> {details.location}</p>
                    {isPlayer ? (
                        <>
                            <p><strong>{t.profile.age}:</strong> {(details as any).age}</p>
                            <p><strong>{t.profile.position}:</strong> {(details as any).position}</p>
                        </>
                    ) : (
                        <p><strong>{t.profile.level}:</strong> {(details as any).level}</p>
                    )}
                    <p><strong>{t.profile.bio}:</strong> {(details as any).bio || (details as any).description}</p>
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
