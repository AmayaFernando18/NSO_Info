import {
  addHeroSlide,
  approveHeroSlideById,
  getHeroSlideById,
  listAdminHeroSlides,
  listPublicHeroSlides,
  permanentlyDeleteHeroSlideById,
  rejectHeroSlideById,
  reorderHeroSlides,
  restoreHeroSlideById,
  softDeleteHeroSlideById,
  updateHeroSlideById,
} from '../services/heroSlides.service.js';
import { sendCreated, sendError, sendSuccess } from '../utils/apiResponse.js';
import { canEditUnapproved } from '../utils/rbacHelpers.js';
import { RBAC_FUNCTION } from '../config/rbacFunctions.js';

const FUNCTION_NAME = RBAC_FUNCTION.HERO;

export const getPublicHeroSlides = async (_req, res, next) => {
  try {
    const data = await listPublicHeroSlides();
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const getAdminHeroSlides = async (_req, res, next) => {
  try {
    const deletedOnly = String(_req.query.deletedOnly || '').toLowerCase() === 'true';
    const includeDeleted = String(_req.query.includeDeleted || '').toLowerCase() === 'true';
    const data = await listAdminHeroSlides({ deletedOnly, includeDeleted });
    sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

export const createHeroSlide = async (req, res, next) => {
  try {
    // All new hero slides start in pending state (approved: false).
    // This ensures all slides pass through the approval workflow before appearing on public site,
    // maintaining consistency with the News module's RBAC-enforced moderation pattern.
    const created = await addHeroSlide({
      ...req.body,
      createdBy: req.user.username,
      updatedBy: req.user.username,
      approved: false,
      approvedBy: '',
      approvedAt: null,
      rejected: false,
      rejectedBy: '',
      rejectionReason: '',
      rejectedAt: null,
    });
    sendCreated(res, { data: created });
  } catch (error) {
    next(error);
  }
};

export const updateHeroSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getHeroSlideById(id);

    if (!existing) {
      return sendError(res, 404, 'Hero slide not found');
    }

    // Enter users can update only unapproved entries. Managers can update all.
    if (!canEditUnapproved(req.user, FUNCTION_NAME, existing.approved)) {
      return sendError(res, 403, 'Forbidden: You cannot edit this hero slide');
    }

    // Reset approval on any update to enforce re-review of changes.
    // Even approved slides require re-approval after modification, ensuring that all content changes
    // are validated by an approver (authority A or M) before being exposed on the public carousel.
    // This prevents unapproved modifications from bypassing the moderation workflow.
    const updated = await updateHeroSlideById(id, {
      ...req.body,
      updatedBy: req.user.username,
      approved: false,
      approvedBy: '',
      approvedAt: null,
      rejected: false,
      rejectedBy: '',
      rejectionReason: '',
      rejectedAt: null,
    });
    sendSuccess(res, { data: updated });
  } catch (error) {
    next(error);
  }
};

export const approveHeroSlide = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await getHeroSlideById(id);
    if (!existing) {
      return sendError(res, 404, 'Hero slide not found');
    }

    // Approver (authority A or M) marks the hero slide as approved.
    // Once approved, the slide becomes visible on the public carousel via the approval status check
    // in listPublicHeroSlides service. This gate ensures only vetted content appears publicly.
    const updated = await approveHeroSlideById(id, req.user.username);
    sendSuccess(res, { data: updated, message: 'Hero slide approved' });
  } catch (error) {
    next(error);
  }
};

export const rejectHeroSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const existing = await getHeroSlideById(id);
    if (!existing) {
      return sendError(res, 404, 'Hero slide not found');
    }

    // Approver requests changes to the slide by rejecting it with an explanation.
    // The creator receives the rejectionReason in the API response and can see it in the admin UI,
    // enabling them to understand what needs fixing before resubmitting for re-approval.
    // The slide is returned to pending state and will not appear on the public carousel.
    const updated = await rejectHeroSlideById(id, req.user.username, rejectionReason || '');
    sendSuccess(res, { data: updated, message: 'Hero slide rejected' });
  } catch (error) {
    next(error);
  }
};

export const removeHeroSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getHeroSlideById(id);

    if (!existing) {
      return sendError(res, 404, 'Hero slide not found');
    }

    if (existing.isDeleted) {
      return sendError(res, 400, 'Hero slide is already deleted');
    }

    const deleted = await softDeleteHeroSlideById(id, req.user.username);

    if (!deleted) {
      return sendError(res, 404, 'Hero slide not found');
    }

    sendSuccess(res, { data: deleted, message: 'Hero slide moved to deleted items' });
  } catch (error) {
    next(error);
  }
};

export const restoreHeroSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getHeroSlideById(id);

    if (!existing) {
      return sendError(res, 404, 'Hero slide not found');
    }

    if (!existing.isDeleted) {
      return sendError(res, 400, 'Hero slide is not deleted');
    }

    const restored = await restoreHeroSlideById(id, req.user.username);
    sendSuccess(res, { data: restored, message: 'Hero slide restored' });
  } catch (error) {
    next(error);
  }
};

export const permanentlyDeleteHeroSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getHeroSlideById(id);

    if (!existing) {
      return sendError(res, 404, 'Hero slide not found');
    }

    await permanentlyDeleteHeroSlideById(id);
    sendSuccess(res, { message: 'Hero slide permanently deleted' });
  } catch (error) {
    next(error);
  }
};

export const reorderHeroSlidesController = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    const data = await reorderHeroSlides(orderedIds);
    sendSuccess(res, { data, message: 'Hero slides reordered' });
  } catch (error) {
    next(error);
  }
};
