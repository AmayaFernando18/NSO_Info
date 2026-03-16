import { useEffect, useMemo, useState } from 'react';
import { mockQuickLinks } from '../mocks/quickLinks';
import { mockHighlights } from '../mocks/highlights';
import { mockHeroImages } from '../mocks/heroImages';
import Card from '../components/Card';
import EventCalendar from '../components/EventCalendar';
import { Calendar, FileText, Zap, ArrowRight, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, X, ExternalLink, Leaf, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  UserIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { fetchPublicNews } from '../services/newsService';
import { fetchPublicHeroSlides } from '../services/heroSlidesService';
import { fetchCalendarData } from '../services/eventsService';
import type { NewsDto, EventDto } from '../types';
import { resolveMediaUrl } from '../utils/media';

const iconMap: Record<string, any> = {
  Zap,
  TrendingUp,
  Leaf,
  BarChart3,
  DocumentTextIcon,
  UserIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
};

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsDto[]>([]);
  const [heroSlides, setHeroSlides] = useState(mockHeroImages);
  const [selectedNews, setSelectedNews] = useState<NewsDto | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventDto[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      try {
        const data = await fetchPublicNews();
        if (isMounted) {
          setNewsItems(data || []);
        }
      } catch {
        if (isMounted) {
          setNewsItems([]);
        }
      }
    };

    const loadHeroSlides = async () => {
      try {
        const data = await fetchPublicHeroSlides();
        if (!isMounted) return;

        const normalized = (data || [])
          .filter((slide) => slide && slide.imageUrl)
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((slide) => ({
            id: slide.id || slide._id || String(slide.order || 0),
            title: slide.title,
            description: slide.description,
            imageUrl: resolveMediaUrl(slide.imageUrl),
            order: slide.order || 0,
          }));

        setHeroSlides(normalized.length > 0 ? normalized : mockHeroImages);
      } catch {
        if (isMounted) {
          setHeroSlides(mockHeroImages);
        }
      }
    };

    const loadEvents = async () => {
      try {
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;

        const [curr, next] = await Promise.all([
          fetchCalendarData(year, month),
          fetchCalendarData(nextYear, nextMonth),
        ]);

        if (isMounted) {
          const upcoming: EventDto[] = [
            ...(curr?.events || []),
            ...(next?.events || []),
          ].filter((e) => e.eventDate.slice(0, 10) >= todayStr);

          upcoming.sort((a, b) => a.eventDate.localeCompare(b.eventDate));

          setUpcomingEvents(upcoming.slice(0, 3));
        }
      } catch {
        if (isMounted) {
          setUpcomingEvents([]);
        }
      }
    };

    loadNews();
    loadHeroSlides();
    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentSlide >= heroSlides.length) {
      setCurrentSlide(0);
    }
  }, [currentSlide, heroSlides.length]);

  const latestNews = useMemo(
    () =>
      [...newsItems]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 3),
    [newsItems]
  );

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <div className="relative h-[450px] bg-gradient-to-r from-primary via-accent to-primary overflow-hidden">
        {heroSlides.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.imageUrl}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-primary/70 to-accent/70 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{image.title}</h1>
                  <p className="text-base text-gray-100">{image.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-all">
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-all">
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {mockHighlights.map((highlight) => {
            const Icon = iconMap[highlight.icon] || Zap;
            return (
              <Card key={highlight.id} hover>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl shadow-md">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {highlight.trend && (
                      <div className={`flex items-center gap-1 text-sm font-semibold ${highlight.trend === 'up' ? 'text-primary' : 'text-red-600'}`}>
                        {highlight.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-secondary mb-2">{highlight.value}</h3>
                    <p className="text-sm font-medium text-gray-700 leading-snug">{highlight.title}</p>
                    {/* <p className="text-xs text-gray-500 mt-1">{highlight.description}</p> */}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary flex items-center">
                <FileText className="h-5 w-5 text-primary mr-2" />
                Latest Updates
              </h2>
              <Link to="/news" className="text-primary hover:text-accent flex items-center text-sm font-medium">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {latestNews.length > 0 ? (
                latestNews.map((news) => (
                  <Card key={news.id || news._id || news.title} hover>
                    <div className="flex gap-4">
                      {news.imageUrl && (
                        <img
                          src={resolveMediaUrl(news.imageUrl)}
                          alt={news.title}
                          className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
                          {news.category}
                        </span>
                        <h3 className="font-semibold text-secondary mb-2">{news.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{news.summary || news.excerpt || ''}</p>
                        <button
                          onClick={() => setSelectedNews(news)}
                          className="text-primary hover:text-accent text-sm font-medium inline-flex items-center gap-1 group"
                        >
                          Read More
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-sm text-gray-500">No published news available right now.</p>
                </Card>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary flex items-center">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                Upcoming Events
              </h2>
              <Link to="/events" className="text-primary hover:text-accent flex items-center text-sm font-medium">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {/* Upcoming Events Cards */}
            <div className="space-y-3 mb-6">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <Card key={event.id || event._id} hover>
                    <div
                      className="border-l-4 border-primary pl-3 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm text-secondary truncate">{event.title}</h4>
                          {event.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2 break-words">{event.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs text-primary font-medium whitespace-nowrap">
                              {new Date(event.eventDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary whitespace-nowrap">
                              {event.category}
                            </span>
                          </div>
                        </div>
                        {event.linkUrl && (
                          <a
                            href={event.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-accent p-1 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-sm text-gray-500">No upcoming events.</p>
                </Card>
              )}
            </div>

            {/* Calendar */}
            <EventCalendar onEventClick={(item) => { if ('eventDate' in item) setSelectedEvent(item as EventDto); }} />

          </div>
        </div>

        {/* Quick Access */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-secondary mb-6 flex items-center">
            <Zap className="h-5 w-5 text-primary mr-2" />
            Quick Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockQuickLinks.slice(0, 8).map((link) => {
              const Icon = iconMap[link.icon] || Zap;
              return (
                <Card key={link.id} hover>
                  <Link to={link.url} className="block text-center">
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm text-secondary mb-1">{link.title}</h3>
                    <p className="text-xs text-gray-500">{link.description}</p>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
          onClick={() => setSelectedNews(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-semibold text-secondary">News Details</span>
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-hidden">
              {/* Image */}
              {selectedNews.imageUrl && (
                <img
                  src={resolveMediaUrl(selectedNews.imageUrl)}
                  alt={selectedNews.title}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}

              {/* Category & Date */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {selectedNews.category}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedNews.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {selectedNews.author && (
                  <span className="text-sm text-gray-500">
                    by {selectedNews.author}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-secondary mb-4 break-words">
                {selectedNews.title}
              </h2>

              {/* Summary */}
              {(selectedNews.summary || selectedNews.excerpt) && (
                <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg mb-6 overflow-hidden">
                  <p className="text-gray-700 leading-relaxed break-words">
                    {selectedNews.summary || selectedNews.excerpt}
                  </p>
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none overflow-hidden">
                <div
                  className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: selectedNews.content }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-border px-6 py-4 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
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
              {/* Category & Date */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
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

              {/* Title */}
              <h2 className="text-2xl font-bold text-secondary mb-4 break-words">
                {selectedEvent.title}
              </h2>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-6 break-words">
                {selectedEvent.description}
              </p>

              {/* Link */}
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
  );
}
