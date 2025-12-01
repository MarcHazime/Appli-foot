import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as geocoder from '../utils/geocoder';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { userId, role } = req.user;

        let profile;
        if (role === 'PLAYER') {
            profile = await prisma.playerProfile.findUnique({ where: { userId: parseInt(userId) } }); // userId in token is string, but db might expect int? Wait, schema check needed.
            // Actually, in auth controller we used user.id which is likely int. And token stores it.
            // Let's check schema or usage. In register, jwt payload has userId: user.id.
            // Prisma findUnique usually expects the type defined in schema.
            // If User ID is Int, then findUnique expects Int.
            // In auth.controller.js: const token = jwt.sign({ userId: user.id ... })
            // user.id comes from prisma.user.create.
            // I should cast userId to number if schema uses Int.
            // Let's assume Int for now based on typical usage, or check schema.
            // But wait, in auth.controller.js: const user = await prisma.user.create...
            // User ID is usually Int in Prisma unless specified as String/UUID.
            // I'll cast to Number(userId) just to be safe, or check schema.
            // In user.controller.js original: const { userId, role } = req.userData; ... where: { userId }
            // JS doesn't care, but Prisma might if strict.
            // Let's look at user.controller.js again.
            // Line 81: const userId = parseInt(id);
            // So ID is likely Int.
        } else if (role === 'CLUB') {
            profile = await prisma.clubProfile.findUnique({ where: { userId: parseInt(userId) } });
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

export const updateProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { userId, role } = req.user;
        const data = req.body;

        let locationUpdates: any = {};
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
        const uid = parseInt(userId);
        if (role === 'PLAYER') {
            profile = await prisma.playerProfile.update({
                where: { userId: uid },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    position: data.position,
                    age: data.age ? parseInt(data.age) : undefined,
                    bio: data.bio,
                    ...locationUpdates
                }
            });
        } else if (role === 'CLUB') {
            profile = await prisma.clubProfile.update({
                where: { userId: uid },
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

export const getUserById = async (req: Request, res: Response) => {
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
