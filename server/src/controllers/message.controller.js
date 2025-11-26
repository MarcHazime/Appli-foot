const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.userData.userId;

        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId: parseInt(receiverId),
                content
            }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getInbox = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const messages = await prisma.message.findMany({
            where: { receiverId: userId },
            include: {
                sender: {
                    include: {
                        playerProfile: true,
                        clubProfile: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOutbox = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const messages = await prisma.message.findMany({
            where: { senderId: userId },
            include: {
                receiver: {
                    include: {
                        playerProfile: true,
                        clubProfile: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const count = await prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false
            }
        });
        res.json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.userData.userId;
        await prisma.message.updateMany({
            where: {
                receiverId: userId,
                isRead: false
            },
            data: { isRead: true }
        });
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: {
                    include: {
                        playerProfile: true,
                        clubProfile: true
                    }
                },
                receiver: {
                    include: {
                        playerProfile: true,
                        clubProfile: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

