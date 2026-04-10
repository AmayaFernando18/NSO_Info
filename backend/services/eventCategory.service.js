/**
 * Event Category service - database access helpers for event categories.
 */
import EventCategory from '../models/EventCategory.js';

export const DEFAULT_EVENT_CATEGORIES = [
  'Meeting',
  'Training',
  'Workshop',
  'Conference',
  'Holiday',
  'Special Day',
  'Coordination',
  'Drill',
  'Other',
];

export const ensureDefaultEventCategories = async (username = 'system') => {
  const count = await EventCategory.countDocuments();
  if (count > 0) return;

  const payload = DEFAULT_EVENT_CATEGORIES.map((name, index) => ({
    name,
    activeStatus: true,
    displayOrder: index + 1,
    createdBy: username,
    updatedBy: username,
  }));

  await EventCategory.insertMany(payload);
};

export const listPublicEventCategories = async () =>
  EventCategory.find({ activeStatus: true }).sort({ displayOrder: 1, name: 1 });

export const listAdminEventCategories = async () =>
  EventCategory.find().sort({ displayOrder: 1, name: 1 });

export const addEventCategory = async (payload) => EventCategory.create(payload);

export const updateEventCategoryById = async (id, payload) =>
  EventCategory.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const getEventCategoryById = async (id) => EventCategory.findById(id);

export const deleteEventCategoryById = async (id) => EventCategory.findByIdAndDelete(id);
