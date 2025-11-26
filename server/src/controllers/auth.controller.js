const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const geocoder = require('../utils/geocoder');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
    try {
        const { email, password, role, firstName, lastName, clubName } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Geocode city
        let locationData = {};
        if (req.body.city) {
            const coords = await geocoder.geocodeCity(req.body.city);
            if (coords) {
                locationData = {
                    location: req.body.city,
                    latitude: coords.latitude,
                    longitude: coords.longitude
                };
            } else {
                locationData = { location: req.body.city };
            }
        }

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

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, userId: user.id, role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
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

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, userId: user.id, role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
