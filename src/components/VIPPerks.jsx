import React from 'react';
import { Award, Gift, Sparkles, Key } from 'lucide-react';

export default function VIPPerks() {
  const perks = [
    {
      icon: Award,
      title: "Serialized Allocation",
      desc: "Guaranteed priority access to one of the strictly 500 numbered flacons in inaugural Batch 01."
    },
    {
      icon: Gift,
      title: "Discovery Miniature",
      desc: "Receive a complimentary 5ml velvet travel extrait vial with your personalized certificate."
    },
    {
      icon: Key,
      title: "Private Salon Entry",
      desc: "Invitation to exclusive pre-launch digital unveiling and private tasting appointments."
    },
    {
      icon: Sparkles,
      title: "Signature Monogramming",
      desc: "Bespoke 24-karat gold foil calligraphy of your initials on the obsidian cap upon launch."
    }
  ];

  return (
    <section className="perks-section">
      <div className="section-header">
        <span className="section-eyebrow font-royal">Privileges of the Vault</span>
        <h2 className="section-title font-royal">
          The <span className="gold-gradient-text">Private Reserve</span> Experience
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
