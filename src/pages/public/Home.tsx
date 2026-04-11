import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, Leaf, ThumbsUp, MapPin, Phone, Mail, MessageCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import SEO from '../../components/utils/SEO';

export default function Home() {
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const whatsappNumber = settings.whatsappNumber;
  const whatsappMessage = `Hello ${settings.siteName}, I would like to place an order!`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="flex flex-col w-full">
      <SEO />
      {/* 1. HERO SECTION */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80")' }}
        >
          <div className="absolute inset-0 bg-secondary/70"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center text-white mt-16">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Authentic Taste,<br/> <span className="text-primary">Lightning Fast.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-white/90">
            {settings.siteDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/menu"
              className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-transform hover:scale-105 w-full sm:w-auto text-center"
            >
              Order Now
            </Link>
            <Link 
              to="/reservations"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-secondary transition-colors w-full sm:w-auto"
            >
              Book a Table
            </Link>
          </div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <section className="bg-surface py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <ThumbsUp className="text-primary mb-2" size={32} />
              <span className="font-bold text-lg">500+ Happy Customers</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="text-primary mb-2" size={32} />
              <span className="font-bold text-lg">15-Minute Fast Service</span>
            </div>
            <div className="flex flex-col items-center">
              <Leaf className="text-primary mb-2" size={32} />
              <span className="font-bold text-lg">100% Fresh Ingredients</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="text-primary mb-2" size={32} />
              <span className="font-bold text-lg">4.9 Google Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SNAPSHOT */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-serif font-bold mb-6 text-secondary">Our Story</h2>
              <h3 className="text-xl font-bold text-primary mb-4">Made with Heart. Served with Speed.</h3>
              <p className="text-lg text-secondary/80 mb-6 leading-relaxed">
                At Ama's Food & Bite, we believe that fast food shouldn't mean compromising on quality or authentic flavor. 
                Our chefs use traditional recipes and the freshest local ingredients to bring you the true taste of home, 
                served with the efficiency of a modern kitchen.
              </p>
              <Link to="/about" className="inline-flex items-center text-primary font-bold hover:underline text-lg">
                Read Our Story <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80" 
                alt="Ama's Food & Bite Interior" 
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. MENU PREVIEW */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 text-secondary">Popular Dishes</h2>
            <p className="text-secondary/70 max-w-2xl mx-auto text-lg">A taste of what our customers love the most.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 'r1', name: "Asun Rice", price: 2667, desc: "Spicy roasted goat meat mixed with flavorful native rice.", img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80" },
              { id: 'r5', name: "Ofada Rice and Sauce", price: 6350, desc: "Traditional unpolished rice served with spicy Ayamase sauce.", img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80" },
              { id: 'sw3', name: "Fisherman Soup", price: 17450, desc: "Luxury seafood soup loaded with fresh catch from the river.", img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80" },
              { id: 'p4', name: "Grilled Catfish & Chips", price: 10000, desc: "Whole grilled catfish marinated in special spices, served with crispy chips.", img: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80" },
              { id: 'sn1', name: "Shawarma (Sausage)", price: 5000, desc: "Chicken shawarma with sausage and creamy filling.", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80" },
              { id: 'd4', name: "Zobo or Tigernut Drink", price: 3000, desc: "Traditional Zobo or creamy Tigernut milk.", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80" }
            ].map((item, i) => (
              <div key={i} className="bg-surface rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
                <div className="h-48 overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold font-serif text-secondary">{item.name}</h3>
                    <span className="text-primary font-bold">₦{item.price.toLocaleString()}</span>
                  </div>
                  <p className="text-secondary/70 mb-6 text-sm h-10">{item.desc}</p>
                  <button 
                    onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                    className="flex items-center justify-center w-full text-center bg-secondary text-white py-3 rounded-xl font-medium hover:bg-primary transition-colors"
                  >
                    Order
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/menu" className="inline-flex items-center justify-center bg-transparent border-2 border-secondary text-secondary px-8 py-4 rounded-full font-bold hover:bg-secondary hover:text-white transition-colors">
              View Full Menu <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. WHATSAPP ORDER SECTION */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Order in Seconds — No App Needed</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-white/90">
            Chat with us directly on WhatsApp to place your order. Fast, easy, and personal. Available during opening hours.
          </p>
          
          <div className="bg-white p-8 rounded-3xl inline-block mb-8 shadow-2xl">
            <div className="w-48 h-48 bg-white flex items-center justify-center rounded-xl mb-4 mx-auto border border-border p-2">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/${whatsappNumber}`} 
                alt="WhatsApp QR Code" 
                className="w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-secondary font-bold text-xl">0816 511 7588</p>
            <p className="text-xs text-secondary/50 mt-1 font-bold uppercase tracking-widest">Scan to Order</p>
          </div>
          
          <div>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#25D366] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#1ebe57] transition-colors shadow-lg"
            >
              <MessageCircle className="mr-2" size={24} /> Order on Whatsapp
            </a>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4 text-secondary">What Our Customers Say</h2>
            <p className="text-secondary/70 max-w-2xl mx-auto text-lg">Don't just take our word for it.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Chidi O.", review: "Best fast food I've had in Abuja. The Ama Classic never disappoints!", rating: 5 },
              { name: "Fatima A.", review: "Quick service and the food is always hot and fresh. 10/10.", rating: 5 },
              { name: "Emeka N.", review: "Ordered via WhatsApp and it was delivered perfectly. So easy!", rating: 5 }
            ].map((t, i) => (
              <div key={i} className="bg-surface p-8 rounded-2xl shadow-sm border border-border">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} fill="currentColor" size={20} />)}
                </div>
                <p className="text-secondary/80 italic mb-6 text-lg">"{t.review}"</p>
                <p className="font-bold text-secondary">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. LOCATION & HOURS */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-serif font-bold mb-8 text-secondary">Find Us</h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <MapPin className="text-primary mt-1 mr-4 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-secondary">Lokogoma Branch</h3>
                    <p className="text-secondary/70">Plot 501 Gaduwa Express Way,<br/>beside Maxcare Plaza, Abuja</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="text-primary mt-1 mr-4 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-secondary">Durumi Branch</h3>
                    <p className="text-secondary/70">Zagada Oil & Gas Filling Station,<br/>Durumi 3, along Gudu Road, Abuja</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="text-primary mt-1 mr-4 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-secondary">Opening Hours</h3>
                    <ul className="text-secondary/70 space-y-1">
                      <li>Monday – Friday: 9:00 AM – 10:00 PM</li>
                      <li>Saturday: 10:00 AM – 11:00 PM</li>
                      <li>Sunday: 12:00 PM – 9:00 PM</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="text-primary mt-1 mr-4 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-secondary">Contact</h3>
                    <p className="text-secondary/70">{settings.contactPhone} / {settings.contactPhoneSecondary}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="flex flex-col items-center">
                <h3 className="font-bold text-lg mb-3 text-secondary text-center">Branches Map</h3>
                <div className="w-full rounded-2xl overflow-hidden shadow-lg bg-gray-200 h-[450px] border border-border">
                  <iframe 
                    src="https://maps.google.com/maps?q=Ama's%20Food%20%26%20Bite%20Abuja&t=&z=12&ie=UTF8&iwloc=&output=embed" 
                    width="100%" 
                    height="450" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy"
                    title="Ama's Food & Bite Branches Map"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
