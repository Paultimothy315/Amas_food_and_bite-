import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useSettings } from '../../context/SettingsContext';
import { ShoppingBag, Calendar, Clock, MapPin, CheckCircle2, Package, Truck, Utensils, ArrowLeft, Bell, BellOff } from 'lucide-react';
import { format } from 'date-fns';
import { requestNotificationPermission, showNotification } from '../../lib/notifications';
import { cn } from '../../lib/utils';

export default function TrackOrder() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const { settings } = useSettings();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const prevStatus = useRef<string | null>(null);

  useEffect(() => {
    if (!id || !type) return;

    const collectionName = type === 'order' ? 'orders' : 'reservations';
    const docRef = doc(db, collectionName, id);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        setData({ id: docSnap.id, ...currentData });
        
        // Handle notifications
        if (prevStatus.current && prevStatus.current !== currentData.status) {
          handleStatusChange(currentData);
        }
        prevStatus.current = currentData.status;
      } else {
        setError(`${type === 'order' ? 'Order' : 'Reservation'} not found.`);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error tracking:", err);
      setError("Failed to load tracking data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, type]);

  const handleStatusChange = (currentData: any) => {
    if (!notificationsEnabled) return;

    const restaurantName = settings.siteName || "Ama's Food & Bite";
    
    if (type === 'order') {
      if (currentData.status === 'ready') {
        if (currentData.orderType === 'takeaway') {
          showNotification(`Your order is ready! 🍕`, {
            body: `Hi ${currentData.customerName}, your meal at ${restaurantName} is hot and ready for pickup. See you soon!`,
          });
        } else if (currentData.orderType === 'delivery') {
          showNotification(`Out for delivery! 🚗`, {
            body: `Good news! Your order #${id?.slice(-8).toUpperCase()} is on its way. Estimated arrival: ${currentData.estimatedTime || '30-45 mins'}.`,
          });
        }
      }
    } else if (type === 'reservation') {
      if (currentData.status === 'confirmed') {
        showNotification(`Your table is ready! ✨`, {
          body: `Your table for ${currentData.guests} is now available. We’ll hold it until you arrive.`,
        });
      }
    }
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
      } else {
        alert("Please enable notifications in your browser settings to receive updates.");
      }
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-secondary">{error || "Something went wrong"}</h1>
          <Link to="/" className="text-primary font-bold hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOrder = type === 'order';
  const statusSteps = isOrder 
    ? ['pending', 'confirmed', 'ready', 'delivered']
    : ['pending', 'confirmed', 'cancelled'];

  const currentStepIndex = statusSteps.indexOf(data.status);

  return (
    <div className="pt-32 pb-20 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-secondary text-white relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <Link to="/" className="text-white/60 hover:text-white flex items-center gap-1 text-sm mb-4 transition-colors">
                  <ArrowLeft size={16} /> Back to Home
                </Link>
                <h1 className="text-3xl font-serif font-bold mb-2">
                  {isOrder ? 'Track Your Order' : 'Reservation Status'}
                </h1>
                <p className="text-white/70">
                  {isOrder ? `Order #${id?.slice(-8).toUpperCase()}` : `Reservation for ${data.name}`}
                </p>
              </div>
              <button 
                onClick={toggleNotifications}
                className={cn(
                  "p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm",
                  notificationsEnabled ? "bg-primary text-white" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                {notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}
              </button>
            </div>
            <Utensils className="absolute right-[-20px] bottom-[-20px] text-white/5 w-48 h-48 rotate-12" />
          </div>

          {/* Status Tracker */}
          <div className="p-8 border-b border-border">
            <div className="relative flex justify-between">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-muted -z-0">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {statusSteps.map((step, index) => (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                    index <= currentStepIndex 
                      ? "bg-primary border-primary text-white" 
                      : "bg-white border-muted text-secondary/30"
                  )}>
                    {index < currentStepIndex ? <CheckCircle2 size={20} /> : (index + 1)}
                  </div>
                  <span className={cn(
                    "mt-2 text-xs font-bold uppercase tracking-wider",
                    index <= currentStepIndex ? "text-secondary" : "text-secondary/30"
                  )}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-secondary border-b border-border pb-2">Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg text-primary">
                    {isOrder ? <ShoppingBag size={18} /> : <Calendar size={18} />}
                  </div>
                  <div>
                    <p className="text-xs text-secondary/50 font-bold uppercase tracking-widest">
                      {isOrder ? 'Order Type' : 'Date & Time'}
                    </p>
                    <p className="font-bold text-secondary">
                      {isOrder 
                        ? (data.orderType === 'delivery' ? 'Delivery' : 'Takeaway')
                        : `${format(new Date(data.date), 'MMMM d, yyyy')} at ${data.time}`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg text-primary">
                    {isOrder ? <MapPin size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <p className="text-xs text-secondary/50 font-bold uppercase tracking-widest">
                      {isOrder ? 'Destination' : 'Status'}
                    </p>
                    <p className="font-bold text-secondary">
                      {isOrder 
                        ? (data.deliveryAddress || 'Pickup from Lokogoma Branch')
                        : data.status.charAt(0).toUpperCase() + data.status.slice(1)
                      }
                    </p>
                  </div>
                </div>

                {isOrder && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg text-primary">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-secondary/50 font-bold uppercase tracking-widest">Items</p>
                      <ul className="text-sm text-secondary/70">
                        {data.items?.map((item: any, i: number) => (
                          <li key={i}>{item.quantity}x {item.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-2xl border border-border flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                {data.status === 'pending' ? <Clock className="text-yellow-500 animate-pulse" size={32} /> : 
                 data.status === 'confirmed' ? <CheckCircle2 className="text-green-500" size={32} /> :
                 data.status === 'ready' ? <Package className="text-blue-500" size={32} /> :
                 data.status === 'delivered' ? <Truck className="text-primary" size={32} /> :
                 <Utensils className="text-secondary/20" size={32} />}
              </div>
              <div>
                <h4 className="font-bold text-secondary">
                  {data.status === 'pending' ? 'Waiting for confirmation' :
                   data.status === 'confirmed' ? 'Order confirmed!' :
                   data.status === 'ready' ? 'Ready for pickup!' :
                   data.status === 'delivered' ? 'Enjoy your meal!' : 'Status updated'}
                </h4>
                <p className="text-sm text-secondary/60 mt-1">
                  {data.status === 'pending' ? 'Our team is reviewing your request. We\'ll notify you once it\'s confirmed.' :
                   data.status === 'confirmed' ? 'We are preparing your delicious meal right now.' :
                   data.status === 'ready' ? 'Your meal is hot and ready. See you soon!' :
                   data.status === 'delivered' ? 'Thank you for choosing Ama\'s Food & Bite.' : 'Your status has been updated.'}
                </p>
              </div>
              {data.status === 'pending' && (
                <div className="pt-4 w-full">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 animate-progress"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-muted/20 border-t border-border flex flex-col sm:flex-row gap-4">
            <Link 
              to="/menu" 
              className="flex-1 bg-secondary text-white text-center py-3 rounded-xl font-bold hover:bg-primary transition-all"
            >
              Order More
            </Link>
            <a 
              href={`https://wa.me/${settings.phoneNumber || '2348165117588'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white border border-border text-secondary text-center py-3 rounded-xl font-bold hover:bg-muted transition-all flex items-center justify-center gap-2"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
