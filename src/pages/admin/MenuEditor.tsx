import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, Tag, Info, Check, X } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isPopular?: boolean;
  isAvailable?: boolean;
  createdAt?: any;
}

const CATEGORIES = [
  "Swallow & Native Soups",
  "Rice Dishes",
  "Proteins (Meat & Fish)",
  "Fast Food & Sides",
  "Snacks",
  "Drinks"
];

export default function MenuEditor() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES[0],
    image: '',
    isPopular: false,
    isAvailable: true
  });

  useEffect(() => {
    const q = query(collection(db, 'menuItems'), orderBy('category'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menuData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setItems(menuData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'menuItems');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (item: MenuItem | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        image: item.image,
        isPopular: item.isPopular || false,
        isAvailable: item.isAvailable !== false
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: CATEGORIES[0],
        image: '',
        isPopular: false,
        isAvailable: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      updatedAt: serverTimestamp()
    };

    try {
      if (editingItem) {
        await updateDoc(doc(db, 'menuItems', editingItem.id), data);
      } else {
        await addDoc(collection(db, 'menuItems'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, 'menuItems');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await deleteDoc(doc(db, 'menuItems', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `menuItems/${id}`);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="p-8 text-center">Loading menu items...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary">Menu Editor</h1>
          <p className="text-secondary/70">Manage your restaurant offerings and pricing</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-1"
        >
          <Plus size={20} className="mr-2" />
          Add New Item
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
          <input 
            type="text" 
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white min-w-[200px]"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border group hover:border-primary/30 transition-all">
            <div className="h-40 relative overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2 flex gap-2">
                {item.isPopular && (
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Popular</span>
                )}
                {!item.isAvailable && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Sold Out</span>
                )}
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-secondary leading-tight">{item.name}</h3>
                <span className="text-primary font-bold">₦{item.price.toLocaleString()}</span>
              </div>
              <p className="text-secondary/60 text-sm mb-4 line-clamp-2 h-10">{item.description}</p>
              <div className="flex items-center gap-2 mb-6">
                <Tag size={14} className="text-primary" />
                <span className="text-xs font-medium text-secondary/50">{item.category}</span>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <button 
                  onClick={() => handleOpenModal(item)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted text-secondary font-bold rounded-xl hover:bg-secondary/5 transition-colors"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-serif font-bold text-secondary">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={24} className="text-secondary/50" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary">Item Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. Jollof Rice Special"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary">Price (₦)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. 2500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary">Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
                    <input 
                      type="url" 
                      required
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-secondary">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    placeholder="Describe the dish, ingredients, etc."
                  ></textarea>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 p-4 bg-muted rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isPopular ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}>
                    {formData.isPopular && <Check size={16} className="text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                  />
                  <span className="text-sm font-bold text-secondary">Mark as Popular</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isAvailable ? 'bg-green-500 border-green-500' : 'border-border group-hover:border-green-500/50'}`}>
                    {formData.isAvailable && <Check size={16} className="text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                  />
                  <span className="text-sm font-bold text-secondary">Currently Available</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-muted text-secondary font-bold rounded-2xl hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg"
                >
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
