import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface ClubProfileData {
    clubName: string;
    location: string;
    description: string;
    level: string;
}

const ClubProfile: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [profile, setProfile] = useState<ClubProfileData>({
        clubName: '',
        location: '',
        description: '',
        level: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setProfile(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/user/profile`, profile, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Update failed. Please try again.', 'error');
        }
    };

    if (!user) return null;

    return (
        <div className="profile-container">
            <h2>{t.profile.editClubProfile}</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="clubName" value={profile.clubName} onChange={handleChange} placeholder={t.profile.clubName} />
                <input type="text" name="location" value={profile.location || ''} onChange={handleChange} placeholder={t.profile.location} />
                <input type="text" name="level" value={profile.level || ''} onChange={handleChange} placeholder={t.profile.level} />
                <textarea name="description" value={profile.description || ''} onChange={handleChange} placeholder={t.profile.description}></textarea>
                <button type="submit">{t.profile.save}</button>
            </form>
        </div>
    );
};

export default ClubProfile;
