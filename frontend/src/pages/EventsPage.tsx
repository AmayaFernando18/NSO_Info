import { useState, useEffect } from 'react'
import { Calendar, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchPublicEvents } from '../services/eventsService'
import EventCalendar from '../components/EventCalendar'
import Card from '../components/Card'
import type { EventDto, HolidayDto, PersonalEventDto } from '../types'

const getCategoryBadgeColor = (category: string) => {
  const colors: Record<string, string> = {
    Meeting: 'bg-blue-100 text-blue-800',
    Training: 'bg-purple-100 text-purple-800',
    Workshop: 'bg-indigo-100 text-indigo-800',
    Conference: 'bg-cyan-100 text-cyan-800',
    Holiday: 'bg-red-100 text-red-800',
    'Special Day': 'bg-amber-100 text-amber-800',
    Coordination: 'bg-teal-100 text-teal-800',
    Drill: 'bg-orange-100 text-orange-800',
    Other: 'bg-gray-100 text-gray-800',
  }
  return colors[category] || colors.Other
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const eventsData = await fetchPublicEvents()
        // Sort by date ascending
        const sortedEvents = eventsData.sort(
          (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        )
        setEvents(sortedEvents)
      } catch (error) {
        console.error('Failed to load events:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Pagination
  const totalPages = Math.ceil(events.length / itemsPerPage)
  const paginatedEvents = events.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEventClick = (item: EventDto | HolidayDto | PersonalEventDto) => {
    // Open modal only for public EventDto items.
    if ('category' in item) {
      setSelectedEvent(item)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent to-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Events & Calendar</h1>
              <p className="text-white/80 mt-1">
                Stay updated with upcoming events, holidays, and special days
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <EventCalendar onEventClick={handleEventClick} />
            </div>
          </div>

          {/* Events List */}
          <div className="lg:col-span-2">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary">
                All Events ({events.length})
              </h2>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No events found.</p>
                </div>
              </Card>
            ) : (
              <>
                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedEvents.map((event) => (
                    <Card
                      key={event.id || event._id}
                      hover
                      className="border-l-4 border-primary"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryBadgeColor(event.category)}`}
                          >
                            {event.category}
                          </span>
                          {event.linkUrl && (
                            <a
                              href={event.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-accent"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>

                        <h3 className="font-semibold text-secondary mb-2 line-clamp-2">
                          {event.title}
                        </h3>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {event.description}
                        </p>

                        <div className="flex items-center text-xs text-primary font-medium">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {new Date(event.eventDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                        )
                        .map((page, idx, arr) => (
                          <div key={page} className="flex items-center">
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-primary text-white'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-accent px-6 py-4 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-white" />
                  <span className="font-semibold text-white">Event Details</span>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryBadgeColor(
                    selectedEvent.category
                  )}`}
                >
                  {selectedEvent.category}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedEvent.eventDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-secondary mb-4 break-words">{selectedEvent.title}</h2>

              <p className="text-gray-600 leading-relaxed mb-6 break-words">{selectedEvent.description}</p>

              {selectedEvent.linkLabel && selectedEvent.linkUrl && (
                <a
                  href={selectedEvent.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {selectedEvent.linkLabel}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-border px-6 py-4 flex justify-end rounded-b-2xl flex-shrink-0">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
