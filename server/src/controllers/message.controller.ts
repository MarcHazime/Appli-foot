import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const sendMessage = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { receiverId, content } = req.body;
        const senderId = parseInt(req.user.userId);

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

export const getInbox = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = parseInt(req.user.userId);
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

export const getOutbox = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = parseInt(req.user.userId);
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

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = parseInt(req.user.userId);
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

export const markAsRead = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = parseInt(req.user.userId);
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

export const getAllMessages = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = parseInt(req.user.userId);
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
