import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Search } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  publishedAt: any;
  status: string;
}

const defaultPosts: BlogPost[] = [
  {
    id: '1',
    title: "The Secret to Our Signature Asun Rice",
    slug: "secret-to-asun-rice",
    excerpt: "Discover the traditional spices and cooking techniques that make our Asun Rice a customer favorite.",
    category: "Recipes",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    publishedAt: null,
    status: "published"
  },
  {
    id: '2',
    title: "New Branch Opening in Durumi!",
    slug: "new-branch-durumi",
    excerpt: "We are excited to announce the opening of our second branch at Zagada Oil & Gas Filling Station, Durumi 3.",
    category: "News",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    publishedAt: null,
    status: "published"
  },
  {
    id: '3',
    title: "Why Fresh Ingredients Matter",
    slug: "fresh-ingredients-matter",
    excerpt: "At Ama's, we source our ingredients daily from local farmers to ensure the best quality for your meals.",
    category: "Quality",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    publishedAt: null,
    status: "published"
  }
];

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>(defaultPosts);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'blogPosts'), 
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];
        setPosts(data);
      } else {
        setPosts(defaultPosts);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blogPosts');
      setPosts(defaultPosts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold mb-4 text-secondary">Latest from Our Kitchen</h1>
          <p className="text-secondary/70 text-lg max-w-2xl mx-auto">News, updates, and stories from Ama's Food & Bite.</p>
        </div>

        <div className="max-w-md mx-auto mb-16 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          <input 
            type="text" 
            placeholder="Search our blog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-full shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        {loading ? (
          <div className="text-center p-12 text-secondary/70">Loading stories...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center p-12 text-secondary/70">No stories found. Check back later!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article key={post.id} className="bg-surface rounded-2xl overflow-hidden shadow-md border border-border group hover:shadow-xl transition-shadow">
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={post.imageUrl || "https://picsum.photos/seed/restaurant/800/600"} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {post.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-secondary/60 text-sm mb-3">
                    <Calendar size={16} className="mr-2" />
                    {post.publishedAt ? format(post.publishedAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-secondary mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-secondary/70 mb-6 line-clamp-3 text-sm">
                    {post.excerpt}
                  </p>
                  <Link to={`/blog/${post.slug}`} className="inline-flex items-center text-primary font-bold hover:underline">
                    Read More <ArrowRight className="ml-2" size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
