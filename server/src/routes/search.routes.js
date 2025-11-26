const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const checkAuth = require('../middleware/auth.middleware');

router.get('/', checkAuth, searchController.search);

module.exports = router;
