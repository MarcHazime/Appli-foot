const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.search = async (req, res) => {
    try {
        const { role } = req.userData;
        const { q } = req.query;

        let results;
        if (role === 'PLAYER') {
            // Player searching for Clubs
            results = await prisma.user.findMany({
                where: {
                    role: 'CLUB',
                    clubProfile: {
                        ...(q && {
                            OR: [
                                { clubName: { contains: q, mode: 'insensitive' } },
                                { location: { contains: q, mode: 'insensitive' } }
                            ]
                        })
                    }
                },
                include: { clubProfile: true }
            });
        } else if (role === 'CLUB') {
            // Club searching for Players
            results = await prisma.user.findMany({
                where: {
                    role: 'PLAYER',
                    playerProfile: {
                        ...(q && {
                            OR: [
                                { firstName: { contains: q, mode: 'insensitive' } },
                                { lastName: { contains: q, mode: 'insensitive' } },
                                { location: { contains: q, mode: 'insensitive' } }
                            ]
                        })
                    }
                },
                include: { playerProfile: true }
            });
        }

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
