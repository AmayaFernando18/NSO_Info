import { useState } from 'react';
import { mockNews } from '../mocks/news';
import { mockQuickLinks } from '../mocks/quickLinks';
import { mockEvents } from '../mocks/events';
import { mockHighlights } from '../mocks/highlights';
import { mockHeroImages } from '../mocks/heroImages';
import Card from '../components/Card';
import { Calendar, FileText, Zap, ArrowRight, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
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

const iconMap: Record<string, any> = {
  Zap,
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mockHeroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mockHeroImages.length) % mockHeroImages.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <div className="relative h-[500px] bg-gradient-to-r from-secondary via-primary to-secondary overflow-hidden">
        {mockHeroImages.map((image, index) => (
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
            <div className="absolute inset-0 bg-gradient-to-r from-greenDark/95 via-secondary/85 to-primary/75 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl">
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">{image.title}</h1>
                  <p className="text-xl text-gray-100 mb-8 leading-relaxed">{image.description}</p>
                  <div className="flex gap-4">
                    <Link 
                      to="/careers" 
                      className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-glow flex items-center"
                    >
                      Explore Opportunities <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link 
                      to="/tenders" 
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold transition-all border border-white/30"
                    >
                      View Tenders
                    </Link>
                  </div>
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
          {mockHeroImages.map((_, index) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {mockHighlights.map((highlight) => {
            const Icon = iconMap[highlight.icon] || Zap;
            return (
              <Card key={highlight.id} hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-3 rounded-xl">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-secondary mb-2">{highlight.value}</h3>
                    <p className="text-sm font-semibold text-gray-800">{highlight.title}</p>
                    <p className="text-xs text-gray-600 mt-2">{highlight.description}</p>
                  </div>
                  {highlight.trend && (
                    <div className={`flex items-center text-sm font-semibold ${highlight.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {highlight.trend === 'up' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      <span className="ml-1">{highlight.trendValue}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-secondary flex items-center">
                <FileText className="h-7 w-7 text-primary mr-3" />
                Latest Updates
              </h2>
              <Link to="/news" className="text-primary hover:text-accent flex items-center text-sm font-semibold transition-colors">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {mockNews.slice(0, 3).map((news) => (
                <Card key={news.id} hover>
                  <div className="flex gap-4">
                    {news.imageUrl && (
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="w-40 h-28 object-cover rounded-lg flex-shrink-0 shadow-sm"
                      />
                    )}
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                        {news.category}
                      </span>
                      <h3 className="font-bold text-secondary mb-2 text-lg hover:text-primary transition-colors cursor-pointer">{news.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{news.excerpt}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(news.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-secondary flex items-center mb-6">
              <Calendar className="h-7 w-7 text-primary mr-3" />
              Events
            </h2>
            <Card>
              <div className="space-y-4">
                {mockEvents.slice(0, 4).map((event) => (
                  <div key={event.id} className="border-l-4 border-primary pl-4 py-2 hover:bg-muted/50 rounded-r-lg transition-colors cursor-pointer">
                    <h4 className="font-bold text-sm text-secondary mb-1">{event.title}</h4>
                    <p className="text-xs text-gray-600 mb-1 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.location}
                    </p>
                    <p className="text-xs text-primary font-semibold flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-secondary mb-8 flex items-center">
            <Zap className="h-7 w-7 text-primary mr-3" />
            Quick Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {mockQuickLinks.slice(0, 8).map((link) => {
              const Icon = iconMap[link.icon] || Zap;
              return (
                <Card key={link.id} hover>
                  <Link to={link.url} className="block text-center p-2">
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-xs text-secondary mb-1 leading-tight">{link.title}</h3>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-white shadow-vibrant">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the National System Operator Team</h2>
            <p className="text-lg text-gray-100 mb-8 leading-relaxed">
              Be part of Sri Lanka's energy future. We're looking for talented professionals to help power the nation forward.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/careers" 
                className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-glow inline-flex items-center justify-center"
              >
                View Career Opportunities <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/tenders" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold transition-all border border-white/30 inline-flex items-center justify-center"
              >
                Procurement & Tenders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
