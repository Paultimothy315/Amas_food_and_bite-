export default function About() {
  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold mb-4 text-secondary">Our Story</h1>
          <p className="text-secondary/70 text-lg">Made with Heart. Served with Speed.</p>
        </div>

        <div className="mb-12 rounded-3xl overflow-hidden shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80" 
            alt="Ama's Food & Bite Restaurant" 
            className="w-full h-[400px] object-cover"
          />
        </div>

        <div className="prose prose-lg max-w-none text-secondary/80 space-y-6">
          <p>
            Welcome to <strong>Ama's Food & Bite</strong>, where passion for authentic Nigerian flavors meets the convenience of fast service. 
            Founded with a simple mission: to provide delicious, high-quality meals that don't keep you waiting.
          </p>
          <p>
            We know that in today's fast-paced world, finding time for a good meal can be tough. That's why we've perfected our recipes 
            and our kitchen processes to ensure that whether you're grabbing a quick lunch, ordering dinner for the family, or sitting down 
            for a relaxed meal, you get the best quality food in record time.
          </p>
          <h2 className="text-3xl font-serif font-bold text-secondary mt-12 mb-6">Our Promise</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Fresh Ingredients:</strong> We source our ingredients locally to ensure every bite is fresh and flavorful.</li>
            <li><strong>Authentic Taste:</strong> From our spicy Asun to our rich Egusi soup, we stay true to the roots of Nigerian cuisine.</li>
            <li><strong>Fast Service:</strong> We value your time. Our streamlined kitchen means your food is ready when you need it.</li>
            <li><strong>Warm Hospitality:</strong> Every customer is treated like family. We want you to feel at home at Ama's.</li>
          </ul>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-serif font-bold text-secondary mb-6">Come Visit Us</h2>
          <p className="text-secondary/70 mb-8">Experience the taste in every bite at one of our locations.</p>
          <a 
            href="/contact" 
            className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-colors inline-block"
          >
            Find Our Locations
          </a>
        </div>
      </div>
    </div>
  );
}
