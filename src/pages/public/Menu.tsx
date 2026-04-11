import { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Search } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
}

const defaultMenuItems: MenuItem[] = [
  // Rice & Native Dishes
  { id: 'r1', name: "Asun Rice", price: 2667, description: "Spicy roasted goat meat mixed with flavorful native rice.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80", category: "Rice & Native Dishes", isAvailable: true },
  { id: 'r2', name: "Jollof or Fried Rice", price: 2150, description: "Classic Nigerian Jollof or Fried rice served with your choice of protein.", image: "https://images.unsplash.com/photo-1567333160917-1ba127c446f3?auto=format&fit=crop&w=600&q=80", category: "Rice Dishes", isAvailable: true },
  { id: 'r3', name: "Special Fish Rice", price: 3780, description: "Fragrant rice served with specially seasoned fried fish.", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80", category: "Rice Dishes", isAvailable: true },
  { id: 'r4', name: "Coconut Rice", price: 2450, description: "Rich and creamy rice cooked in fresh coconut milk.", image: "https://images.unsplash.com/photo-1536392706976-e486e2ba97af?auto=format&fit=crop&w=600&q=80", category: "Rice Dishes", isAvailable: true },
  { id: 'r5', name: "Ofada Rice and Sauce", price: 6350, description: "Traditional unpolished rice served with spicy Ayamase (green pepper) sauce.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80", category: "Rice Dishes", isAvailable: true },

  // Swallow & Soups
  { id: 'sw1', name: "Soup Only (Okro, Egusi, Bitter Leaf)", price: 2150, description: "A rich serving of your favorite traditional soup.", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80", category: "Swallow & Native Soups", isAvailable: true },
  { id: 'sw2', name: "Special Soups (Oha, Banga, Afang)", price: 2667, description: "Premium traditional soups made with authentic ingredients.", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80", category: "Swallow & Native Soups", isAvailable: true },
  { id: 'sw3', name: "Fisherman Soup", price: 17450, description: "Luxury seafood soup loaded with fresh catch from the river.", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80", category: "Swallow & Native Soups", isAvailable: true },
  { id: 'sw4', name: "Swallow (Semo, Garri, Fufu)", price: 660, description: "Your choice of traditional swallow to accompany your soup.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80", category: "Swallow & Native Soups", isAvailable: true },
  { id: 'sw5', name: "Pounded Yam or Amala", price: 1150, description: "Freshly pounded yam or traditional Amala.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80", category: "Swallow & Native Soups", isAvailable: true },

  // Proteins & Grills
  { id: 'p1', name: "Fried or Sauced Chicken", price: 2225, description: "Crispy fried or succulent sauced chicken piece.", image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80", category: "Proteins (Meat & Fish)", isAvailable: true },
  { id: 'p2', name: "Fried or Sauced Turkey", price: 6600, description: "Large piece of fried or sauced turkey.", image: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=600&q=80", category: "Proteins (Meat & Fish)", isAvailable: true },
  { id: 'p3', name: "Cow Leg or Cow Head", price: 4667, description: "Tenderly cooked cow leg or head in spicy sauce.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", category: "Proteins (Meat & Fish)", isAvailable: true },
  { id: 'p4', name: "Grilled Catfish & Chips", price: 10000, description: "Whole grilled catfish with a side of crispy chips.", image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80", category: "Proteins (Meat & Fish)", isAvailable: true },
  { id: 'p5', name: "Titus Fish", price: 2225, description: "Fried or sauced Titus fish.", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80", category: "Proteins (Meat & Fish)", isAvailable: true },

  // Snacks & Fast Food
  { id: 'sn1', name: "Shawarma (Single/Sausage)", price: 5000, description: "Chicken shawarma with sausage and creamy filling.", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80", category: "Fast Food & Sides", isAvailable: true },
  { id: 'sn2', name: "Pizza (Small to Large)", price: 17780, description: "Freshly baked pizza with your favorite toppings.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", category: "Fast Food & Sides", isAvailable: true },
  { id: 'sn3', name: "Meat Pie / Sausage Roll / Donuts", price: 1150, description: "Freshly baked snacks for a quick bite.", image: "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=600&q=80", category: "Snacks", isAvailable: true },
  { id: 'sn4', name: "Chicken Wings and Chips", price: 5500, description: "Spicy chicken wings served with golden chips.", image: "https://images.unsplash.com/photo-1567622411816-494cbb147075?auto=format&fit=crop&w=600&q=80", category: "Fast Food & Sides", isAvailable: true },

  // Drinks & Refreshments
  { id: 'd2', name: "Fresh Watermelon or Orange Juice", price: 3000, description: "100% natural freshly squeezed fruit juice.", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80", category: "Drinks", isAvailable: true },
  { id: 'd3', name: "Smoothies", price: 5000, description: "Thick and creamy fruit smoothies.", image: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=600&q=80", category: "Drinks", isAvailable: true },
  { id: 'd4', name: "Zobo or Tigernut Drink", price: 3000, description: "Traditional Zobo or creamy Tigernut milk.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80", category: "Drinks", isAvailable: true },
  { id: 'd5', name: "Soft Drinks (Coke, Fanta, Sprite)", price: 800, description: "Chilled carbonated soft drinks.", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80", category: "Drinks", isAvailable: true },
  { id: 'd1', name: "Chilled Zobo Punch", price: 800, description: "Refreshing traditional hibiscus drink infused with pineapple and ginger.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80", category: "Drinks", isAvailable: true }
];

export default function Menu() {
  const { addToCart } = useCart();
  const [items, setItems] = useState<MenuItem[]>(defaultMenuItems);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'menuItems'), orderBy('category'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[];
        setItems(data.filter(item => item.isAvailable !== false));
      } else {
        setItems(defaultMenuItems);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'menuItems');
      setItems(defaultMenuItems);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categoryOrder = [
    "Swallow & Native Soups",
    "Rice Dishes",
    "Proteins (Meat & Fish)",
    "Fast Food & Sides",
    "Snacks",
    "Drinks"
  ];

  const categories = (Array.from(new Set(items.map(i => i.category))) as string[]).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  if (categories.length === 0 && !loading) categories.push('Main Dishes');

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold mb-4 text-secondary">Our Menu</h1>
          <p className="text-secondary/70 max-w-2xl mx-auto text-lg">Explore our wide variety of dishes, from traditional native meals to fast food favorites.</p>
        </div>

        <div className="max-w-md mx-auto mb-12 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          <input 
            type="text" 
            placeholder="Search for your favorite dish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-full shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        {loading ? (
          <div className="text-center p-12 text-secondary/70">Loading our delicious menu...</div>
        ) : items.length === 0 ? (
          <div className="text-center p-12 text-secondary/70">No menu items found. Check back soon!</div>
        ) : (
          <Tabs.Root defaultValue={categories[0]} className="flex flex-col items-center w-full">
            <Tabs.List className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((cat) => (
                <Tabs.Trigger
                  key={cat}
                  value={cat}
                  className={cn(
                    "px-6 py-3 rounded-full font-medium transition-colors border-2",
                    "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary",
                    "data-[state=inactive]:bg-transparent data-[state=inactive]:text-secondary data-[state=inactive]:border-border hover:data-[state=inactive]:border-secondary"
                  )}
                >
                  {cat}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {categories.map((cat) => (
              <Tabs.Content key={cat} value={cat} className="w-full focus:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.filter(item => item.category === cat).map((item) => (
                    <div key={item.id} className="bg-surface rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group border border-border">
                      <div className="h-56 overflow-hidden">
                        <img 
                          src={item.image || "https://picsum.photos/seed/food/800/600"} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold font-serif text-secondary">{item.name}</h3>
                          <span className="text-primary font-bold">₦{item.price.toLocaleString()}</span>
                        </div>
                        <p className="text-secondary/70 mb-6 text-sm h-10 line-clamp-2">{item.description}</p>
                        <button 
                          onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                          className="flex items-center justify-center w-full text-center bg-secondary text-white py-3 rounded-xl font-medium hover:bg-primary transition-colors"
                        >
                          <ShoppingCart size={18} className="mr-2" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Tabs.Content>
            ))}
          </Tabs.Root>
        )}
      </div>
    </div>
  );
}
