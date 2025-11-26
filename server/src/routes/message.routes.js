const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const checkAuth = require('../middleware/auth.middleware');

router.post('/', checkAuth, messageController.sendMessage);
router.get('/inbox', checkAuth, messageController.getInbox);
router.get('/outbox', checkAuth, messageController.getOutbox);
router.get('/unread', checkAuth, messageController.getUnreadCount);
router.put('/read', checkAuth, messageController.markAsRead);
router.get('/all', checkAuth, messageController.getAllMessages);
module.exports = router;
