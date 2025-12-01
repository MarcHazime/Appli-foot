import axios from 'axios';

interface Coordinates {
    latitude: number;
    longitude: number;
}

export const geocodeCity = async (city: string): Promise<Coordinates | null> => {
    if (!city) return null;
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: city,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'FootballMatchmakingApp/1.0'
            }
        });

        if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon)
            };
        }
        return null;
    } catch (error: any) {
        console.error('Geocoding error:', error.message);
        return null;
    }
};
