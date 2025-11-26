import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const PlayerProfile = () => {
    const { user } = useContext(AuthContext);
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        position: '',
        age: '',
        location: '',
        bio: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/user/profile', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setProfile(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, [user.token]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:3000/api/user/profile', profile, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Update failed. Please try again.', 'error');
        }
    };

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
