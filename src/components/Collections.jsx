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
    image: '/products/belle_new.jpeg'
  },
  {
    id: 'elan',
    name: 'Mohera Elan',
    collection: 'Female Collection',
    category: 'female',
    punchline: 'Vivacious. Bold. Unapologetically you.',
    description: 'Mohera Elan is a high-energy fragrance crafted for the woman who commands every room she walks into. Featuring crisp, vibrant top notes that transition into a warm, intoxicating amber heart, it offers an alluring combination of freshness and depth. It is an inspiring scent that amplifies presence, making it the ultimate signature accessory for moments that require poise and flair.',
    image: '/products/elan_new.jpeg'
  },
  {
    id: 'drive',
    name: 'Mohera Drive',
    collection: 'Male Collection',
    category: 'male',
    punchline: 'Fuel your ambition.',
    description: 'Built for the modern man with relentless momentum, Mohera Drive blends sharp citrus zests with rugged, smoky undertones. It mirrors the feeling of an open road at dusk—invigorating, mysterious, and full of raw potential. The crisp top notes instantly awaken the senses before settling into a grounded, woody finish that leaves a lasting impression of focus and determination.',
    image: '/products/drive_new.jpeg'
  },
  {
    id: 'titan',
    name: 'Mohera Titan',
    collection: 'Male Collection',
    category: 'male',
    punchline: 'A presence carved in strength.',
    description: 'Mohera Titan is a commanding fragrance that pairs deep, aromatic woods with rich spices to create an aura of undisputed authority. Rich cedar, dark leather, and subtle warm spices weave together to give it a robust, magnetic depth that demands attention without saying a word. It is tailored for moments when quiet power and timeless masculinity take center stage.',
    image: '/products/titan_new.jpeg'
  },
  {
    id: 'luna',
    name: 'Mohera Luna',
    collection: 'Unisex Collection',
    category: 'upcoming',
    punchline: 'Grace and allure for unforgettable evenings.',
    description: 'Mohera Luna is a captivating fragrance crafted for the woman who shines effortlessly under any spotlight. Featuring luminous, ethereal top notes that transition into a soft, romantic floral and warm amber heart, it offers an enchanting combination of grace and allure. It is a mesmerizing scent that lingers with quiet confidence, making it the ultimate signature accessory for unforgettable evenings and moments of pure elegance.',
    image: '/products/luna_new.png',
    status: 'Coming Soon'
  }
];

const devinoireProducts = [
  'Aphira',
  'Ares',
  'Athena',
  'Hades',
  'Hera',
  'Nereus',
  'Orion',
  'Sephora'
];

export default function Collections() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <>
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
            onClick={() => setActiveCategory('upcoming')}
            className={`filter-tab-btn ${activeCategory === 'upcoming' ? 'active' : ''}`}
          >
            Upcoming
          </button>
        </div>

        {/* Products Grid */}
        <div className={`products-grid ${activeCategory === 'all' ? 'all-fragrances-grid' : ''}`}>
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
                    {product.status || 'Available Now'}
                  </span>
                  {product.category !== 'upcoming' && (
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
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="devinoire-section" aria-labelledby="devinoire-title">
        <div className="section-header">
          <div className="section-eyebrow font-royal">
            <Sparkles size={14} className="gold-icon" />
            <span>A new fragrance house</span>
          </div>
          <h2 id="devinoire-title" className="section-title font-royal">
            <span className="gold-gradient-text">Devinoire</span> Collection
          </h2>
          <p className="section-subtitle font-poetic">
            Discover eight distinctive fragrances, each with its story and notes featured in its artwork.
          </p>
        </div>

        <div className="devinoire-products-grid">
          {devinoireProducts.map((name) => (
            <article key={name} className="devinoire-product-card">
              <img
                src={`/products/devinoire/${name.toLowerCase()}.jpeg`}
                alt={`Devinoire ${name} perfume, with its fragrance description and notes`}
                className="devinoire-product-image"
                loading="lazy"
              />
              <h3 className="devinoire-product-name font-royal">{name}</h3>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
