import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface PlayerProfileData {
    firstName: string;
    lastName: string;
    position: string;
    age: string | number;
    location: string;
    bio: string;
}

const PlayerProfile: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [profile, setProfile] = useState<PlayerProfileData>({
        firstName: '',
        lastName: '',
        position: '',
        age: '',
        location: '',
        bio: ''
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
            <h2>{t.profile.editProfile}</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="firstName" value={profile.firstName} onChange={handleChange} placeholder={t.profile.firstName} />
                <input type="text" name="lastName" value={profile.lastName} onChange={handleChange} placeholder={t.profile.lastName} />
                <input type="text" name="position" value={profile.position || ''} onChange={handleChange} placeholder={t.profile.position} />
                <input type="number" name="age" value={profile.age || ''} onChange={handleChange} placeholder={t.profile.age} />
                <input type="text" name="location" value={profile.location || ''} onChange={handleChange} placeholder={t.profile.location} />
                <textarea name="bio" value={profile.bio || ''} onChange={handleChange} placeholder={t.profile.bio}></textarea>
                <button type="submit">{t.profile.save}</button>
            </form>
        </div>
    );
};

export default PlayerProfile;
