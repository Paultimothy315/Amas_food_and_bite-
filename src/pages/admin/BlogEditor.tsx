import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, Tag, Calendar, Check, X, Eye, EyeOff, Globe, Layout } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  status: 'draft' | 'published';
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: any;
}

const CATEGORIES = ["Food & Recipes", "Restaurant News", "Native Culture", "Events", "Health & Nutrition"];

export default function BlogEditor() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category: CATEGORIES[0],
    author: "Ama's Team",
    status: 'draft' as 'draft' | 'published',
    slug: '',
    metaTitle: '',
    metaDescription: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setPosts(blogData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blogPosts');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleOpenModal = (post: BlogPost | null = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
        category: post.category,
        author: post.author,
        status: post.status,
        slug: post.slug,
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || ''
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        category: CATEGORIES[0],
        author: "Ama's Team",
        status: 'draft',
        slug: '',
        metaTitle: '',
        metaDescription: ''
      });
    }
    setActiveTab('content');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      slug: formData.slug || generateSlug(formData.title),
      updatedAt: serverTimestamp()
    };

    try {
      if (editingPost) {
        await updateDoc(doc(db, 'blogPosts', editingPost.id), data);
      } else {
        await addDoc(collection(db, 'blogPosts'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingPost ? OperationType.UPDATE : OperationType.CREATE, 'blogPosts');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, 'blogPosts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `blogPosts/${id}`);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading blog posts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary">Blog CMS</h1>
          <p className="text-secondary/70">Manage articles, news, and SEO content</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-1"
        >
          <Plus size={20} className="mr-2" />
          New Post
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
        <input 
          type="text" 
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-2xl shadow-sm border border-border hover:border-primary/30 transition-all flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${post.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                    {post.status}
                  </span>
                  <span className="text-xs text-secondary/40 flex items-center">
                    <Tag size={12} className="mr-1" /> {post.category}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-secondary mb-1">{post.title}</h3>
                <p className="text-secondary/60 text-sm line-clamp-1">{post.excerpt}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center text-xs text-secondary/40">
                  <Calendar size={14} className="mr-1" />
                  {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                  <span className="mx-2">•</span>
                  <Globe size={14} className="mr-1" />
                  /{post.slug}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(post)}
                    className="p-2 bg-muted text-secondary rounded-lg hover:bg-secondary/5 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-serif font-bold text-secondary">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex bg-muted p-1 rounded-xl">
                  <button 
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'content' ? 'bg-white text-secondary shadow-sm' : 'text-secondary/50 hover:text-secondary'}`}
                  >
                    <Layout size={16} /> Content
                  </button>
                  <button 
                    onClick={() => setActiveTab('seo')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'seo' ? 'bg-white text-secondary shadow-sm' : 'text-secondary/50 hover:text-secondary'}`}
                  >
                    <Globe size={16} /> SEO
                  </button>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={24} className="text-secondary/50" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {activeTab === 'content' ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary">Post Title</label>
                      <input 
                        type="text" 
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="e.g. The Secret to Perfect Jollof Rice"
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
                      <label className="text-sm font-bold text-secondary">Featured Image URL</label>
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
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary">Status</label>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, status: 'draft'})}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${formData.status === 'draft' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'border-border text-secondary/40'}`}
                        >
                          <EyeOff size={18} /> Draft
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, status: 'published'})}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${formData.status === 'published' ? 'bg-green-50 border-green-500 text-green-700' : 'border-border text-secondary/40'}`}
                        >
                          <Eye size={18} /> Published
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Excerpt (Short Summary)</label>
                    <textarea 
                      required
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                      rows={2}
                      className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      placeholder="A brief summary for the blog listing page..."
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Content (Markdown supported)</label>
                    <textarea 
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      rows={12}
                      className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm"
                      placeholder="Write your article content here..."
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-muted p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold text-secondary flex items-center gap-2">
                      <Search size={18} className="text-primary" /> Google Search Preview
                    </h3>
                    <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
                      <p className="text-[#1a0dab] text-xl hover:underline cursor-pointer mb-1 truncate">
                        {formData.metaTitle || formData.title || 'Post Title'}
                      </p>
                      <p className="text-[#006621] text-sm mb-1 truncate">
                        https://amasfoodandbite.com/blog/{formData.slug || generateSlug(formData.title)}
                      </p>
                      <p className="text-[#545454] text-sm line-clamp-2">
                        {formData.metaDescription || formData.excerpt || 'Add a meta description to see how it looks in search results.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary">URL Slug</label>
                      <div className="flex">
                        <span className="bg-muted border border-r-0 border-border px-4 py-3 rounded-l-xl text-secondary/40 text-sm flex items-center">/blog/</span>
                        <input 
                          type="text" 
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          className="flex-1 p-3 border border-border rounded-r-xl focus:ring-2 focus:ring-primary/20 outline-none"
                          placeholder={generateSlug(formData.title)}
                        />
                      </div>
                      <p className="text-[10px] text-secondary/40 italic">Leave empty to auto-generate from title.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary">Meta Title</label>
                      <input 
                        type="text" 
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                        className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="SEO Title (defaults to post title)"
                      />
                      <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                        <span className={formData.metaTitle.length > 60 ? 'text-red-500' : 'text-secondary/40'}>
                          {formData.metaTitle.length} / 60 characters
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-secondary">Meta Description</label>
                      <textarea 
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                        rows={3}
                        className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                        placeholder="Brief description for search engines..."
                      ></textarea>
                      <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                        <span className={formData.metaDescription.length > 160 ? 'text-red-500' : 'text-secondary/40'}>
                          {formData.metaDescription.length} / 160 characters
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                  {editingPost ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
