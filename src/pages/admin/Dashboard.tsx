import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { ShoppingBag, Calendar, Utensils, FileText, TrendingUp, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    reservations: 0,
    menuItems: 0,
    blogPosts: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch counts
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const resSnap = await getDocs(collection(db, 'reservations'));
        const menuSnap = await getDocs(collection(db, 'menuItems'));
        const blogSnap = await getDocs(collection(db, 'blogPosts'));

        setStats({
          orders: ordersSnap.size,
          reservations: resSnap.size,
          menuItems: menuSnap.size,
          blogPosts: blogSnap.size
        });

        // Listen for recent orders
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
        const unsubOrders = onSnapshot(ordersQuery, (snap) => {
          setRecentOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Listen for recent reservations
        const resQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'), limit(5));
        const unsubRes = onSnapshot(resQuery, (snap) => {
          setRecentReservations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        setLoading(false);
        return () => {
          unsubOrders();
          unsubRes();
        };
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'dashboard');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const statCards = [
    { name: 'Total Orders', value: stats.orders, icon: <ShoppingBag className="text-blue-600" />, color: 'bg-blue-50', link: '/admin/orders' },
    { name: 'Reservations', value: stats.reservations, icon: <Calendar className="text-green-600" />, color: 'bg-green-50', link: '/admin/reservations' },
    { name: 'Menu Items', value: stats.menuItems, icon: <Utensils className="text-orange-600" />, color: 'bg-orange-50', link: '/admin/menu' },
    { name: 'Blog Posts', value: stats.blogPosts, icon: <FileText className="text-purple-600" />, color: 'bg-purple-50', link: '/admin/blog' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-secondary">Welcome Back, Admin</h1>
        <p className="text-secondary/70">Here's what's happening at AMA'S FOOD AND BITE today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link 
            key={stat.name} 
            to={stat.link}
            className="bg-white p-6 rounded-2xl shadow-sm border border-border hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-secondary/50 text-sm font-medium">{stat.name}</p>
            <p className="text-3xl font-bold text-secondary">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="font-bold text-lg text-secondary flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary" /> Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-primary text-sm font-bold hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <p className="p-8 text-center text-secondary/40">No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-secondary">
                      #{order.id.slice(-4).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-secondary text-sm">{order.customerName}</p>
                      <p className="text-xs text-secondary/50">{order.orderType === 'delivery' ? 'Delivery' : 'Takeaway'} • ₦{order.total.toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="font-bold text-lg text-secondary flex items-center gap-2">
              <Calendar size={20} className="text-primary" /> Recent Reservations
            </h2>
            <Link to="/admin/reservations" className="text-primary text-sm font-bold hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentReservations.length === 0 ? (
              <p className="p-8 text-center text-secondary/40">No reservations yet.</p>
            ) : (
              recentReservations.map((res) => (
                <div key={res.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {res.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-secondary text-sm">{res.name}</p>
                      <p className="text-xs text-secondary/50">{format(new Date(res.date), 'MMM d')} at {res.time} • {res.guests} guests</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    res.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                    res.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {res.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-secondary text-white p-8 rounded-3xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-serif font-bold mb-4">Pro Tip: Keep your menu fresh!</h2>
          <p className="text-white/70 mb-6">
            Updating your menu with seasonal specials or marking sold-out items helps build trust with your customers. 
            You can also use the Blog CMS to share stories about your native dishes.
          </p>
          <Link to="/admin/menu" className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all">
            Update Menu Now <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>
        <Utensils className="absolute right-[-20px] bottom-[-20px] text-white/5 w-64 h-64 rotate-12" />
      </div>
    </div>
  );
}
