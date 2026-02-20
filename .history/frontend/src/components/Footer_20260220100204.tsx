import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin, ChevronRight, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-greenDark text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-accent to-gold p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-accent">NSO</h3>
                <p className="text-xs text-gray-300">National System Operator</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              No 50<br />
              Sir Chittampalam A. Gardiner Mw,<br />
              Colombo 2
            </p>
            <div className="flex flex-col space-y-2 text-sm text-gray-300 mb-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                <span>0112 320 953</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-accent flex-shrink-0" />
                <span>gmgce@ceb.lk</span>
              </div>
            </div>
            {/* Social Media */}
            <div className="flex space-x-3">
              <a href="#" className="bg-white/10 hover:bg-accent/20 p-2 rounded transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-accent/20 p-2 rounded transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-accent/20 p-2 rounded transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-accent/20 p-2 rounded transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Corporate Profile */}
          <div>
            <h4 className="font-semibold mb-4 text-accent uppercase text-sm">Corporate Profile</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Board Members
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Corporate Management Team
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Vision
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Mission
                </a>
              </li>
            </ul>
          </div>

          {/* Publications & Media */}
          <div>
            <h4 className="font-semibold mb-4 text-accent uppercase text-sm">Publications & Media</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Distribution
                </a>
              </li>
            </ul>
          </div>

          {/* Procurement */}
          <div>
            <h4 className="font-semibold mb-4 text-accent uppercase text-sm">Procurement</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/tenders" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Tender Notice
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Tender Awards
                </a>
              </li>
              <li>
                <Link to="/specifications" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  CEB Standard Specifications
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  eGP System
                </a>
              </li>
            </ul>
          </div>

          {/* Additional Links */}
          <div>
            <h4 className="font-semibold mb-4 text-accent uppercase text-sm">Media Gallery</h4>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Our Powerplants
                </a>
              </li>
            </ul>

            <h4 className="font-semibold mb-4 text-accent uppercase text-sm">Business with CEB</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  What is NCRE
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  National Energy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Service Agreements
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  More Details
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Secondary Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 pt-8 border-t border-gray-700">
          {/* Contact Us */}
          <div>
            <h4 className="font-semibold mb-4 text-accent uppercase text-sm">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Right to Information
                </a>
              </li>
            </ul>
          </div>

          {/* Knowledge Hub */}
          <div>
            <h4 className="font-semibold mb-4 text-accent uppercase text-sm">Knowledge Hub</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  History of Electricity in Sri Lanka
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  How Does a Power Plant Operate
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  What is Demand Side Management
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Introduction to Renewable Energy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Awareness is Power
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  CEB Transmission Network
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  CEB Generation Network
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  International Standards
                </a>
              </li>
            </ul>
          </div>

          {/* Careers & Corporate Responsibility */}
          <div>
            <h4 className="font-semibold mb-4 text-accent uppercase text-sm">Careers</h4>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li>
                <Link to="/careers" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Join Our Team
                </Link>
              </li>
            </ul>

            <h4 className="font-semibold mb-4 text-accent uppercase text-sm">Corporate Responsibility</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  CSR Initiatives
                </a>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h4 className="font-semibold mb-4 text-accent uppercase text-sm">FAQ</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-accent transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; Copyright All Rights Reserved</p>
          <p className="mt-2">Developed by CEB....</p>
        </div>
      </div>
    </footer>
  );
}
