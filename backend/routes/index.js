// Root API router - mounts sub-route modules for feature separation
import express from 'express';

import authRoutes from './auth.js';
import heroSlidesRoutes from './heroSlides.js';
import newsRoutes from './news.js';
import userRoutes from './users.js';

const router = express.Router();

// Mount feature routes under their respective paths
router.use('/auth', authRoutes);
router.use('/hero-slides', heroSlidesRoutes);
router.use('/news', newsRoutes);
router.use('/users', userRoutes);

export default router;
