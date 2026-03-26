import PersonalEvent from '../models/PersonalEvent.js';

export const listPersonalEvents = async (ownerUsername) =>
  PersonalEvent.find({ ownerUsername }).sort({ eventDate: 1, createdAt: -1 }).lean();

export const listPersonalEventsByDateRange = async (ownerUsername, startDate, endDate) =>
  PersonalEvent.find({
    ownerUsername,
    eventDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  })
    .sort({ eventDate: 1, createdAt: -1 })
    .lean();

export const addPersonalEvent = async (payload) => PersonalEvent.create(payload);

export const updatePersonalEventById = async (id, payload) =>
  PersonalEvent.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const deletePersonalEventById = async (id) => PersonalEvent.findByIdAndDelete(id);

export const getPersonalEventById = async (id) => PersonalEvent.findById(id);
