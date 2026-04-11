import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { ShoppingBag, Clock, User, Phone, MapPin, Trash2, CheckCircle, XCircle, Search, Filter, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  orderType: 'takeaway' | 'delivery';
  deliveryAddress?: string;
  pickupTime?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'ready' | 'delivered' | 'cancelled';
  createdAt: any;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'ready' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(orderData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), {
        status: newStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.phoneNumber.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ready': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary">Orders</h1>
          <p className="text-secondary/70">Manage customer food orders and deliveries</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
            <input 
              type="text" 
              placeholder="Search customer or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="ready">Ready / Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-border text-center">
            <ShoppingBag className="mx-auto text-secondary/20 mb-4" size={48} />
            <p className="text-secondary/50 text-lg">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden hover:border-primary/30 transition-all">
              <div className="p-6 border-b border-border bg-muted/30 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                    #{order.id.slice(-4).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-secondary">{order.customerName}</h3>
                    <div className="flex items-center gap-2 text-sm text-secondary/50">
                      <Clock size={14} />
                      {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM d, h:mm a') : 'Just now'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${order.orderType === 'delivery' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                    {order.orderType.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Order Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-muted/20 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center font-bold text-xs text-primary">
                            {item.quantity}x
                          </span>
                          <span className="font-medium text-secondary">{item.name}</span>
                        </div>
                        <span className="font-bold text-secondary">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-3 flex justify-between items-center border-t border-dashed border-border">
                      <span className="font-bold text-secondary">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">₦{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Customer Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-secondary/70">
                        <Phone size={16} className="mr-3 text-primary" />
                        {order.phoneNumber}
                      </div>
                      {order.orderType === 'delivery' ? (
                        <div className="flex items-start text-sm text-secondary/70">
                          <MapPin size={16} className="mr-3 text-primary mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-secondary/70">
                          <Clock size={16} className="mr-3 text-primary" />
                          <span>Pickup at {order.pickupTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <h4 className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-3">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'confirmed')}
                          className="flex-1 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'ready')}
                          className="flex-1 flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                        >
                          {order.orderType === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup'}
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          className="flex-1 flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'ready') && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="flex-1 flex items-center justify-center bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(order.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
