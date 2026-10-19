import React, { useState, useEffect } from 'react';
import { Mail, Phone, Send, MessageSquare, Check, Sparkles } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    enquiry: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Listen for prefilled enquiry from fragrance cards
  useEffect(() => {
    const handlePrefill = (e) => {
      if (e.detail?.productName) {
        setFormData((prev) => ({
          ...prev,
          enquiry: `Hello, I would like to enquire about MOHERA ${e.detail.productName}. Please share details regarding availability and ordering.`
        }));
      }
    };
    window.addEventListener('mohera-prefill-enquiry', handlePrefill);
    return () => window.removeEventListener('mohera-prefill-enquiry', handlePrefill);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.enquiry) {
      alert('Please fill in all fields (Name, Email, Phone, and Enquiry).');
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', enquiry: '' });
      setSubmitted(false);
    }, 5000);
  };

  return (
    <section id="enquiry-section" className="contact-section">
      <div id="contact-section" style={{ position: 'relative', top: '-80px', visibility: 'hidden' }}></div>
      <div className="section-header">
        <div className="section-eyebrow font-royal">
          <MessageSquare size={14} className="gold-icon" />
          <span>Concierge & Assistance</span>
        </div>
        <h2 className="section-title font-royal">
          Send An <span className="gold-gradient-text">Enquiry</span>
        </h2>
        <p className="section-subtitle font-poetic">
          Have a question about our fragrances, orders, or bespoke gifting? Submit your enquiry below.
        </p>
      </div>

      <div className="contact-grid-container">
        {/* Contact Info Column */}
        <div className="contact-info-column">
          <div className="contact-card luxury-glass">
            <div className="contact-icon-box">
              <Mail size={20} className="gold-icon" />
            </div>
            <div>
              <span className="contact-card-label font-royal">Direct Email</span>
              <a href="mailto:mohera.perfumes@gmail.com" className="contact-card-value">
                mohera.perfumes@gmail.com
              </a>
            </div>
          </div>

          <div className="contact-card luxury-glass">
            <div className="contact-icon-box">
              <Phone size={20} className="gold-icon" />
            </div>
            <div>
              <span className="contact-card-label font-royal">Direct Mobile</span>
              <a href="tel:+919031142434" className="contact-card-value font-royal">
                +91 9031142434
              </a>
            </div>
          </div>
        </div>

        {/* Enquiry Form Column */}
        <div className="contact-form-column luxury-glass">
          <div className="contact-form-header">
            <h3 className="contact-form-title font-royal">Enquiry Form</h3>
            <p className="contact-form-subtitle font-poetic">
              Fill in your details and our team will get back to you promptly.
            </p>
          </div>

          {submitted ? (
            <div className="contact-success-state">
              <div className="contact-success-icon">
                <Check size={28} />
              </div>
              <h4 className="font-royal">Enquiry Received</h4>
              <p className="font-poetic">
                Thank you, <strong>{formData.name || 'valued customer'}</strong>. We have received your enquiry and will contact you via email or phone within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              {/* 1. Name */}
              <div className="contact-input-group">
                <label className="contact-label font-royal">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="contact-input"
                />
              </div>

              {/* 2. Email */}
              <div className="contact-input-group">
                <label className="contact-label font-royal">Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="contact-input"
                />
              </div>

              {/* 3. Phone */}
              <div className="contact-input-group">
                <label className="contact-label font-royal">Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="contact-input"
                />
              </div>

              {/* 4. Enquiry */}
              <div className="contact-input-group">
                <label className="contact-label font-royal">Enquiry</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Write your fragrance enquiry, order questions, or notes..."
                  value={formData.enquiry}
                  onChange={(e) => setFormData({ ...formData, enquiry: e.target.value })}
                  className="contact-textarea"
                />
              </div>

              <button type="submit" className="btn-gold contact-submit-btn font-royal">
                <span>Submit Enquiry</span>
                <Send size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
