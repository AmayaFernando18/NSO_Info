import { useState, useEffect, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react'
import { fetchCalendarData } from '../services/eventsService'
import type { EventDto, HolidayDto, CalendarDataDto } from '../types'

interface CalendarProps {
  onEventClick?: (event: EventDto | HolidayDto) => void
  compact?: boolean
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function EventCalendar({ onEventClick, compact = false }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarDataDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState<(EventDto | HolidayDto)[]>([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const loadCalendarData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchCalendarData(year, month + 1)
      setCalendarData(data)
    } catch (error) {
      console.error('Failed to load calendar data:', error)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    loadCalendarData()
  }, [loadCalendarData])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDate(null)
    setSelectedDayEvents([])
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDate(null)
    setSelectedDayEvents([])
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(null)
    setSelectedDayEvents([])
  }

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    const days: { date: Date | null; isCurrentMonth: boolean }[] = []

    // Add empty days for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1)
      days.push({ date: prevMonthDay, isCurrentMonth: false })
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }

    // Add empty days for next month to complete the grid
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }

    return days
  }, [year, month])

  // Build a map of date -> events/holidays
  const dateEventsMap = useMemo(() => {
    const map = new Map<string, (EventDto | HolidayDto)[]>()

    if (calendarData) {
      // Add events
      calendarData.events.forEach((event) => {
        const dateKey = event.eventDate.slice(0, 10)
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push(event)
      })

      // Add holidays
      calendarData.holidays.forEach((holiday) => {
        const dateKey = holiday.date
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push({ ...holiday, isHoliday: true })
      })

      // Add special days
      calendarData.specialDays.forEach((special) => {
        const dateKey = special.date
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push({ ...special, isSpecialDay: true })
      })
    }

    return map
  }, [calendarData])

  const formatDateKey = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const handleDateClick = (date: Date) => {
    const dateKey = formatDateKey(date)
    const events = dateEventsMap.get(dateKey) || []
    setSelectedDate(date)
    setSelectedDayEvents(events)
  }

  const getDayClasses = (date: Date, isCurrentMonth: boolean) => {
    const dateKey = formatDateKey(date)
    const events = dateEventsMap.get(dateKey) || []
    const hasHoliday = events.some((e) => 'isHoliday' in e && e.isHoliday)
    const hasSpecialDay = events.some((e) => 'isSpecialDay' in e && e.isSpecialDay)
    const hasEvent = events.some((e) => 'eventDate' in e)

    let classes = 'relative p-1 text-center cursor-pointer transition-all rounded-lg '

    if (!isCurrentMonth) {
      classes += 'text-gray-300 '
    } else if (isToday(date)) {
      classes += 'bg-primary text-white font-bold '
    } else if (hasHoliday) {
      classes += 'bg-red-100 text-red-800 font-medium '
    } else if (hasSpecialDay) {
      classes += 'bg-amber-100 text-amber-800 font-medium '
    } else if (hasEvent) {
      classes += 'bg-primary/10 text-primary font-medium '
    } else {
      classes += 'text-gray-700 hover:bg-gray-100 '
    }

    if (selectedDate && formatDateKey(selectedDate) === dateKey) {
      classes += 'ring-2 ring-primary ring-offset-1 '
    }

    return classes
  }

  const isHolidayItem = (item: EventDto | HolidayDto): item is HolidayDto => {
    return 'date' in item && !('eventDate' in item)
  }

  return (
    <div className={`bg-white rounded-xl border border-border shadow-sm ${compact ? '' : 'p-4'}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <h2 className="text-lg font-semibold text-secondary">
          {MONTHS[month]} {year}
        </h2>

        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className={`text-center font-medium ${compact ? 'text-xs py-1' : 'text-sm py-2'} ${
              day === 'Sun' || day === 'Sat' ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            {compact ? day.slice(0, 1) : day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          if (!date) return <div key={index} className="aspect-square" />

          const dateKey = formatDateKey(date)
          const events = dateEventsMap.get(dateKey) || []
          const hasItems = events.length > 0

          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={getDayClasses(date, isCurrentMonth)}
              title={hasItems ? `${events.length} item(s)` : undefined}
            >
              <span className={compact ? 'text-xs' : 'text-sm'}>{date.getDate()}</span>
              {hasItems && isCurrentMonth && !compact && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {events.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        events[i] && 'isHoliday' in events[i] && events[i].isHoliday
                          ? 'bg-red-500'
                          : events[i] && 'isSpecialDay' in events[i] && events[i].isSpecialDay
                          ? 'bg-amber-500'
                          : 'bg-primary'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      {!compact && (
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
            <span>Holiday</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
            <span>Special Day</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary/10 border border-primary/20" />
            <span>Event</span>
          </div>
        </div>
      )}

      {/* Selected Date Events Panel */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-secondary text-sm">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <button
              onClick={() => {
                setSelectedDate(null)
                setSelectedDayEvents([])
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          
          {selectedDayEvents.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">
              No events on this day.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedDayEvents.map((item, idx) => {
                const isHoliday = isHolidayItem(item) ? item.isHoliday : false
                const isSpecialDay = isHolidayItem(item) ? item.isSpecialDay : false

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-sm cursor-pointer transition-all ${
                      isHoliday
                        ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500'
                        : isSpecialDay
                        ? 'bg-amber-50 hover:bg-amber-100 border-l-4 border-amber-500'
                        : 'bg-primary/5 hover:bg-primary/10 border-l-4 border-primary'
                    }`}
                    onClick={() => onEventClick?.(item)}
                  >
                    <div className="font-medium text-secondary leading-tight">{item.title}</div>
                    {!isHolidayItem(item) && item.description && (
                      <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                    {!isHolidayItem(item) && item.linkLabel && item.linkUrl && (
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.linkLabel}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
