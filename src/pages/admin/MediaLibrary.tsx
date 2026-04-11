import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Image as ImageIcon, Plus, Trash2, Copy, Check, Search, ExternalLink, X } from 'lucide-react';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  createdAt: any;
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [newMedia, setNewMedia] = useState({
    url: '',
    name: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mediaData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MediaItem[];
      setMedia(mediaData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'media');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'media'), {
        ...newMedia,
        type: 'image',
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewMedia({ url: '', name: '' });
      toast.success("Media added to library");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'media');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this item from library?")) return;
    try {
      await deleteDoc(doc(db, 'media', id));
      toast.success("Item removed");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `media/${id}`);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = media.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading media library...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary">Media Library</h1>
          <p className="text-secondary/70">Manage and reuse image assets across your site</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-1"
        >
          <Plus size={20} className="mr-2" />
          Add Media
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
        <input 
          type="text" 
          placeholder="Search by name or URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredMedia.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border group hover:border-primary/30 transition-all flex flex-col">
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => copyToClipboard(item.url, item.id)}
                  className="p-2 bg-white text-secondary rounded-lg hover:bg-primary hover:text-white transition-all"
                  title="Copy URL"
                >
                  {copiedId === item.id ? <Check size={18} /> : <Copy size={18} />}
                </button>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white text-secondary rounded-lg hover:bg-primary hover:text-white transition-all"
                  title="View Original"
                >
                  <ExternalLink size={18} />
                </a>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-secondary truncate" title={item.name}>{item.name || 'Untitled'}</p>
              <p className="text-[10px] text-secondary/40 mt-1">
                {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-secondary">Add to Library</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={24} className="text-secondary/50" />
              </button>
            </div>
            
            <form onSubmit={handleAddMedia} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">Asset Name</label>
                <input 
                  type="text" 
                  required
                  value={newMedia.name}
                  onChange={(e) => setNewMedia({...newMedia, name: e.target.value})}
                  className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Hero Image Background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
                  <input 
                    type="url" 
                    required
                    value={newMedia.url}
                    onChange={(e) => setNewMedia({...newMedia, url: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {newMedia.url && (
                <div className="mt-4 rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                  <img src={newMedia.url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x225?text=Invalid+Image+URL')} />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-muted text-secondary font-bold rounded-xl hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg"
                >
                  Add to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
