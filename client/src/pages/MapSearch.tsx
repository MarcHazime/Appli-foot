import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

import { useLanguage } from '../context/LanguageContext';

interface MapUser {
    id: string;
    role: string;
    playerProfile?: {
        firstName: string;
        lastName: string;
        location: string;
        latitude: number;
        longitude: number;
        position?: string;
        level?: string;
    };
    clubProfile?: {
        clubName: string;
        location: string;
        latitude: number;
        longitude: number;
        level?: string;
    };
}

const MapSearch: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [users, setUsers] = useState<MapUser[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!user) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/search`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (Array.isArray(res.data)) {
                    setUsers(res.data);
                } else {
                    console.error("API returned non-array:", res.data);
                    setUsers([]);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchUsers();
    }, [user]);

    const PlayerIcon = L.divIcon({
        className: 'custom-player-icon',
        html: '<div style="font-size: 30px;">🏃</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const ClubIcon = L.divIcon({
        className: 'custom-club-icon',
        html: '<div style="font-size: 30px;">⚽</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    if (!user) return null;

    return (
        <div className="map-container">
            <h2>{user.role === 'CLUB' ? t.map.findPlayers : t.map.findClubs}</h2>
            <MapContainer center={[46.603354, 1.888334]} zoom={6} style={{ height: '500px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {users.map((u) => {
                    const profile = u.role === 'PLAYER' ? u.playerProfile : u.clubProfile;
                    if (!profile || !profile.latitude || !profile.longitude) return null;

                    // Helper to get name safely
                    const getName = () => {
                        if (u.role === 'PLAYER' && u.playerProfile) {
                            return `${u.playerProfile.firstName} ${u.playerProfile.lastName}`;
                        } else if (u.role === 'CLUB' && u.clubProfile) {
                            return u.clubProfile.clubName;
                        }
                        return '';
                    };

                    return (
                        <Marker
                            key={u.id}
                            position={[profile.latitude, profile.longitude]}
                            icon={u.role === 'PLAYER' ? PlayerIcon : ClubIcon}
                        >
                            <Popup>
                                <strong>{getName()}</strong><br />
                                {profile.location}<br />
                                {(profile as any).position || (profile as any).level}<br />
                                <Link to={`/user/${u.id}`}>{t.map.popupViewProfile}</Link>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapSearch;
