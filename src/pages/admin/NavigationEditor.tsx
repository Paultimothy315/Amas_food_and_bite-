import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Link as LinkIcon, Plus, Trash2, Save, GripVertical, X } from 'lucide-react';
import { toast } from 'sonner';

interface NavLink {
  id: string;
  name: string;
  path: string;
  order: number;
}

export default function NavigationEditor() {
  const [links, setLinks] = useState<NavLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<NavLink | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'navigation'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLinks(data.links || []);
      } else {
        // Default links if none exist in DB
        setLinks([
          { id: '1', name: 'Home', path: '/', order: 0 },
          { id: '2', name: 'Menu', path: '/menu', order: 1 },
          { id: '3', name: 'About', path: '/about', order: 2 },
          { id: '4', name: 'Reservations', path: '/reservations', order: 3 },
          { id: '5', name: 'Blog', path: '/blog', order: 4 },
          { id: '6', name: 'Contact', path: '/contact', order: 5 },
        ]);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/navigation');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (updatedLinks: NavLink[]) => {
    try {
      await setDoc(doc(db, 'settings', 'navigation'), {
        links: updatedLinks.sort((a, b) => a.order - b.order)
      });
      toast.success("Navigation updated successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/navigation');
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Remove this link from navigation?")) return;
    const updated = links.filter(l => l.id !== id);
    handleSave(updated);
  };

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const path = formData.get('path') as string;

    let updatedLinks: NavLink[];
    if (editingLink) {
      updatedLinks = links.map(l => l.id === editingLink.id ? { ...l, name, path } : l);
    } else {
      const newLink: NavLink = {
        id: Date.now().toString(),
        name,
        path,
        order: links.length
      };
      updatedLinks = [...links, newLink];
    }

    handleSave(updatedLinks);
    setIsModalOpen(false);
    setEditingLink(null);
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;

    const temp = newLinks[index].order;
    newLinks[index].order = newLinks[targetIndex].order;
    newLinks[targetIndex].order = temp;

    handleSave(newLinks);
  };

  if (loading) return <div className="p-8 text-center">Loading navigation...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary">Navigation Editor</h1>
          <p className="text-secondary/70">Manage the main menu links of your website</p>
        </div>
        
        <button 
          onClick={() => {
            setEditingLink(null);
            setIsModalOpen(true);
          }}
          className="flex items-center bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
        >
          <Plus size={20} className="mr-2" />
          Add Link
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {links.sort((a, b) => a.order - b.order).map((link, index) => (
            <div key={link.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="text-secondary/20 cursor-grab active:cursor-grabbing">
                  <GripVertical size={20} />
                </div>
                <div>
                  <p className="font-bold text-secondary">{link.name}</p>
                  <p className="text-xs text-secondary/40 font-mono">{link.path}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1 mr-4">
                  <button 
                    onClick={() => moveLink(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-muted rounded text-secondary/40 disabled:opacity-20"
                  >
                    <Plus size={14} className="rotate-45" /> {/* Using Plus as a simple arrow for now */}
                  </button>
                  <button 
                    onClick={() => moveLink(index, 'down')}
                    disabled={index === links.length - 1}
                    className="p-1 hover:bg-muted rounded text-secondary/40 disabled:opacity-20"
                  >
                    <Plus size={14} className="rotate-[135deg]" />
                  </button>
                </div>
                <button 
                  onClick={() => {
                    setEditingLink(link);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-secondary/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(link.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-secondary">
                {editingLink ? 'Edit Link' : 'Add New Link'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={24} className="text-secondary/50" />
              </button>
            </div>
            
            <form onSubmit={handleAddOrEdit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">Link Name</label>
                <input 
                  name="name"
                  type="text" 
                  required
                  defaultValue={editingLink?.name || ''}
                  className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Our Story"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary">Path / URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
                  <input 
                    name="path"
                    type="text" 
                    required
                    defaultValue={editingLink?.path || ''}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="/about or https://..."
                  />
                </div>
              </div>

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
                  {editingLink ? 'Update Link' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
