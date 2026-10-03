import React from 'react';
import { Award, Gift, Sparkles, Truck } from 'lucide-react';

export default function VIPPerks() {
  const perks = [
    {
      icon: Award,
      title: "First Edition Bottle",
      desc: "Guaranteed bottle from our limited first batch of only 500 pieces."
    },
    {
      icon: Gift,
      title: "Free Sample Vial",
      desc: "Receive a free travel-size sample vial with your pre-launch order."
    },
    {
      icon: Sparkles,
      title: "Early Access Pricing",
      desc: "Special launch day pricing reserved exclusively for waitlist members."
    },
    {
      icon: Truck,
      title: "Priority Shipping",
      desc: "Fast, insured courier delivery sent directly to your door."
    }
  ];

  return (
    <section className="perks-section">
      <div className="section-header">
        <span className="section-eyebrow font-royal">VIP Benefits</span>
        <h2 className="section-title font-royal">
          Why Join The <span className="gold-gradient-text">Waitlist</span>
        </h2>
      </div>

      <div className="perks-grid">
        {perks.map((perk, idx) => {
          const IconComponent = perk.icon;
          return (
            <div key={idx} className="perk-card luxury-glass">
              <div className="perk-icon-wrapper">
                <IconComponent size={24} className="gold-icon" />
              </div>
              <h3 className="perk-title font-royal">{perk.title}</h3>
              <p className="perk-desc">{perk.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
