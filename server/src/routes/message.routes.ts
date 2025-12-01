import express from 'express';
import * as messageController from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, messageController.sendMessage);
router.get('/inbox', authMiddleware, messageController.getInbox);
router.get('/outbox', authMiddleware, messageController.getOutbox);
router.get('/unread', authMiddleware, messageController.getUnreadCount);
router.put('/read', authMiddleware, messageController.markAsRead);
router.get('/all', authMiddleware, messageController.getAllMessages);

export default router;
