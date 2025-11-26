const { PrismaClient } = require('@prisma/client');
const geocoder = require('../utils/geocoder');
const prisma = new PrismaClient();

exports.getProfile = async (req, res) => {
    try {
        const { userId, role } = req.userData;

        let profile;
        if (role === 'PLAYER') {
            profile = await prisma.playerProfile.findUnique({ where: { userId } });
        } else if (role === 'CLUB') {
            profile = await prisma.clubProfile.findUnique({ where: { userId } });
        }

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { userId, role } = req.userData;
        const data = req.body;

        let locationUpdates = {};
        if (data.location) {
            // If location (city) is changing, try to geocode it
            const coords = await geocoder.geocodeCity(data.location);
            if (coords) {
                locationUpdates = {
                    location: data.location,
                    latitude: coords.latitude,
                    longitude: coords.longitude
                };
            } else {
                locationUpdates = { location: data.location };
            }
        }

        let profile;
        if (role === 'PLAYER') {
            profile = await prisma.playerProfile.update({
                where: { userId },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    position: data.position,
                    age: parseInt(data.age),
                    bio: data.bio,
                    ...locationUpdates
                }
            });
        } else if (role === 'CLUB') {
            profile = await prisma.clubProfile.update({
                where: { userId },
                data: {
                    clubName: data.clubName,
                    description: data.description,
                    level: data.level,
                    ...locationUpdates
                }
            });
        }

        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                playerProfile: true,
                clubProfile: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
