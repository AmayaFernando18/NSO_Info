// Root API router - mounts sub-route modules for feature separation
import express from 'express';

import authRoutes from './auth.js';
import heroSlidesRoutes from './heroSlides.js';
import newsRoutes from './news.js';
import userRoutes from './users.js';
import eventsRoutes from './events.js';
import corporateRoutes from './corporate.js';
import personalEventsRoutes from './personalEvents.js';
import galleryRoutes from './gallery.js';
import quickAccessRoutes from './quickAccess.js';
import downloadsRoutes from './downloads.js';

const router = express.Router();

// Mount feature routes under their respective paths
router.use('/auth', authRoutes);
router.use('/hero-slides', heroSlidesRoutes);
router.use('/news', newsRoutes);
router.use('/users', userRoutes);
router.use('/events', eventsRoutes);
router.use('/personal-events', personalEventsRoutes);
router.use('/corporate', corporateRoutes);
router.use('/gallery', galleryRoutes);
router.use('/quick-access', quickAccessRoutes);
router.use('/downloads', downloadsRoutes);

export default router;
