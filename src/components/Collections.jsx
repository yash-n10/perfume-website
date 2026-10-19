import React, { useState } from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

const products = [
  {
    id: 'belle',
    name: 'Mohera Belle',
    collection: 'Female Collection',
    category: 'female',
    punchline: 'Grace captured in every drop.',
    description: 'Designed for the effortlessly elegant woman, Mohera Belle opens with a soft bouquet of blooming flora wrapped in subtle, creamy sweetness. It strikes a seamless balance between delicate refinement and unforgettable charm, lingering close to the skin like a whispered promise. Perfect for daytime sophistication or intimate evenings, this fragrance embodies quiet confidence and timeless femininity.',
    image: '/mohera_bottle.jpg'
  },
  {
    id: 'elan',
    name: 'Mohera Elan',
    collection: 'Female Collection',
    category: 'female',
    punchline: 'Vivacious. Bold. Unapologetically you.',
    description: 'Mohera Elan is a high-energy fragrance crafted for the woman who commands every room she walks into. Featuring crisp, vibrant top notes that transition into a warm, intoxicating amber heart, it offers an alluring combination of freshness and depth. It is an inspiring scent that amplifies presence, making it the ultimate signature accessory for moments that require poise and flair.',
    image: '/mohera_bottle.jpg'
  },
  {
    id: 'drive',
    name: 'Mohera Drive',
    collection: 'Male Collection',
    category: 'male',
    punchline: 'Fuel your ambition.',
    description: 'Built for the modern man with relentless momentum, Mohera Drive blends sharp citrus zests with rugged, smoky undertones. It mirrors the feeling of an open road at dusk—invigorating, mysterious, and full of raw potential. The crisp top notes instantly awaken the senses before settling into a grounded, woody finish that leaves a lasting impression of focus and determination.',
    image: '/mohera_bottle.jpg'
  },
  {
    id: 'titan',
    name: 'Mohera Titan',
    collection: 'Male Collection',
    category: 'male',
    punchline: 'A presence carved in strength.',
    description: 'Mohera Titan is a commanding fragrance that pairs deep, aromatic woods with rich spices to create an aura of undisputed authority. Rich cedar, dark leather, and subtle warm spices weave together to give it a robust, magnetic depth that demands attention without saying a word. It is tailored for moments when quiet power and timeless masculinity take center stage.',
    image: '/mohera_bottle.jpg'
  },
  {
    id: 'luna',
    name: 'Mohera Luna',
    collection: 'Unisex Collection',
    category: 'unisex',
    punchline: 'Where shadows meet twilight.',
    description: 'Transcending traditional boundaries, Mohera Luna is a captivating blend of cool night-blooming botanicals, delicate musk, and smooth, velvety woods. Mystical and balanced, it mirrors the serene balance of moonlight, seamlessly adapting to the unique chemistry of whoever wears it. It provides an enigmatic, intoxicating veil that feels equally captivating at dusk or deep into the night.',
    image: '/mohera_bottle.jpg'
  }
];

export default function Collections() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <section id="collections-section" className="collections-section">
      <div className="section-header">
        <div className="section-eyebrow font-royal">
          <Sparkles size={14} className="gold-icon" />
          <span>Premium Fragrances | Eau de Parfum | For Him & Her</span>
        </div>
        <h2 className="section-title font-royal">
          Explore Our <span className="gold-gradient-text">Collection</span>
        </h2>
        <p className="section-subtitle font-poetic">
          Discover the art of personal fragrance with MOHERA — a collection created to celebrate individuality, elegance and confidence.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="collection-filter-tabs">
        <button
          onClick={() => setActiveCategory('all')}
          className={`filter-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
        >
          All Fragrances
        </button>
        <button
          onClick={() => setActiveCategory('female')}
          className={`filter-tab-btn ${activeCategory === 'female' ? 'active' : ''}`}
        >
          Female Collection
        </button>
        <button
          onClick={() => setActiveCategory('male')}
          className={`filter-tab-btn ${activeCategory === 'male' ? 'active' : ''}`}
        >
          Male Collection
        </button>
        <button
          onClick={() => setActiveCategory('unisex')}
          className={`filter-tab-btn ${activeCategory === 'unisex' ? 'active' : ''}`}
        >
          Unisex Collection
        </button>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card luxury-glass">
            {/* Bottle Image */}
            <div className="product-img-wrapper">
              <img
                src={product.image}
                alt={product.name}
                className="product-img"
                loading="lazy"
              />
              <div className="product-tag font-royal">
                {product.collection}
              </div>
            </div>

            {/* Product Content */}
            <div className="product-info">
              <h3 className="product-name font-royal gold-gradient-text">
                {product.name}
              </h3>
              <p className="product-punchline font-poetic">
                {product.punchline}
              </p>
              <p className="product-description">
                {product.description}
              </p>
              
              <div className="product-footer">
                <span className="product-status-pill font-royal">
                  Available Now
                </span>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('mohera-prefill-enquiry', {
                        detail: { productName: product.name }
                      })
                    );
                    const el = document.getElementById('enquiry-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="product-enquire-link font-royal"
                >
                  <span>Enquire</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
