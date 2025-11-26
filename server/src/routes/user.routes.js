const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const checkAuth = require('../middleware/auth.middleware');

router.get('/profile', checkAuth, userController.getProfile);
router.put('/profile', checkAuth, userController.updateProfile);
router.get('/:id', checkAuth, userController.getUserById);

module.exports = router;
