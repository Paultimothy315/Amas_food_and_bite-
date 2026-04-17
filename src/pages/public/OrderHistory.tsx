import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ShoppingBag, Package, ChevronRight, Clock, MapPin, ReceiptText } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: any;
  orderType: 'takeaway' | 'delivery';
  customerName?: string;
  deliveryAddress?: string;
  pickupTime?: string;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const localOrderIds = JSON.parse(localStorage.getItem('ama_orders') || '[]');
      if (localOrderIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Reverse so newest orders are fetched first
        const uniqueIds = Array.from(new Set(localOrderIds)).reverse();
        const orderPromises = uniqueIds.map((id: string) => getDoc(doc(db, 'orders', id)));
        const orderSnaps = await Promise.all(orderPromises);
        
        const orderData = orderSnaps
          .filter(snap => snap.exists())
          .map(snap => ({
            id: snap.id,
            ...snap.data()
          })) as Order[];

        // Sort by date descending (backup if IDs aren't sequential)
        orderData.sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });

        setOrders(orderData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="pt-32 pb-20 bg-[#FDFCFB] min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
                <Link to="/" className="hover:underline">Home</Link>
                <ChevronRight size={12} />
                <span>Account</span>
                <ChevronRight size={12} />
                <span className="text-secondary/40">Orders</span>
              </nav>
              <h1 className="text-5xl font-serif font-bold text-secondary tracking-tight">Order History</h1>
              <p className="mt-4 text-secondary/60 text-lg max-w-xl leading-relaxed">
                Review your recent culinary choices and track active deliveries.
              </p>
            </div>
            <Link to="/menu" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-secondary transition-all shadow-lg hover:-translate-y-1">
              Place New Order
            </Link>
          </motion.div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-secondary/40 font-medium animate-pulse">Syncing your history...</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-16 rounded-[2.5rem] border border-border text-center space-y-6 shadow-sm"
          >
            <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={48} className="text-secondary/10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-secondary">No history found</h2>
              <p className="text-secondary/60 max-w-md mx-auto text-lg leading-relaxed">
                Your past delights will appear here. We prioritize your privacy—orders are stored only on this device.
              </p>
            </div>
            <Link to="/menu" className="inline-block bg-secondary text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary transition-all shadow-xl hover:-translate-y-1">
              Explore Our Menu
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-3xl shadow-sm border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-6 border-b border-border mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            order.status === 'confirmed' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            order.status === 'delivered' ? "bg-green-50 text-green-600 border-green-100" :
                            order.status === 'cancelled' ? "bg-red-50 text-red-600 border-red-100" :
                            "bg-yellow-50 text-yellow-600 border-yellow-100"
                          )}>
                            {order.status}
                          </span>
                          <span className="flex items-center gap-1.5 text-secondary/40 font-bold text-xs uppercase tracking-widest">
                            {order.orderType === 'delivery' ? <Package size={14} /> : <ShoppingBag size={14} />}
                            {order.orderType}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-secondary">
                          Order <span className="text-primary">#{order.id.slice(-8).toUpperCase()}</span>
                        </h3>
                        <div className="flex items-center gap-3 text-secondary/60 text-sm">
                          <span className="flex items-center gap-1"><Clock size={16} /> {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM d, p') : 'Just now'}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-border" />
                          <span className="flex items-center gap-1"><ReceiptText size={16} /> {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-1">Total Bill</p>
                        <p className="text-4xl font-serif font-bold text-primary">₦{order.total.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      <div className="flex-1 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-muted/50 p-4 rounded-2xl border border-border/50">
                            <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-2">Items</p>
                            <ul className="space-y-1.5">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="text-sm text-secondary flex justify-between">
                                  <span>{item.quantity}x {item.name}</span>
                                </li>
                              ))}
                              {order.items.length > 3 && (
                                <li className="text-xs text-primary font-bold">+{order.items.length - 3} more items</li>
                              )}
                            </ul>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-2xl border border-border/50">
                            <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-2">Location</p>
                            <div className="flex items-start gap-2 text-sm text-secondary">
                              <MapPin size={16} className="mt-0.5 text-primary opacity-50 shrink-0" />
                              <span className="line-clamp-2">
                                {order.orderType === 'delivery' 
                                  ? (order.deliveryAddress || 'Delivery Address') 
                                  : (order.pickupTime ? `Scheduled for ${order.pickupTime}` : 'Store Pickup')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center md:pl-8 md:border-l border-border mt-auto">
                        <Link 
                          to={`/track/order/${order.id}`}
                          className="w-full md:w-auto flex items-center justify-center gap-3 bg-secondary text-white px-10 py-4 rounded-[1.5rem] font-bold hover:bg-primary transition-all shadow-md group-hover:shadow-lg group-hover:-translate-y-1 active:translate-y-0"
                        >
                          Track Order <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
