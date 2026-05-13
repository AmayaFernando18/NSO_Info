import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary/50 to-secondary/100 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Logo size="large" />
              <div>
                <h3 className="text-xl font-bold text-white">NSO</h3>
                <p className="text-sm text-gray-200">National System Operator (Pvt) Ltd</p>
              </div>
            </div>
            <p className="text-white/90 text-sm mb-4 leading-relaxed">
              Leading Sri Lanka's power system operations with sustainable and reliable energy solutions.
              Responsible for dispatch, planning, and procurement of electricity for the national grid.
            </p>
            <div className="flex flex-col space-y-2.5 text-sm text-white mb-4">
              <div className="flex items-center space-x-2 hover:text-yellow-300 transition-colors cursor-pointer">
                <MapPin className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>No. 50, Sir Chittampalam A. Gardiner Mw, Colombo 02, Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-yellow-300 transition-colors cursor-pointer">
                <Phone className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>0112 320 953</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-yellow-300 transition-colors cursor-pointer">
                <Mail className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span>gmgce@ceb.lk</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-3">
              <a href="#" className="bg-white/20 hover:bg-yellow-400 p-2.5 rounded-lg transition-all hover:scale-110">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/20 hover:bg-yellow-400 p-2.5 rounded-lg transition-all hover:scale-110">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/20 hover:bg-yellow-400 p-2.5 rounded-lg transition-all hover:scale-110">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/20 hover:bg-yellow-400 p-2.5 rounded-lg transition-all hover:scale-110">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Quick Links</h4>
            <ul className="space-y-3 text-sm text-white">
              <li>
                <Link to="/" className="hover:text-yellow-300 transition-colors hover:translate-x-1 inline-block">→ Home</Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-yellow-300 transition-colors hover:translate-x-1 inline-block">→ News & Updates</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-yellow-300 transition-colors hover:translate-x-1 inline-block">→ Career Opportunities</Link>
              </li>
              <li>
                <Link to="/corporate-profile" className="hover:text-yellow-300 transition-colors hover:translate-x-1 inline-block">→ Corporate Profile</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Resources</h4>
            <ul className="space-y-3 text-sm text-white">
              <li>
                <a href="#" className="hover:text-yellow-300 transition-colors hover:translate-x-1 inline-block">→ Safety Guidelines</a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-300 transition-colors hover:translate-x-1 inline-block">→ Training Portal</a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-300 transition-colors hover:translate-x-1 inline-block">→ Employee Services</a>
              </li>
              <li>
                <Link to="/downloads" className="hover:text-yellow-300 transition-colors hover:translate-x-1 inline-block">→ Downloads Centre</Link>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-300 transition-colors hover:translate-x-1 inline-block">→ IT Support</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white">
            <p className="mb-2 md:mb-0">
              &copy; 2026 National System Operator (Pvt) Ltd. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-yellow-300 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-yellow-300 transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-yellow-300 transition-colors">Help</a>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-white/70">
            🔒 Internal Portal - For Authorized Personnel Only
          </p>
        </div>
      </div>
    </footer>
  );
}
