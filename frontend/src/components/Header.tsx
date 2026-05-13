import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { canAccessAdmin } from '../utils/rbac';

export default function Header() {
  const { user, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <img 
              src="/images/nso-logo.jpeg" 
              alt="NSO Logo" 
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <h1 className="text-xl font-bold text-secondary">NSO Info</h1>
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center space-x-2 flex-1 justify-center">
            <Link 
              to="/" 
              className="px-4 py-2 text-base text-secondary font-medium rounded-lg hover:bg-primary/10 transition-all duration-200"
            >
              Home
            </Link>
            
            <Link 
              to="/careers" 
              className="px-4 py-2 text-base text-secondary font-medium rounded-lg hover:bg-primary/10 transition-all duration-200"
            >
              Careers
            </Link>
            <Link 
              to="/gallery" 
              className="px-4 py-2 text-base text-secondary font-medium rounded-lg hover:bg-primary/10 transition-all duration-200"
            >
              Gallery
            </Link>
            <Link 
              to="/downloads" 
              className="px-4 py-2 text-base text-secondary font-medium rounded-lg hover:bg-primary/10 transition-all duration-200"
            >
              Downloads
            </Link>
            <Link 
              to="/corporate-profile" 
              className="px-4 py-2 text-base text-secondary font-medium rounded-lg hover:bg-primary/10 transition-all duration-200"
            >
              Corporate Profile
            </Link>
            {canAccessAdmin(user) && (
              <Link 
                to="/admin" 
                className="px-4 py-2 text-base text-secondary font-medium rounded-lg hover:bg-primary/10 transition-all duration-200 flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* User Actions - Right */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {user && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-secondary">{user.name}</span>
              </div>
            )}
            {user && (
              <button
                onClick={logout}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors hidden md:block"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/news"
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                News
              </Link>
              <Link
                to="/corporate-profile"
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Corporate Profile
              </Link>
              <Link
                to="/careers"
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Careers
              </Link>
              <Link
                to="/gallery"
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link
                to="/downloads"
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Downloads
              </Link>
              {canAccessAdmin(user) && (
                <Link
                  to="/admin"
                  className="px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center space-x-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
              {user && (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors text-left flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
