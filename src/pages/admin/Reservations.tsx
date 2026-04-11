import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Calendar, Clock, Users, MessageSquare, Trash2, CheckCircle, XCircle, Search, Phone, Clock as ClockIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Reservation {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: any;
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];
      setReservations(resData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reservations');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'confirmed' | 'cancelled' | 'pending') => {
    try {
      await updateDoc(doc(db, 'reservations', id), {
        status: newStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reservations/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;
    try {
      await deleteDoc(doc(db, 'reservations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reservations/${id}`);
    }
  };

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         res.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading reservations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary">Reservations</h1>
          <p className="text-secondary/70">Manage table bookings and customer requests</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
            <input 
              type="text" 
              placeholder="Search name or phone..."
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
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredReservations.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-border text-center">
            <Calendar className="mx-auto text-secondary/20 mb-4" size={48} />
            <p className="text-secondary/50 text-lg">No reservations found.</p>
          </div>
        ) : (
          filteredReservations.map((res) => (
            <div key={res.id} className="bg-white p-6 rounded-2xl shadow-sm border border-border hover:border-primary/30 transition-colors">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                        {res.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-secondary">{res.name}</h3>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}>
                          {res.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-secondary/50">
                      {res.createdAt?.seconds ? format(new Date(res.createdAt.seconds * 1000), 'MMM d, h:mm a') : 'Just now'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    <div className="flex items-center text-secondary/70">
                      <Calendar size={18} className="mr-2 text-primary" />
                      <span>{format(new Date(res.date), 'EEEE, MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center text-secondary/70">
                      <Clock size={18} className="mr-2 text-primary" />
                      <span>{res.time}</span>
                    </div>
                    <div className="flex items-center text-secondary/70">
                      <Users size={18} className="mr-2 text-primary" />
                      <span>{res.guests} Guests</span>
                    </div>
                    <div className="flex items-center text-secondary/70">
                      <Phone size={18} className="mr-2 text-primary" />
                      <span>{res.phone}</span>
                    </div>
                  </div>

                  {res.specialRequests && (
                    <div className="bg-muted p-4 rounded-xl flex gap-3">
                      <MessageSquare size={18} className="text-primary mt-1 flex-shrink-0" />
                      <p className="text-sm text-secondary/80 italic">"{res.specialRequests}"</p>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col justify-end gap-2 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
                  {res.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(res.id, 'confirmed')}
                        className="flex-1 lg:flex-none flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={18} className="mr-2" />
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleStatusChange(res.id, 'cancelled')}
                        className="flex-1 lg:flex-none flex items-center justify-center bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-colors"
                      >
                        <XCircle size={18} className="mr-2" />
                        Cancel
                      </button>
                    </>
                  )}
                  {res.status !== 'pending' && (
                    <button 
                      onClick={() => handleStatusChange(res.id, 'pending')}
                      className="flex-1 lg:flex-none flex items-center justify-center bg-muted text-secondary/70 px-4 py-2 rounded-xl font-bold hover:bg-border transition-colors"
                    >
                      <ClockIcon size={18} className="mr-2" />
                      Reset to Pending
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(res.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center text-red-400 hover:text-red-600 p-2 transition-colors"
                    title="Delete Reservation"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
