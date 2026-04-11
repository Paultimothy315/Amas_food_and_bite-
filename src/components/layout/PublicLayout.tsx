import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, UtensilsCrossed, ShoppingCart, Instagram, Facebook } from 'lucide-react';
import WhatsAppButton from '../ui/WhatsAppButton';
import CartDrawer from '../ui/CartDrawer';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { cn } from '../../lib/utils';

export default function PublicLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState([
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'About', path: '/about' },
    { name: 'Reservations', path: '/reservations' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ]);
  const location = useLocation();
  const { itemCount, setIsCartOpen } = useCart();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'navigation'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.links) {
          setNavLinks(data.links.sort((a: any, b: any) => a.order - b.order));
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const businessName = "Ama's Food & Bite";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled || isMobileMenuOpen ? 'bg-secondary text-secondary-foreground shadow-md py-4' : 'bg-transparent text-secondary-foreground py-6'
        )}
      >
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-serif font-bold text-primary">
            <img 
              src="https://lh3.googleusercontent.com/d/1EmqPTH4tj_FUj-AEjqe1uKFT0hemqqoK" 
              alt="Logo" 
              className="h-8 w-8 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className={cn(isScrolled || isMobileMenuOpen ? 'text-secondary-foreground' : 'text-foreground')}>{settings.siteName}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'font-medium hover:text-primary transition-colors',
                  isScrolled ? 'text-secondary-foreground' : 'text-foreground',
                  location.pathname === link.path && 'text-primary'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:text-primary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={24} className={cn(isScrolled ? 'text-secondary-foreground' : 'text-foreground')} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {itemCount}
                </span>
              )}
            </button>

            <Link
              to="/menu"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              Order online
            </Link>
          </nav>

          {/* Mobile Menu Toggle & Cart */}
          <div className="flex items-center md:hidden space-x-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2"
              aria-label="Open cart"
            >
              <ShoppingCart size={24} className={cn(isScrolled || isMobileMenuOpen ? 'text-secondary-foreground' : 'text-foreground')} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              className="p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className={cn(isScrolled || isMobileMenuOpen ? 'text-secondary-foreground' : 'text-foreground')} />
              ) : (
                <Menu className={cn(isScrolled ? 'text-secondary-foreground' : 'text-foreground')} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-secondary text-secondary-foreground shadow-lg border-t border-secondary-foreground/10">
            <nav className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'text-lg font-medium p-2 hover:bg-secondary-foreground/10 rounded-md',
                    location.pathname === link.path && 'text-primary'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium text-center mt-4"
              >
                Order online
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-secondary text-secondary-foreground pt-16 pb-8">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link to="/" className="flex items-center space-x-2 text-2xl font-serif font-bold text-primary mb-4">
              <img 
                src="https://lh3.googleusercontent.com/d/1EmqPTH4tj_FUj-AEjqe1uKFT0hemqqoK" 
                alt="Logo" 
                className="h-8 w-8 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="text-white">{settings.siteName}</span>
            </Link>
            <p className="text-secondary-foreground/70 mb-6">
              {settings.siteDescription}
            </p>
            <div className="flex space-x-4">
              <a 
                href={settings.instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors text-white"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href={settings.facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors text-white"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-secondary-foreground/70 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/menu" className="text-secondary-foreground/70 hover:text-white transition-colors">Menu</Link></li>
              <li><Link to="/about" className="text-secondary-foreground/70 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/reservations" className="text-secondary-foreground/70 hover:text-white transition-colors">Reservations</Link></li>
              <li><Link to="/blog" className="text-secondary-foreground/70 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-secondary-foreground/70 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="text-secondary-foreground/70 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/contact" className="text-secondary-foreground/70 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/admin/login" className="text-secondary-foreground/20 hover:text-white transition-colors text-xs mt-4 inline-block">Admin Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Locations</h3>
            <div className="mb-4">
              <h4 className="font-semibold text-white">Lokogoma Branch</h4>
              <p className="text-secondary-foreground/70 text-sm">{settings.addressLokogoma}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white">Durumi Branch</h4>
              <p className="text-secondary-foreground/70 text-sm">{settings.addressDurumi}</p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 md:px-8 pt-8 border-t border-secondary-foreground/20 text-center text-secondary-foreground/50 text-sm">
          <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
        </div>
      </footer>

      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
}
