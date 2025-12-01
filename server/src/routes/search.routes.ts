import express from 'express';
import * as searchController from '../controllers/search.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authMiddleware, searchController.search);

export default router;
