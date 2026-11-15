import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowUpRight, ShoppingBag, Check } from 'lucide-react';
import { api, getAccessToken } from '../api';
import { addToGuestCart } from '../utils/cartManager';

const defaultProducts = [
  {
    id: 1,
    name: 'Mohera Belle',
    collection: 'Female Collection',
    category: 'female',
    price: 2499.00,
    punchline: 'Grace captured in every drop.',
    description: 'Designed for the effortlessly elegant woman, Mohera Belle opens with a soft bouquet of blooming flora wrapped in subtle, creamy sweetness. It strikes a seamless balance between delicate refinement and unforgettable charm, lingering close to the skin like a whispered promise. Perfect for daytime sophistication or intimate evenings, this fragrance embodies quiet confidence and timeless femininity.',
    image: '/products/belle_poster.jpeg'
  },
  {
    id: 2,
    name: 'Mohera Elan',
    collection: 'Female Collection',
    category: 'female',
    price: 2499.00,
    punchline: 'Vivacious. Bold. Unapologetically you.',
    description: 'Mohera Elan is a high-energy fragrance crafted for the woman who commands every room she walks into. Featuring crisp, vibrant top notes that transition into a warm, intoxicating amber heart, it offers an alluring combination of freshness and depth. It is an inspiring scent that amplifies presence, making it the ultimate signature accessory for moments that require poise and flair.',
    image: '/products/elan_poster.jpeg'
  },
  {
    id: 3,
    name: 'Mohera Drive',
    collection: 'Male Collection',
    category: 'male',
    price: 2499.00,
    punchline: 'Fuel your ambition.',
    description: 'Built for the modern man with relentless momentum, Mohera Drive blends sharp citrus zests with rugged, smoky undertones. It mirrors the feeling of an open road at dusk—invigorating, mysterious, and full of raw potential. The crisp top notes instantly awaken the senses before settling into a grounded, woody finish that leaves a lasting impression of focus and determination.',
    image: '/products/drive_poster.jpeg'
  },
  {
    id: 4,
    name: 'Mohera Titan',
    collection: 'Male Collection',
    category: 'male',
    price: 2499.00,
    punchline: 'A presence carved in strength.',
    description: 'Mohera Titan is a commanding fragrance that pairs deep, aromatic woods with rich spices to create an aura of undisputed authority. Rich cedar, dark leather, and subtle warm spices weave together to give it a robust, magnetic depth that demands attention without saying a word. It is tailored for moments when quiet power and timeless masculinity take center stage.',
    image: '/products/titan_poster.jpeg'
  },
  {
    id: 5,
    name: 'Mohera Luna',
    collection: 'Unisex Collection',
    category: 'upcoming',
    price: 2799.00,
    punchline: 'Grace and allure for unforgettable evenings.',
    description: 'Mohera Luna is a captivating fragrance crafted for the woman who shines effortlessly under any spotlight. Featuring luminous, ethereal top notes that transition into a soft, romantic floral and warm amber heart, it offers an enchanting combination of grace and allure. It is a mesmerizing scent that lingers with quiet confidence, making it the ultimate signature accessory for unforgettable evenings and moments of pure elegance.',
    image: '/products/luna_poster.jpeg',
    status: 'Coming Soon'
  }
];

const devinoireProducts = [
  { id: 6, name: 'Devinoire Aphira', shortName: 'aphira', price: 2999.00 },
  { id: 7, name: 'Devinoire Ares', shortName: 'ares', price: 2999.00 },
  { id: 8, name: 'Devinoire Athena', shortName: 'athena', price: 2999.00 },
  { id: 9, name: 'Devinoire Hades', shortName: 'hades', price: 2999.00 },
  { id: 10, name: 'Devinoire Hera', shortName: 'hera', price: 2999.00 },
  { id: 11, name: 'Devinoire Nereus', shortName: 'nereus', price: 2999.00 },
  { id: 12, name: 'Devinoire Orion', shortName: 'orion', price: 2999.00 },
  { id: 13, name: 'Devinoire Sephora', shortName: 'sephora', price: 2999.00 },
];

export default function Collections({ user, onRequireAuth, onCartUpdated, onOpenCart }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [backendProducts, setBackendProducts] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [justAddedId, setJustAddedId] = useState(null);

  // Fetch backend products to get exact DB IDs
  useEffect(() => {
    api.listProducts('active')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBackendProducts(data);
        }
      })
      .catch(() => {
        // use local defaults if backend products fetch fails
      });
  }, []);

  const findProductId = (product) => {
    const pName = (product.name || '').toLowerCase();
    if (backendProducts && backendProducts.length > 0) {
      const match = backendProducts.find((bp) => {
        const bpName = (bp.product_name || '').toLowerCase();
        return bpName === pName || bpName.includes(pName) || pName.includes(bpName);
      });
      if (match) return match.id;
    }
    if (typeof product.id === 'number') {
      return product.id;
    }
    return 1;
  };

  const handleAddToCart = async (product) => {
    setAddingId(product.id || product.name);
    try {
      const dbId = findProductId(product);

      let updatedCart;
      if (!getAccessToken()) {
        // Not logged in: store in session variable
        updatedCart = addToGuestCart({
          id: dbId,
          product_id: dbId,
          name: product.name,
          price: product.price,
          image: product.image || '/products/belle_poster.jpeg',
        }, 1);
      } else {
        // Logged in: store in database
        updatedCart = await api.addToCart(dbId, 1);
      }

      onCartUpdated?.(updatedCart);

      setJustAddedId(product.id || product.name);
      setTimeout(() => setJustAddedId(null), 1800);

      // Open cart drawer
      onOpenCart?.();
    } catch (err) {
      alert(err.message || 'Could not add to cart.');
    } finally {
      setAddingId(null);
    }
  };

  const filteredProducts = activeCategory === 'all'
    ? defaultProducts
    : defaultProducts.filter(p => p.category === activeCategory);

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
          {filteredProducts.map((product) => {
            const isAdding = addingId === (product.id || product.name);
            const isJustAdded = justAddedId === (product.id || product.name);
            const isAvailable = product.category !== 'upcoming';

            return (
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

                  {product.price && (
                    <div className="product-price-badge font-royal">
                      ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>

                {/* Product Content */}
                <div className="product-info">
                  <div className="product-title-row">
                    <h3 className="product-name font-royal gold-gradient-text">
                      {product.name}
                    </h3>
                  </div>

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

                    {isAvailable && (
                      <div className="product-actions-group">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          disabled={isAdding}
                          className={`btn-gold product-add-cart-btn font-royal ${isJustAdded ? 'just-added' : ''}`}
                          title="Add to shopping bag"
                        >
                          {isJustAdded ? (
                            <>
                              <Check size={14} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={14} />
                              <span>{isAdding ? 'Adding...' : 'Add to Bag'}</span>
                            </>
                          )}
                        </button>

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
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Devinoire Fragrance House Section */}
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
          {devinoireProducts.map((p) => {
            const isAdding = addingId === `devinoire-${p.name}`;
            const isJustAdded = justAddedId === `devinoire-${p.name}`;

            return (
              <article key={p.name} className="devinoire-product-card">
                <div className="devinoire-img-wrap">
                  <img
                    src={`/products/devinoire/${p.name.toLowerCase()}.jpeg`}
                    alt={`Devinoire ${p.name} perfume`}
                    className="devinoire-product-image"
                    loading="lazy"
                  />
                  <div className="devinoire-price-tag font-royal">
                    ₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="devinoire-card-body">
                  <h3 className="devinoire-product-name font-royal">{p.name.replace('Devinoire ', '')}</h3>
                  <button
                    type="button"
                    onClick={() => handleAddToCart({
                      id: p.id,
                      name: p.name,
                      price: p.price,
                      image: `/products/devinoire/${p.shortName || p.name.toLowerCase().replace('devinoire ', '')}.jpeg`
                    })}
                    disabled={isAdding}
                    className={`btn-gold devinoire-add-btn font-royal ${isJustAdded ? 'just-added' : ''}`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check size={13} />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={13} />
                        <span>{isAdding ? 'Adding...' : 'Add to Bag'}</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
