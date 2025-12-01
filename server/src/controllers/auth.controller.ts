import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as geocoder from '../utils/geocoder';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, role, firstName, lastName, clubName, city } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Geocode city
        let locationData: any = {};
        if (city) {
            const coords = await geocoder.geocodeCity(city);
            if (coords) {
                locationData = {
                    location: city,
                    latitude: coords.latitude,
                    longitude: coords.longitude
                };
            } else {
                locationData = { location: city };
            }
        }

        console.log('Register Request Body:', req.body);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                // Create profile based on role
                ...(role === 'PLAYER' && {
                    playerProfile: {
                        create: {
                            firstName,
                            lastName,
                            ...locationData
                        }
                    }
                }),
                ...(role === 'CLUB' && {
                    clubProfile: {
                        create: {
                            clubName,
                            ...locationData
                        }
                    }
                })
            }
        });

        console.log('Created User:', user);

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        res.status(201).json({ token, userId: user.id, role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        res.json({ token, userId: user.id, role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
