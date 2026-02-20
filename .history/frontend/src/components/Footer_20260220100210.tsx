import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-secondary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Logo size="large" />
              <div>
                <h3 className="text-2xl font-bold">EGL</h3>
                <p className="text-sm text-gray-300">Electricity Generation Lanka (Pvt) Ltd</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Leading Sri Lanka's power generation sector with sustainable and reliable energy solutions.
              Responsible for hydropower, coal, thermal plants, and renewable energy generation.
            </p>
            <div className="flex flex-col space-y-2.5 text-sm text-gray-300 mb-4">
              <div className="flex items-center space-x-2 hover:text-accent transition-colors">
                <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                <span>No. 50, Dutugemunu Street, Colombo 02, Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-accent transition-colors">
                <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-accent transition-colors">
                <Mail className="h-4 w-4 text-accent flex-shrink-0" />
                <span>info@egl.lk</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-3">
              <a href="#" className="bg-white/10 hover:bg-accent p-2 rounded-lg transition-all hover:scale-110">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-accent p-2 rounded-lg transition-all hover:scale-110">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-accent p-2 rounded-lg transition-all hover:scale-110">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-accent p-2 rounded-lg transition-all hover:scale-110">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-accent text-lg">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-accent transition-colors hover:translate-x-1 inline-block">→ Home</Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-accent transition-colors hover:translate-x-1 inline-block">→ News & Updates</Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-accent transition-colors hover:translate-x-1 inline-block">→ Event Calendar</Link>
              </li>
              <li>
                <Link to="/generation" className="hover:text-accent transition-colors hover:translate-x-1 inline-block">→ Generation Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold mb-4 text-accent text-lg">Resources</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-accent transition-colors hover:translate-x-1 inline-block">→ Safety Guidelines</a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors hover:translate-x-1 inline-block">→ Training Portal</a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors hover:translate-x-1 inline-block">→ Employee Services</a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors hover:translate-x-1 inline-block">→ Technical Documents</a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors hover:translate-x-1 inline-block">→ IT Support</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p className="mb-2 md:mb-0">
              &copy; 2026 Electricity Generation Lanka (Pvt) Ltd. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-accent transition-colors">Help</a>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">
            🔒 Internal Portal - For Authorized Personnel Only
          </p>
        </div>
      </div>
    </footer>
  );
}
